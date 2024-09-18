import express from 'express';
import { uploadScreenshot } from '../controllers/uploadController.js'; // Adjust based on your file structure
import { searchAnime } from '../controllers/searchanimeController.js'; // Adjust based on your file structure
import { fetchStreamingLinks } from '../controllers/streaminglinksController.js'; // Adjust based on your file structure
 import { login, signup } from '../controllers/authController.js';
 import { queryAniList } from '../controllers/aniListController.js';
const router = express.Router();
 
// Upload routes
router.post('/upload', uploadScreenshot);
 

// API interaction routes
router.post('/searchanime', searchAnime);
router.post('/anilistquery', queryAniList);
router.get('/streaminglinks', fetchStreamingLinks);
router.post('/login', login); // Changed to POST for consistency
router.post('/signup', signup);

// Results route
// router.get('/results/:screenshotId', getResults);

export default router;
