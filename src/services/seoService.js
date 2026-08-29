import { extractVideoId } from '../utils/youtubeParser.js';
import { cleanHashtags, cleanKeywords } from '../utils/responseFormatter.js';
import { analyzeWithGemini } from './geminiService.js';
import { fetchYouTubeDetails } from './videoFetcher.js';

/**
 * Full pipeline: YouTube URL → Real Video Details + Transcript → Gemini → Accurate SEO result.
 */
export async function generateSEOFromYouTube(url) {
  // 1. Validate URL & extract Video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
  }

  // 2. Fetch real metadata, description, tags, and transcript (no API key needed!)
  const videoDetails = await fetchYouTubeDetails(videoId);

  // 3. Send real context to Gemini for analysis
  const geminiResult = await analyzeWithGemini('youtube', { url, details: videoDetails });

  // 4. Clean and format results
  const result = formatSEOResult(geminiResult);

  // 5. Attach source info
  result.source = {
    videoId,
    title: videoDetails.title || geminiResult.videoTitle || 'YouTube Video',
    author: videoDetails.author || null,
    thumbnail: videoDetails.thumbnail || null,
    topic: geminiResult.videoTopic || null,
    hasTranscript: !!videoDetails.transcript,
  };

  return result;
}

/**
 * Full pipeline: Script text → Gemini → SEO result.
 */
export async function generateSEOFromScript(script) {
  if (!script || typeof script !== 'string' || script.trim().length < 20) {
    throw new Error('Script is too short. Please provide at least a few sentences.');
  }

  // Trim script to reasonable length (max ~5000 words)
  const words = script.trim().split(/\s+/);
  const trimmedScript = words.length > 5000
    ? words.slice(0, 5000).join(' ') + '...'
    : script.trim();

  // Send to Gemini for analysis
  const geminiResult = await analyzeWithGemini('script', { script: trimmedScript });

  // Clean and format results
  const result = formatSEOResult(geminiResult);

  // Attach detected topic info (script-specific)
  result.detectedTopic = geminiResult.detectedTopic || null;
  result.detectedSubTopics = geminiResult.detectedSubTopics || [];

  return result;
}

/**
 * Format and clean the raw Gemini result into a standardized SEO result.
 */
function formatSEOResult(raw) {
  return {
    hashtags: cleanHashtags(raw.hashtags || []),
    relatedHashtags: cleanHashtags(raw.relatedHashtags || []),
    keywords: cleanKeywords(raw.keywords || []),
    longTailKeywords: cleanKeywords(raw.longTailKeywords || []),
    titleSuggestions: (raw.titleSuggestions || []).filter((t) => typeof t === 'string' && t.trim()),
    seoScores: (raw.seoScores || []).map((score) => ({
      tag: score.tag || '',
      relevance: Math.min(100, Math.max(0, score.relevance || 0)),
      searchVolume: Math.min(100, Math.max(0, score.searchVolume || 0)),
      competition: Math.min(100, Math.max(0, score.competition || 0)),
      overall: Math.min(100, Math.max(0, score.overall || 0)),
    })),
  };
}
