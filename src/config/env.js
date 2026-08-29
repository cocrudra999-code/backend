import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['GEMINI_API_KEY'];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`⚠️ Warning: Missing environment variable: ${varName}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
