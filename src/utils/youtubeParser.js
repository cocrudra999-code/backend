/**
 * Extract YouTube Video ID from various URL formats.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://youtube.com/v/VIDEO_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&list=...
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    // Standard watch URL
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // Short URL
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URL
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Shorts URL
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Old embed format
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate if a string is a valid YouTube URL.
 */
export function isValidYouTubeUrl(url) {
  return extractVideoId(url) !== null;
}
