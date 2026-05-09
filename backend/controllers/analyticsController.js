const User = require('../models/User');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

// GET /api/analytics/recruiter
exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    const [jobs, totalCandidates, interviews] = await Promise.all([
      Job.find({ postedBy: recruiterId }),
      User.countDocuments({ role: 'candidate' }),
      Interview.find({}).populate('candidate', 'name')
    ]);

    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
    const totalHired = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'hired').length, 0);
    const totalInterviewed = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'interview').length, 0);

    // Match score distribution
    const allApplicants = jobs.flatMap(j => j.applicants);
    const scoreDistribution = {
      excellent: allApplicants.filter(a => a.matchScore >= 80).length,
      good: allApplicants.filter(a => a.matchScore >= 60 && a.matchScore < 80).length,
      fair: allApplicants.filter(a => a.matchScore >= 40 && a.matchScore < 60).length,
      poor: allApplicants.filter(a => a.matchScore < 40).length
    };

    // Top candidates across all jobs
    const topCandidates = await User.find({ role: 'candidate', profileScore: { $gt: 0 } })
      .select('name title skills profileScore avatar location')
      .sort('-profileScore')
      .limit(8);

    // Job performance
    const jobPerformance = jobs.map(j => ({
      id: j._id,
      title: j.title,
      applications: j.applicants.length,
      views: j.views || 0,
      avgMatchScore: j.applicants.length
        ? Math.round(j.applicants.reduce((s, a) => s + (a.matchScore || 0), 0) / j.applicants.length)
        : 0
    })).sort((a, b) => b.applications - a.applications);

    // Status funnel
    const funnelData = {
      applied: allApplicants.filter(a => a.status === 'applied').length,
      screening: allApplicants.filter(a => a.status === 'screening').length,
      interview: allApplicants.filter(a => a.status === 'interview').length,
      offer: allApplicants.filter(a => a.status === 'offer').length,
      hired: allApplicants.filter(a => a.status === 'hired').length,
      rejected: allApplicants.filter(a => a.status === 'rejected').length
    };

    res.json({
      success: true,
      data: {
        overview: { totalJobs, totalApplications, totalCandidates, totalHired, totalInterviewed },
        scoreDistribution,
        topCandidates,
        jobPerformance,
        funnelData
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/candidate
exports.getCandidateAnalytics = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const [user, resume, interviews, appliedJobsCount] = await Promise.all([
      User.findById(candidateId).populate('appliedJobs', 'title company type level'),
      Resume.findOne({ candidate: candidateId }),
      Interview.find({ candidate: candidateId }).select('-messages'),
      User.findById(candidateId).select('appliedJobs')
    ]);

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgInterviewScore = completedInterviews.length
      ? Math.round(completedInterviews.reduce((s, i) => s + (i.report?.overallScore || 0), 0) / completedInterviews.length)
      : 0;

    // Fetch top 4 active jobs as recommendations
    const topJobs = await Job.find({ isActive: true })
      .sort('-createdAt')
      .limit(4)
      .select('title company location type level createdAt');

    // Calculate acceptance/rejection stats
    const allJobsWithApplications = await Job.find({ 'applicants.candidate': candidateId });
    let totalAccepted = 0;
    let totalRejected = 0;

    allJobsWithApplications.forEach(j => {
      const app = j.applicants.find(a => a.candidate.toString() === candidateId);
      if (app) {
        if (['interview', 'offer', 'hired'].includes(app.status)) totalAccepted++;
        if (app.status === 'rejected') totalRejected++;
      }
    });

    res.json({
      success: true,
      data: {
        profileScore: user.profileScore || 0,
        totalApplications: user.appliedJobs?.length || 0,
        totalInterviews: interviews.length,
        totalAccepted,
        totalRejected,
        completedInterviews: completedInterviews.length,
        avgInterviewScore,
        resumeAnalyzed: !!resume?.isAnalyzed,
        resumeScore: resume?.scores?.overall || 0,
        skills: user.skills || [],
        appliedJobs: user.appliedJobs || [],
        topJobs,
        interviewHistory: completedInterviews.map(i => ({
          id: i._id,
          jobTitle: i.jobTitle,
          score: i.report?.overallScore || 0,
          recommendation: i.report?.recommendation,
          date: i.completedAt || i.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
