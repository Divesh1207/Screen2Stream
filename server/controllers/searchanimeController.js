

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import Screenshot from '../models/Screenshot.js';
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for delaying the retry
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;  // Maximum number of retry attempts
const RETRY_DELAY = 5000;  // Delay between retries (in milliseconds)

export const searchAnime = async (req, res) => {
  let retries = 0;
  let success = false;

  while (retries < MAX_RETRIES && !success) {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing imageUrl' });
      }

      const fileName = path.basename(new URL(imageUrl).pathname);
      const imagePath = path.join(__dirname, '../uploads', fileName);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: 'Image file not found' });
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));

      const sauceNaoResponse = await axios.post(process.env.NAO_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        params: {
          api_key: process.env.NAO_API_KEY,
          output_type: 2,
          numres: 10,
          db: 999,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const sauceData = sauceNaoResponse.data;
      if (!sauceData || !sauceData.results || sauceData.results.length === 0) {
        return res.status(404).json({ message: 'No anime found on SearchAnime' });
      }

      const sauceResults = sauceData.results.map(result => ({
        similarity: result.header.similarity,
        source: result.data.source || 'unknown',
        thumbnail: result.header.thumbnail,
        eng_name: result.data.eng_name || 'Unknown',
        jp_name: result.data.jp_name || 'Unknown',
        anilist_id: result.data.anilist_id || 'unknown',
        anime_title: result.data.title || 'Unknown',
      }));

      const screenshot = await Screenshot.findOneAndUpdate(
        { screenshotId: path.basename(imagePath) },
        { sauceNaoData: sauceResults },
        { new: true, upsert: true }
      );

      res.status(200).json({ sauceNao: sauceResults });
      success = true;  // Mark the operation as successful if no errors

    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('Rate limit hit, retrying after delay...');
        retries += 1;
        await delay(RETRY_DELAY);  // Wait before retrying
      } else {
        console.error('Error in searchAnime function:', error);
        return res.status(500).json({ message: 'Error processing request', error: error.message });
      }
    }
  }

  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
};
