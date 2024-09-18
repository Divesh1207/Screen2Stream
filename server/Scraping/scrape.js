import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();
// Function to scrape dynamically for more anime streaming platforms
export const scrapeWebsites = async () => {
    try {
        const response = await axios.get(process.env.EVERYTHING_URL);

        const $ = cheerio.load(response.data);

        const websites = [];
        $('.section-item').each((index, item) => {
            try {
                const name = $(item).find('a').text().trim();
                const url = $(item).find('a').attr('data-link');
                const rank = parseInt($(item).attr('data-rank'), 10) || 0; // Default to 0 if undefined
                const filter = $(item).attr('data-filter') || '';
                const adFree = filter.toLowerCase().includes('ad-free'); // Use default empty string if undefined

                if (url && /anime|stream/i.test(url)) {
                    websites.push({ name, url, rank, adFree });
                }
            } catch (innerError) {
                console.error(`Error processing item: ${innerError.message}`);
            }
        });

        return websites;
    } catch (error) {
        console.error('Error scraping websites:', error);
        return [];
    }
};
