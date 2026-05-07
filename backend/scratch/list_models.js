require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no easy way to list models with the SDK without a project ID usually,
    // but we can try to use gemini-pro which is the most stable.
    console.log('Testing with gemini-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ gemini-pro is WORKING! Response:', response.text());
  } catch (error) {
    console.error('❌ gemini-pro failed:', error.message);
  }
}

listModels();
