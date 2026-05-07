require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testV1() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ gemini-1.5-flash-latest is WORKING!');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testV1();
