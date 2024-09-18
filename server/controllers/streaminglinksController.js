


import axios from 'axios';
import * as cheerio from 'cheerio';
import randomUseragent from 'random-useragent';
import { scrapeWebsites } from '../Scraping/scrape.js';
import dotenv from 'dotenv';
dotenv.config();
// Function to format and encode anime titles for URLs
const formatTitleForUrl = (title, site) => {
    switch (site) {
        case 'gogoanime':
            return encodeURIComponent(title.trim().replace(/\s+/g, '-').toLowerCase());
        case 'crunchyroll':
            return encodeURIComponent(title.trim().replace(/\s+/g, '%20'));
        case 'animepahe':
            return encodeURIComponent(title.trim().replace(/\s+/g, '-'));
        default:
            return encodeURIComponent(title.trim().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-'));
    }
};



// Function to validate the URLs
const validateUrlWithAxios = async (url, title, retries = 3, timeout = 5000, initialDelay = 500) => {
    const validate = async (url, title) => {
        try {
            if (!url) throw new Error('URL is undefined');
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': randomUseragent.getRandom(),
                    'Referer': 'https://google.com',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout
            });

            if (response.status !== 200) {
                console.warn(`Received non-200 status code: ${response.status}`);
                return false;
            }

            const $ = cheerio.load(response.data);
            const pageContent = $('body').text().toLowerCase();

            const notFoundPatterns = ['not found', '404', 'page not found', 'error 404'];
            if (notFoundPatterns.some(pattern => pageContent.includes(pattern))) {
                console.warn('Page contains "Not Found":', url);
                return false;
            }

            const titleRegex = new RegExp(title.toLowerCase().replace(/[\W_]+/g, '.*'), 'i');
            if (titleRegex.test(pageContent)) {
                console.log('Title found on:', url);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`Error validating URL: ${error.message}. URL: ${url}`);
            return false;
        }
    };

    let attempts = 0;
    while (attempts < retries) {
        const result = await validate(url, title);
        if (result) return true;
        attempts += 1;
        if (attempts < retries) {
            console.log(`Retrying URL validation... (${retries - attempts} retries left)`);
            await new Promise(resolve => setTimeout(resolve, initialDelay));
        }
        initialDelay *= 2; // Exponential backoff
    }

    console.warn('URL validation failed after retries:', url);
    return false;
};


// Function to detect and filter relevant streaming platforms
const detectStreamingPlatforms = (urls) => {
    const streamingPatterns = /anime|watch|stream|video|series|tv/i;
    const nonStreamingSites = ['forum', 'music', 'lyrics', 'quiz', 'news', 'stats', 'pictures', 'clips', 'reviews'];

    console.log('URLs before filtering:', urls);

    const filteredPlatforms = urls.filter(urlObj => {
        const url = urlObj.url.toLowerCase();
        const isStreaming = streamingPatterns.test(url);
        const isNotExcluded = !nonStreamingSites.some(term => url.includes(term));
        return isStreaming && isNotExcluded;
    });

    console.log('Filtered Streaming Platforms:', filteredPlatforms);

    return filteredPlatforms;
};

// Function to prioritize platforms dynamically based on rank, ad-free status, and title relevance
// Function to prioritize platforms based on rank, ad-free status, and additional criteria
const prioritizeQualityPlatforms = (platforms) => {
    // Define weights for different criteria
    const criteriaWeights = {
        'Easy download': 3,
        'Self-host': 2,
        'Dub friendly': 1,
        'Scraper': 0, // Adjust weights as needed
        'Hard-sub': 0,
        'Soft-sub': 0,
        'Old reliable': 0,
        'Modern interface': 0,
        'Disqus': 0,
        'Donghua only': 0
    };

    // Calculate scores and prioritize platforms
    const sortedPlatforms = platforms
        .map(platform => {
            // Calculate a score based on criteria weights
            const criteriaList = platform.filter ? platform.filter.split(', ').map(c => c.trim()) : [];
            const criteriaScore = criteriaList.reduce((total, criterion) => total + (criteriaWeights[criterion] || 0), 0);

            return {
                ...platform,
                score: criteriaScore + (platform.adFree ? 10 : 0) + platform.rank // Add rank and ad-free bonus
            };
        })
        .sort((a, b) => {
            if (a.adFree === b.adFree) {
                if (a.score === b.score) {
                    return b.rank - a.rank; // Higher rank first
                }
                return b.score - a.score; // Higher score first based on criteria
            }
            return b.adFree - a.adFree; // Ad-free first
        })
        .slice(0, 5); // Limit to top 5 platforms

    return sortedPlatforms;
};



