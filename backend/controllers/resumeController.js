const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const User = require('../models/User');
const aiService = require('../services/aiService');

// POST /api/resume/upload
exports.uploadResume = async (req, res, next) => {
  try {
    let rawText = '';
    let fileName = 'Pasted Text';
    let fileUrl = '';

    if (req.file) {
      const filePath = req.file.path;
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;

      // Extract text from file
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        rawText = pdfData.text;
      } else if (req.file.mimetype === 'text/plain') {
        rawText = fs.readFileSync(filePath, 'utf8');
      }
    } else if (req.body.resumeText) {
      rawText = req.body.resumeText;
    } else {
      return res.status(400).json({ success: false, message: 'No file or text provided.' });
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: req.file ? 'Could not extract text from this file. Please try a different format or paste the text directly.' : 'Resume text is empty.' 
      });
    }

    // Delete existing resume if any
    await Resume.deleteMany({ candidate: req.user.id });

    // Create resume record
    const resume = await Resume.create({
      candidate: req.user.id,
      fileName,
      fileUrl,
      rawText,
      isAnalyzed: false
    });

    // Update user resumeUrl and summary text
    await User.findByIdAndUpdate(req.user.id, { 
      resumeUrl: fileUrl, 
      resumeText: rawText.substring(0, 5000) 
    });

    res.status(201).json({
      success: true,
      message: req.file ? 'Resume uploaded successfully!' : 'Text saved successfully!',
      data: { id: resume._id, fileName: resume.fileName, fileUrl }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/resume/analyze (analyze existing resume or text)
exports.analyzeResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ candidate: req.user.id });
    let rawText = '';

    if (resume) {
      rawText = resume.rawText;
    } else if (req.body.resumeText) {
      rawText = req.body.resumeText;
      resume = await Resume.create({
        candidate: req.user.id,
        rawText,
        fileName: 'Pasted Text',
        isAnalyzed: false
      });
    } else {
      return res.status(400).json({ success: false, message: 'No resume found. Please upload a resume first.' });
    }

    if (!rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume text is empty.' });
    }

    // AI Analysis
    const analysis = await aiService.analyzeResume(rawText);

    // Generate embedding for semantic matching
    let embedding = [];
    try {
      const skillsText = (analysis.parsedData?.skills || []).join(' ');
      const expText = (analysis.parsedData?.experience || []).map(e => `${e.title} ${e.company} ${e.description}`).join(' ');
      embedding = await aiService.generateEmbedding(`${skillsText} ${expText} ${rawText.substring(0, 2000)}`);
    } catch (e) {
      console.warn('Embedding failed:', e.message);
    }

    // Update resume
    const updated = await Resume.findByIdAndUpdate(resume._id, {
      parsedData: analysis.parsedData,
      scores: analysis.scores,
      feedback: analysis.feedback,
      embedding,
      isAnalyzed: true,
      analyzedAt: new Date()
    }, { new: true });

    // Update user profile with extracted data
    const updates = {
      profileScore: analysis.scores?.overall || 0,
    };
    if (analysis.parsedData?.skills?.length) updates.skills = analysis.parsedData.skills;
    if (analysis.parsedData?.experience?.length) updates.experience = analysis.parsedData.experience;
    if (analysis.parsedData?.education?.length) updates.education = analysis.parsedData.education;
    if (analysis.parsedData?.name) updates.name = analysis.parsedData.name;

    await User.findByIdAndUpdate(req.user.id, updates);

    res.json({ success: true, message: 'Resume analyzed successfully!', data: updated });
  } catch (error) {
    next(error);
  }
};

// GET /api/resume/me
exports.getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user.id });
    if (!resume) {
      return res.status(200).json({ success: true, data: null, message: 'No resume found.' });
    }
    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

// POST /api/resume/skill-gap
exports.analyzeSkillGap = async (req, res, next) => {
  try {
    const { jobDescription, jobTitle } = req.body;
    if (!jobDescription || !jobTitle) {
      return res.status(400).json({ success: false, message: 'jobDescription and jobTitle are required.' });
    }

    const user = await User.findById(req.user.id);
    const skills = user.skills?.length ? user.skills : [];

    if (!skills.length) {
      return res.status(400).json({ success: false, message: 'Please add skills to your profile or analyze your resume first.' });
    }

    const analysis = await aiService.analyzeSkillGap(skills, jobDescription, jobTitle);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// POST /api/resume/match-job
exports.matchJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const Job = require('../models/Job');

    const resume = await Resume.findOne({ candidate: req.user.id, isAnalyzed: true });
    const job = await Job.findById(jobId);

    if (!resume) return res.status(200).json({ success: false, message: 'Please analyze your resume first.' });
    if (!job) return res.status(200).json({ success: false, message: 'Job not found.' });

    let matchScore = 0;
    if (resume.embedding?.length && job.embedding?.length) {
      const similarity = aiService.cosineSimilarity(resume.embedding, job.embedding);
      matchScore = Math.round(similarity * 100);
    }

    const candidateProfile = `Skills: ${(resume.parsedData?.skills || []).join(', ')}. Experience: ${(resume.parsedData?.experience || []).map(e => e.title).join(', ')}`;
    const explanation = await aiService.generateMatchExplanation(candidateProfile, job.description, matchScore);

    res.json({ success: true, data: { matchScore, ...explanation, job: { title: job.title, company: job.company } } });
  } catch (error) {
    next(error);
  }
};
