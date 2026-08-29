import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetch real YouTube video details (Title, Author, Description, Keywords, Transcript)
 * WITHOUT requiring any YouTube Data API key.
 */
export async function fetchYouTubeDetails(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = '';
  let author = '';
  let description = '';
  let keywords = [];
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let transcript = '';

  // 1. Fetch oEmbed metadata (reliable, official, no auth)
  try {
    const oembedRes = await axios.get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { timeout: 5000 }
    );
    if (oembedRes.data) {
      title = oembedRes.data.title || title;
      author = oembedRes.data.author_name || author;
      thumbnail = oembedRes.data.thumbnail_url || thumbnail;
    }
  } catch (err) {
    console.warn(`oEmbed fetch failed for ${videoId}:`, err.message);
  }

  // 2. Fetch page HTML to get description and meta keywords
  try {
    const pageRes = await axios.get(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 6000,
    });

    const html = pageRes.data || '';

    // Extract title if not present
    if (!title) {
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) ||
                         html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - YouTube', '').trim();
      }
    }

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/i) ||
                      html.match(/<meta name="description" content="([^"]*)"/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    // Extract keywords
    const kwMatch = html.match(/<meta name="keywords" content="([^"]*)"/i);
    if (kwMatch && kwMatch[1]) {
      keywords = kwMatch[1].split(',').map((k) => k.trim()).filter(Boolean);
    }
  } catch (err) {
    console.warn(`HTML metadata scrape failed for ${videoId}:`, err.message);
  }

  // 3. Fetch transcript / captions if available
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcriptItems && transcriptItems.length > 0) {
      const fullText = transcriptItems.map((item) => item.text).join(' ');
      // Limit to ~2000 words
      const words = fullText.split(/\s+/);
      transcript = words.slice(0, 2000).join(' ');
    }
  } catch (err) {
    console.log(`Transcript not available for ${videoId}:`, err.message);
  }

  return {
    videoId,
    url: watchUrl,
    title: title || 'YouTube Video',
    author: author || 'Unknown Creator',
    description: description || '',
    keywords,
    thumbnail,
    transcript,
  };
}
