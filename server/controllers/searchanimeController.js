


import axios from 'axios';
import dotenv from 'dotenv';
import Screenshot from '../models/Screenshot.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

// Helper function for delaying the retry
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const searchAnime = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    console.error('No image URL provided');
    return res.status(400).json({ message: 'No image URL provided' });
  }

  console.log('Received image URL for search:', imageUrl);

  let retries = 0;
  let success = false;

  while (retries < MAX_RETRIES && !success) {
    try {
      console.log(`Attempt ${retries + 1} to search anime`);

      console.log('Preparing request for SauceNAO API');
      const sauceNaoResponse = await axios.get(process.env.NAO_API_URL, {
        params: {
          api_key: process.env.NAO_API_KEY,
          url: imageUrl,
          output_type: 2,
          numres: 10,
          db: 999,
        },
      });

      console.log('Received response from SauceNAO API');
      const sauceData = sauceNaoResponse.data;
      if (!sauceData || !sauceData.results || sauceData.results.length === 0) {
        console.log('No anime found in SauceNAO results');
        return res.status(404).json({ message: 'No anime found on SearchAnime' });
      }

      console.log('Processing SauceNAO results');
      const sauceResults = sauceData.results.map(result => ({
        similarity: result.header.similarity,
        source: result.data.source || 'unknown',
        thumbnail: result.header.thumbnail,
        eng_name: result.data.eng_name || 'Unknown',
        jp_name: result.data.jp_name || 'Unknown',
        anilist_id: result.data.anilist_id || 'unknown',
        anime_title: result.data.title || 'Unknown',
      }));

      console.log('Updating database with search results');
      const screenshotId = new URL(imageUrl).pathname.split('/').pop();
      const screenshot = await Screenshot.findOneAndUpdate(
        { screenshotId: screenshotId },
        { sauceNaoData: sauceResults },
        { new: true, upsert: true }
      );
      console.log('Database updated with search results');

      res.status(200).json({ sauceNao: sauceResults });
      console.log('Search results sent to client');
      success = true;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('Rate limit hit, retrying after delay...');
        retries += 1;
        await delay(RETRY_DELAY);
      } else {
        console.error('Error in searchAnime function:', error);
        return res.status(500).json({ message: 'Error processing request', error: error.message });
      }
    }
  }

  if (!success) {
    console.log('Max retries reached. Unable to complete the search.');
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
};