import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['GEMINI_API_KEY'];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    console.error(`   Copy .env.example to .env and fill in your API key.`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