// Function to dynamically embed anime title in URLs based on platform's known structure
const embedAnimeTitle = (platforms, title) => {
    return platforms.map(platform => {
        const encodedTitle = encodeURIComponent(title);
        let formattedTitle;
        const baseUrl = platform.url.split('?')[0]; // Remove any existing query parameters

        if (baseUrl.includes('animenana')) {
            // Convert spaces to '-' and lowercase for AnimeNana
            formattedTitle = title.replace(/\s+/g, '-').toLowerCase();
            return { ...platform, url: `${baseUrl}/animeserie/${formattedTitle}/` };
        }

        if (baseUrl.includes('hianime')) {
            // Convert spaces to '+' for HiAnime
            formattedTitle = encodedTitle.replace(/%20/g, '+'); // Convert %20 back to '+'
            return { ...platform, url: `${baseUrl}/search?keyword=${formattedTitle}` };
        }

        if (baseUrl.includes('gogoanimes')) {
            // Keep spaces as '%20' for GogoAnime
            formattedTitle = encodedTitle; // No need to change as encodeURIComponent handles this
            return { ...platform, url: `${baseUrl}?keyword=${formattedTitle}` };
        }

        // Default handling for other platforms
        formattedTitle = encodedTitle.replace(/%20/g, '+'); // Use '+' for spaces in query parameters
        return { ...platform, url: `${baseUrl}/search?q=${formattedTitle}` };
    });
};



// Function to handle fallback mechanism for each platform (using base URL without query)
const getPlatformFallback = (platform) => {
    switch (platform.name) {
        case 'Crunchyroll':
            return process.env.CRUNCHYROLL_URL;
        case 'BestDubbedAnime':
            return process.env.BEST_DUBBED_ANIME_URL;
        case 'AnimeTake':
            return process.env.ANIME_TAKE_URL;
        case 'GogoAnime':
            return process.env.GOGO_ANIME_URL;
        case 'HiAnime':
            return process.env.HI_ANIME_URL;
        default:
            // For unknown platforms, remove the query string and ensure it's just the base domain
            let baseUrl = platform.url.split('?')[0];  // Remove query string
            
            // Logic to remove any paths and leave only the base domain
            try {
                const urlObj = new URL(baseUrl);
                baseUrl = urlObj.origin;  
            } catch (error) {
                console.error('Invalid URL:', platform.url);
            }

            return baseUrl;
    }
};



// Function to validate and fallback for platforms
const getValidLinksWithFallback = async (urlsWithTitles) => {
    const concurrencyLimit = 10;
    const workingLinks = [];
    const validationPromises = urlsWithTitles.map(async (platform) => {
        try {
            const isValid = await validateUrlWithAxios(platform.url, platform.title);
            if (isValid) {
                workingLinks.push(platform);
            } else {
                console.warn(`'Not Found' detected for: ${platform.url}. Using fallback URL.`);
                const fallbackUrl = getPlatformFallback(platform);
                workingLinks.push({ ...platform, url: fallbackUrl });
            }
        } catch (error) {
            console.error(`Error validating URL: ${platform.url}`, error);
            const fallbackUrl = getPlatformFallback(platform);
            workingLinks.push({ ...platform, url: fallbackUrl });
        }
    });

    // Execute validation promises with concurrency limit
    for (let i = 0; i < validationPromises.length; i += concurrencyLimit) {
        await Promise.all(validationPromises.slice(i, i + concurrencyLimit));
        if (workingLinks.length >= 5) break;
    }

    return workingLinks.slice(0, 5); // Ensure only top 5 platforms are returned
};



// Main function to fetch and validate streaming links for a given anime title
export const fetchStreamingLinks = async (req, res) => {
    try {
        const animeTitle = req.query.english || 'Default Anime Title';
        const romaji = req.query.romaji;

        if (!animeTitle && !romaji) {
            return res.status(400).json({ message: 'At least one anime title is required' });
        }

        const formattedTitle = romaji ? formatTitleForUrl(romaji, 'gogoanime') : formatTitleForUrl(animeTitle, 'gogoanime');
        const normalTitle = romaji ? formatTitleForUrl(romaji, '') : formatTitleForUrl(animeTitle, '');

        // Static providers URLs embedding the title correctly
        const staticProviders = [
            {
                provider: 'Crunchyroll',
                url: `${process.env.BASE_URL}?q=${encodeURIComponent(animeTitle || romaji)}`
            }
        ];
        
        // Scrape dynamically for other websites
        const scrapedWebsites = await scrapeWebsites();
        console.log('Scraped websites before filtering:', scrapedWebsites);

        // Detect and filter streaming platforms
        const streamingPlatforms = detectStreamingPlatforms(scrapedWebsites);
        console.log('Streaming platforms after filtering:', streamingPlatforms);

        // Prioritize platforms based on rank and ad-free status
        const prioritizedPlatforms = prioritizeQualityPlatforms(streamingPlatforms);
        console.log('Prioritized platforms (quality first):', prioritizedPlatforms);

        // Embed anime title in URLs
        const platformsWithTitle = embedAnimeTitle(prioritizedPlatforms, normalTitle);

        // Validate URLs with fallback mechanism
        const validatedLinks = await getValidLinksWithFallback(platformsWithTitle);
        console.log('Validated links:', validatedLinks);

        // Return the top valid links
        res.status(200).json({
            staticProviders,
            streamingLinks: validatedLinks.slice(0, 5) // Return only the top 5 links
        });
    } catch (error) {
        console.error('Error fetching streaming links:', error);
        res.status(500).json({ message: 'Error fetching streaming links', error });
    }
};
