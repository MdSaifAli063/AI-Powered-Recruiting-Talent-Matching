const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

let openai = null;
if (process.env.NVIDIA_NIM_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.NVIDIA_NIM_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });
}

const isDummyKey = (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) && !process.env.NVIDIA_NIM_API_KEY;

if (isDummyKey) {
  console.warn('⚠️ WARNING: No valid API Keys found. AI features will fail.');
}

function extractJSON(text) {
  const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
  const cleanText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  return JSON.parse(cleanText);
}

// ──────────────────────────────────────────────
// Helper to call AI (NVIDIA primary, Gemini fallback)
// ──────────────────────────────────────────────
async function callAIJSON(prompt) {
  if (isDummyKey) {
    const error = new Error('No API Key configured. Please add NVIDIA_NIM_API_KEY or GEMINI_API_KEY to your backend/.env file.');
    error.statusCode = 503;
    throw error;
  }

  // 1. Try NVIDIA First
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2048,
      });
      return extractJSON(completion.choices[0].message.content);
    } catch (e) {
      console.warn('⚠️ NVIDIA API Error, falling back to Gemini...', e.message);
    }
  }

  // 2. Fallback to Gemini
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return extractJSON(response.text());
  } catch (e) {
    console.error('❌ Gemini API Error:', e.message);

    if (e.message.includes('API_KEY_INVALID')) {
      const err = new Error('Your Gemini API Key is invalid.');
      err.statusCode = 401;
      throw err;
    }

    if (e.message.includes('SERVICE_DISABLED') || e.message.includes('not been used in project') || e.message.includes('403')) {
      const err = new Error('Gemini API is not enabled in your Google Cloud Project. Please enable it in the console.');
      err.statusCode = 503;
      throw err;
    }

    throw e;
  }
}

// ──────────────────────────────────────────────
// Resume Analysis
// ──────────────────────────────────────────────
exports.analyzeResume = async (resumeText) => {
  const prompt = `You are an expert AI resume analyst. Analyze the following resume text and return a detailed JSON analysis.

Resume Text:
${resumeText}

Return ONLY valid JSON with this exact structure:
{
  "parsedData": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "skills": ["array of all skills"],
    "technicalSkills": ["technical skills only"],
    "softSkills": ["soft skills only"],
    "experience": [{"title": "", "company": "", "duration": "", "description": "", "highlights": []}],
    "education": [{"degree": "", "institution": "", "year": "", "gpa": ""}],
    "projects": [{"name": "", "description": "", "technologies": [], "complexity": "low|medium|high"}],
    "certifications": [],
    "languages": [],
    "totalExperience": 0
  },
  "scores": {
    "overall": 0,
    "skillDepth": 0,
    "projectComplexity": 0,
    "careerGrowth": 0,
    "communicationClarity": 0,
    "educationRelevance": 0
  },
  "feedback": {
    "strengths": ["list of strengths"],
    "weaknesses": ["list of weaknesses"],
    "missingSkills": ["commonly expected skills missing from resume"],
    "improvements": ["specific actionable improvement suggestions"],
    "summary": "2-3 sentence overall summary"
  }
}

Score each dimension from 0-100. Be honest and detailed.`;

  return await callAIJSON(prompt);
};

// ──────────────────────────────────────────────
// Generate Embeddings (Fallback to Dummy if unavailable)
// ──────────────────────────────────────────────
exports.generateEmbedding = async (text) => {
  if (isDummyKey) return new Array(768).fill(0);

  if (openai) {
    try {
      const response = await openai.embeddings.create({
        input: text.substring(0, 8000),
        model: "nvidia/nv-embedqa-e5-v5",
        input_type: "query"
      });
      return response.data[0].embedding;
    } catch (e) {
      console.warn('⚠️ NVIDIA Embedding failed, falling back to Gemini...', e.message);
    }
  }

  try {
    // Attempt with standard embedding model
    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embedModel.embedContent(text.substring(0, 8000));
    return result.embedding.values;
  } catch (e) {
    console.warn('⚠️ Embedding model not found or unavailable for this key. Using zero-vector fallback.');
    return new Array(768).fill(0);
  }
};

// ──────────────────────────────────────────────
// Cosine Similarity
// ──────────────────────────────────────────────
exports.cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  // If we're using zero-vectors (fallback), return a random but consistent small score or 0
  if (vecA.every(v => v === 0)) return 0.5;

  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
};

// ──────────────────────────────────────────────
// Semantic Job Match Explanation
// ──────────────────────────────────────────────
exports.generateMatchExplanation = async (candidateProfile, jobDescription, matchScore) => {
  const prompt = `You are an expert recruiter AI. Given the candidate profile and job description, provide a semantic match analysis.

Candidate Skills & Experience: ${candidateProfile}
Job Description: ${jobDescription}
Calculated Match Score: ${matchScore}%

Return ONLY JSON:
{
  "explanation": "2-3 sentence natural language explanation of why this is a good or poor match",
  "strengths": ["top 3 matching strengths"],
  "gaps": ["top 3 skill/experience gaps"],
  "recommendation": "hire|consider|pass"
}`;

  return await callAIJSON(prompt);
};

