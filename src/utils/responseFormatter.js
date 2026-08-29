/**
 * Send a success response.
 */
export function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send an error response.
 */
export function errorResponse(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Clean and deduplicate hashtags.
 * Ensures all hashtags start with # and removes duplicates (case-insensitive).
 */
export function cleanHashtags(hashtags) {
  if (!Array.isArray(hashtags)) return [];

  const seen = new Set();
  const cleaned = [];

  for (let tag of hashtags) {
    if (typeof tag !== 'string') continue;

    // Ensure starts with #
    tag = tag.trim();
    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }

    // Remove spaces within hashtag
    tag = tag.replace(/\s+/g, '');

    // Deduplicate (case-insensitive)
    const lower = tag.toLowerCase();
    if (!seen.has(lower) && tag.length > 1) {
      seen.add(lower);
      cleaned.push(tag);
    }
  }

  return cleaned;
}

/**
 * Clean keywords list — deduplicate and trim.
 */
export function cleanKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];

  const seen = new Set();
  const cleaned = [];

  for (const kw of keywords) {
    if (typeof kw !== 'string') continue;
    const trimmed = kw.trim().toLowerCase();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      cleaned.push(kw.trim());
    }
  }

  return cleaned;
}
