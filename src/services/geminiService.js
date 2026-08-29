import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);



/**
 * Build the SEO analysis prompt for a YouTube URL with real fetched metadata.
 */
function buildYouTubePrompt(details) {
  let videoContent = `
Video Title: ${details.title}
Channel/Creator: ${details.author}
Description: ${details.description || 'Not provided'}
Existing Tags: ${details.keywords?.join(', ') || 'None'}
Video URL: ${details.url}
`;

  if (details.transcript) {
    videoContent += `\nSpoken Video Transcript:\n${details.transcript}\n`;
  }

  return `You are an expert YouTube SEO specialist with deep knowledge of YouTube's algorithm and hashtag system.

Analyze the following REAL YouTube video information and generate tailored, high-converting SEO hashtags and keywords.

${videoContent}

Generate the following in valid JSON format:

{
  "videoTitle": "${details.title}",
  "videoTopic": "Specific main topic of this video",
  "hashtags": ["#Tag1", "#Tag2", ...],
  "relatedHashtags": ["#Related1", "#Related2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "longTailKeywords": ["long tail keyword 1", "long tail keyword 2", ...],
  "titleSuggestions": ["SEO Title 1", "SEO Title 2", ...],
  "seoScores": [
    {"tag": "#Tag1", "relevance": 95, "searchVolume": 85, "competition": 70, "overall": 88},
    ...
  ]
}

Rules:
1. Generate exactly 10 primary hashtags that are directly relevant to this specific video topic and commonly searched on YouTube.
2. Generate exactly 10 related/broader discovery hashtags.
3. Generate 15 SEO keywords (short, 1-3 words each).
4. Generate 5 long-tail keywords (4-8 words, natural search queries).
5. Generate 3 SEO-optimized title suggestions for this video.
6. For seoScores, score the top 5 primary hashtags on: relevance (0-100), searchVolume (0-100), competition (0-100), and overall (0-100).
7. All hashtags must be in #CamelCase format suitable for YouTube.
8. Do NOT include spaces within hashtags.
9. Do NOT generate generic or off-topic hashtags. Must be strictly relevant to "${details.title}".
10. Return ONLY valid JSON, no markdown formatting.`;
}

/**
 * Build the SEO analysis prompt for a video script.
 */
function buildScriptPrompt(script) {
  return `You are an expert YouTube SEO specialist with deep knowledge of YouTube's algorithm and hashtag system.

Analyze the following video script and generate comprehensive SEO data for a YouTube video based on this content.

Script:
${script}

Generate the following in valid JSON format:

{
  "detectedTopic": "Main topic of the script",
  "detectedSubTopics": ["Sub topic 1", "Sub topic 2", ...],
  "hashtags": ["#Tag1", "#Tag2", ...],
  "relatedHashtags": ["#Related1", "#Related2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "longTailKeywords": ["long tail keyword 1", "long tail keyword 2", ...],
  "titleSuggestions": ["Title Suggestion 1", "Title Suggestion 2", ...],
  "seoScores": [
    {"tag": "#Tag1", "relevance": 95, "searchVolume": 85, "competition": 70, "overall": 88},
    ...
  ]
}

Rules:
1. First identify the main topic and sub-topics from the script.
2. Generate exactly 10 primary hashtags that are highly relevant and commonly searched on YouTube.
3. Generate exactly 10 related/broader hashtags for discovery.
4. Generate 15 SEO keywords (short, 1-3 words each).
5. Generate 5 long-tail keywords (4-8 words, natural search queries).
6. Generate 3 SEO-optimized title suggestions based on the script content.
7. For seoScores, score the top 5 primary hashtags on: relevance (0-100), searchVolume (0-100), competition (0-100), and overall (0-100).
8. All hashtags must be in #CamelCase format suitable for YouTube.
9. Do NOT include spaces within hashtags.
10. Do NOT generate irrelevant or generic hashtags like #video or #youtube.
11. Focus on hashtags that actual YouTube viewers would search for.
12. Return ONLY valid JSON, no markdown formatting.`;
}

/**
 * Analyze content with Gemini and return structured SEO data.
 */
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

/**
 * Analyze content with Gemini and return structured SEO data.
 * Tries candidate models in order if one is unavailable.
 */
export async function analyzeWithGemini(type, data) {
  let prompt;

  if (type === 'youtube') {
    prompt = buildYouTubePrompt(data.details || { url: data.url, title: 'YouTube Video' });
  } else if (type === 'script') {
    prompt = buildScriptPrompt(data.script);
  } else {
    throw new Error('Invalid analysis type');
  }

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse Gemini response as JSON');
        }
      }

      return parsed;
    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}. Trying next candidate...`);
      lastError = error;
    }
  }

  console.error('All Gemini candidate models failed:', lastError?.message);
  throw new Error(`AI analysis failed: ${lastError?.message}`);
}

