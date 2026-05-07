require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testPro() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ gemini-1.5-pro is WORKING! Response:', response.text());
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testPro();