// ──────────────────────────────────────────────
// Skill Gap Analysis
// ──────────────────────────────────────────────
exports.analyzeSkillGap = async (candidateSkills, jobDescription, jobTitle) => {
  const prompt = `You are a career development AI expert. Analyze the skill gap between the candidate and the target role.

Candidate's Current Skills: ${candidateSkills.join(', ')}
Target Job Title: ${jobTitle}
Job Description: ${jobDescription}

Return ONLY JSON:
{
  "missingSkills": [{"skill": "", "priority": "critical|important|nice-to-have", "reason": ""}],
  "matchingSkills": ["skills the candidate already has"],
  "learningPath": [
    {
      "skill": "",
      "priority": 1,
      "estimatedTime": "e.g. 2-4 weeks",
      "resources": ["course/resource name"],
      "description": "why this skill matters"
    }
  ],
  "overallReadiness": 0,
  "summary": "2-3 sentence summary of the candidate's readiness"
}

Sort learningPath by priority (1 = most urgent). overallReadiness is 0-100.`;

  return await callAIJSON(prompt);
};

// ──────────────────────────────────────────────
// AI Interview - Generate Next Question
// ──────────────────────────────────────────────
exports.generateInterviewQuestion = async (messages, jobTitle, candidateContext) => {
  if (isDummyKey) {
    const error = new Error('AI interviewer is currently offline (API keys not configured).');
    error.statusCode = 503;
    throw error;
  }

  const systemInstruction = `You are an expert technical interviewer for a ${jobTitle} position. 
Your goal is to evaluate the candidate's technical knowledge, problem-solving ability, and communication.
Ask one focused question at a time. Adapt your questions based on their responses.
Start with a warm welcome, then ask about 6-8 questions progressively (easy → medium → hard).
After each answer, briefly acknowledge it before asking the next question.
When you've asked enough questions, end with "INTERVIEW_COMPLETE" in your response.
Keep responses concise and professional.
${candidateContext ? `Candidate background: ${candidateContext}` : ''}`;

  if (openai) {
    try {
      const nimMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.1-70b-instruct",
        messages: nimMessages,
        temperature: 0.5,
        max_tokens: 400,
      });
      return completion.choices[0].message.content;
    } catch (e) {
      console.warn('⚠️ NVIDIA Chat failed, falling back to Gemini...', e.message);
    }
  }

  const history = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const chat = model.startChat({
    history: history.slice(0, -1),
    generationConfig: { maxOutputTokens: 400 }
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(`${systemInstruction}\n\nCandidate's last response: ${lastMessage}`);
  const response = await result.response;
  return response.text();
};

// ──────────────────────────────────────────────
// Generate Interview Report
// ──────────────────────────────────────────────
exports.generateInterviewReport = async (messages, jobTitle) => {
  const conversation = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are an expert recruiter. Review this interview transcript for a ${jobTitle} role and provide a detailed evaluation.

Transcript:
${conversation}

Return ONLY JSON:
{
  "technicalScore": 0,
  "communicationScore": 0,
  "overallScore": 0,
  "strengths": ["list of demonstrated strengths"],
  "weaknesses": ["list of areas to improve"],
  "recommendation": "strong-hire|hire|maybe|no-hire",
  "summary": "2-3 sentence executive summary",
  "detailedFeedback": "detailed paragraph feedback on technical and soft skills"
}

Score from 0-100. Be honest and constructive.`;

  return await callAIJSON(prompt);
};

// ──────────────────────────────────────────────
// Bias Detection
// ──────────────────────────────────────────────
exports.detectBias = async (jobDescription) => {
  const prompt = `You are an expert in inclusive language and workplace diversity. Analyze the following job description for biased, exclusive, or problematic language.

Job Description:
${jobDescription}

Return ONLY JSON:
{
  "biasScore": 0,
  "issues": [
    {
      "phrase": "the exact phrase",
      "type": "gendered|ageist|ableist|cultural|unnecessary-requirement|exclusionary",
      "severity": "high|medium|low",
      "explanation": "why this is problematic",
      "suggestion": "neutral alternative"
    }
  ],
  "positivePhrases": ["inclusive language already used"],
  "overallAssessment": "brief overall assessment",
  "rewrittenDescription": "full rewritten version with all bias removed"
}

biasScore: 0 = very biased, 100 = completely neutral/inclusive.`;

  return await callAIJSON(prompt);
};

// ──────────────────────────────────────────────
// Personalized Outreach Generator
// ──────────────────────────────────────────────
exports.generateOutreach = async (recruiterName, company, candidate, jobTitle, tone) => {
  const toneDescriptions = {
    professional: 'formal and professional',
    friendly: 'warm, friendly, and conversational',
    persuasive: 'compelling, enthusiastic, and persuasive'
  };

  const prompt = `Generate a personalized recruiter outreach message.

Recruiter: ${recruiterName} at ${company}
Candidate: ${candidate.name}
Candidate Skills: ${(candidate.skills || []).join(', ')}
Target Role: ${jobTitle}
Tone: ${toneDescriptions[tone] || 'professional'}

Return ONLY JSON:
{
  "subject": "email subject line",
  "message": "full outreach message (150-200 words, personalized to candidate's background)",
  "linkedinVersion": "shorter LinkedIn InMail version (under 100 words)"
}`;

  return await callAIJSON(prompt);
};

module.exports = exports;
