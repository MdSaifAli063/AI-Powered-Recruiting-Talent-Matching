require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ Gemini API is WORKING! Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini API Still Failing:', error.message);
  }
}

testGemini();
