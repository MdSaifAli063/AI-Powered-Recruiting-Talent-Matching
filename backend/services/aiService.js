const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  return JSON.parse(response.choices[0].message.content);
};

// ──────────────────────────────────────────────
// Generate Embeddings
// ──────────────────────────────────────────────
exports.generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000)
  });
  return response.data[0].embedding;
};

// ──────────────────────────────────────────────
// Cosine Similarity
// ──────────────────────────────────────────────
exports.cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// ──────────────────────────────────────────────
// Semantic Job Match Explanation
// ──────────────────────────────────────────────
exports.generateMatchExplanation = async (candidateProfile, jobDescription, matchScore) => {
  const prompt = `You are an expert recruiter AI. Given the candidate profile and job description, provide a semantic match analysis.

Candidate Skills & Experience: ${candidateProfile}
Job Description: ${jobDescription}
Semantic Match Score: ${matchScore}%

Return JSON:
{
  "explanation": "2-3 sentence natural language explanation of why this is a good or poor match",
  "strengths": ["top 3 matching strengths"],
  "gaps": ["top 3 skill/experience gaps"],
  "recommendation": "hire|consider|pass"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4
  });
  return JSON.parse(response.choices[0].message.content);
};

// ──────────────────────────────────────────────
// Skill Gap Analysis
// ──────────────────────────────────────────────
exports.analyzeSkillGap = async (candidateSkills, jobDescription, jobTitle) => {
  const prompt = `You are a career development AI expert. Analyze the skill gap between the candidate and the target role.

Candidate's Current Skills: ${candidateSkills.join(', ')}
Target Job Title: ${jobTitle}
Job Description: ${jobDescription}

Return JSON:
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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4
  });
  return JSON.parse(response.choices[0].message.content);
};

// ──────────────────────────────────────────────
// AI Interview - Generate Next Question
// ──────────────────────────────────────────────
exports.generateInterviewQuestion = async (messages, jobTitle, candidateContext) => {
  const systemPrompt = `You are an expert technical interviewer for a ${jobTitle} position. 
Your goal is to evaluate the candidate's technical knowledge, problem-solving ability, and communication.
Ask one focused question at a time. Adapt your questions based on their responses.
Start with a warm welcome, then ask about 6-8 questions progressively (easy → medium → hard).
After each answer, briefly acknowledge it before asking the next question.
When you've asked enough questions, end with "INTERVIEW_COMPLETE" in your response.
Keep responses concise and professional.
${candidateContext ? `Candidate background: ${candidateContext}` : ''}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ],
    temperature: 0.6,
    max_tokens: 400
  });

  return response.choices[0].message.content;
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

Return JSON:
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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });
  return JSON.parse(response.choices[0].message.content);
};

// ──────────────────────────────────────────────
// Bias Detection
// ──────────────────────────────────────────────
exports.detectBias = async (jobDescription) => {
  const prompt = `You are an expert in inclusive language and workplace diversity. Analyze the following job description for biased, exclusive, or problematic language.

Job Description:
${jobDescription}

Return JSON:
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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });
  return JSON.parse(response.choices[0].message.content);
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

Return JSON:
{
  "subject": "email subject line",
  "message": "full outreach message (150-200 words, personalized to candidate's background)",
  "linkedinVersion": "shorter LinkedIn InMail version (under 100 words)"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content);
};

module.exports = exports;
