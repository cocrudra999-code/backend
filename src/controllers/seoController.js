import { generateSEOFromYouTube, generateSEOFromScript } from '../services/seoService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { isValidYouTubeUrl } from '../utils/youtubeParser.js';

/**
 * POST /api/seo/youtube
 * Generate SEO data from a YouTube video URL.
 */
export async function handleYouTubeSEO(req, res) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return errorResponse(res, 'Please provide a YouTube URL.', 400);
    }

    if (!isValidYouTubeUrl(url)) {
      return errorResponse(res, 'Invalid YouTube URL format.', 400);
    }

    const result = await generateSEOFromYouTube(url);
    return successResponse(res, result);
  } catch (error) {
    console.error('YouTube SEO Error:', error.message);
    return errorResponse(res, error.message, error.message.includes('not found') ? 404 : 500);
  }
}

/**
 * POST /api/seo/script
 * Generate SEO data from a video script.
 */
export async function handleScriptSEO(req, res) {
  try {
    const { script } = req.body;

    if (!script || typeof script !== 'string') {
      return errorResponse(res, 'Please provide a video script.', 400);
    }

    if (script.trim().length < 20) {
      return errorResponse(res, 'Script is too short. Please provide at least a few sentences.', 400);
    }

    const result = await generateSEOFromScript(script);
    return successResponse(res, result);
  } catch (error) {
    console.error('Script SEO Error:', error.message);
    return errorResponse(res, error.message, 500);
  }
}
