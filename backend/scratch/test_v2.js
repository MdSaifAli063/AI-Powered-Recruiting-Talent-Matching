require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testV2() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ gemini-2.0-flash is WORKING! Response:', response.text());
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testV2();
