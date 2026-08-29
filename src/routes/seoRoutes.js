import { Router } from 'express';
import { handleYouTubeSEO, handleScriptSEO } from '../controllers/seoController.js';

const router = Router();

// POST /api/seo/youtube — Generate SEO from YouTube URL
router.post('/youtube', handleYouTubeSEO);

// POST /api/seo/script — Generate SEO from video script
router.post('/script', handleScriptSEO);

export default router;
