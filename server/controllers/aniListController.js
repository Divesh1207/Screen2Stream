
import axios from 'axios';
import Fuse from 'fuse.js';
import dotenv from 'dotenv';

dotenv.config();

const titleQuery = `
  query ($title: String!) {
    Media (search: $title, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      synonyms
      coverImage {
        extraLarge
      }
      description
      episodes
      seasonYear
      streamingEpisodes {
        title
        url
        site
      }
      relations {
        edges {
          node {
            title {
              romaji
              english
              native
            }
            id
          }
          relationType
        }
      }
    }
  }
`;

const idQuery = `
  query ($id: Int) {
    Media(id: $id) {
      id
      title {
        romaji
        english
        native
      }
      synonyms
      coverImage {
        extraLarge
      }
      description
      episodes
      seasonYear
      streamingEpisodes {
        title
        url
        site
      }
      relations {
        edges {
          node {
            title {
              romaji
              english
              native
            }
            id
          }
          relationType
        }
      }
    }
  }
`;

const searchAniListByTitle = async (title) => {
  try {
    const response = await axios.post(process.env.ANILIST_API_URL, {
      query: titleQuery,
      variables: { title }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ANILIST_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data.Media;
  } catch (err) {
    console.error(`Error fetching data from AniList for title "${title}":`, err.message);
    return null;
  }
};

const searchAniListById = async (id) => {
  try {
    const response = await axios.post(process.env.ANILIST_API_URL, {
      query: idQuery,
      variables: { id: parseInt(id) }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ANILIST_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data.Media;
  } catch (err) {
    console.error(`Error fetching data from AniList for ID "${id}":`, err.message);
    return null;
  }
};

const handleFuzzySearch = (sauceData, source) => {
  const fuse = new Fuse(sauceData, {
    keys: ['anime_title', 'source'],
    threshold: 0.7, // Increased threshold for a wider fuzzy match
    includeScore: true
  });

  const results = fuse.search(source || '');
  return results.filter(result => result.score < 0.7).map(result => result.item);
};


const findAlternativeTitles = async (title) => {
  const aniListData = await searchAniListByTitle(title);
  if (aniListData) {
    const allTitles = [
      aniListData.title.romaji,
      aniListData.title.english,
      aniListData.title.native,
      ...(aniListData.synonyms || [])
    ].filter(Boolean);

    return [...new Set(allTitles)];
  }
  return [];
};

const findRelatedSeries = async (sourceTitle) => {
  try {
    const aniListData = await searchAniListByTitle(sourceTitle);
    if (aniListData && aniListData.relations && aniListData.relations.edges.length > 0) {
      return aniListData.relations.edges
        .filter(edge => ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'PARENT', 'ALTERNATIVE', 'ADAPTATION', 'SPIN_OFF'].includes(edge.relationType)) // Added more relation types
        .map(edge => ({
          title: edge.node.title.romaji || edge.node.title.english || edge.node.title.native,
          id: edge.node.id,
          relationType: edge.relationType
        }));
    }
    return [];
  } catch (err) {
    console.error(`Error finding related series for title "${sourceTitle}":`, err.message);
    return [];
  }
};


const searchUsingRelatedSeries = async (bestMatch) => {
  if (bestMatch.source) {
    try {
      console.log(`Attempting to use similar anime: ${bestMatch.source}`);

      // Try to find alternative titles
      const alternativeTitles = await findAlternativeTitles(bestMatch.source);
      for (const title of alternativeTitles) {
        const aniListData = await searchAniListByTitle(title);
        if (aniListData) {
          return formatAniListResponse(aniListData, title);
        }
      }

      // If no match found, try related series
      console.log('No exact match found. Attempting related series search.');
      const relatedSeries = await findRelatedSeries(bestMatch.source);
      for (const series of relatedSeries) {
        console.log(`Searching AniList for related series: ${series.title}`);
        const aniListRelatedData = await searchAniListByTitle(series.title);
        if (aniListRelatedData) {
          return formatAniListResponse(aniListRelatedData, series.title, series.relationType);
        }
      }
    } catch (err) {
      console.error(`Error searching using related series for best match source "${bestMatch.source}":`, err.message);
    }
  }
  return null;
};

const formatAniListResponse = (aniListData, title, relationType = null) => {
  return {
    id: aniListData.id,
    title: title || aniListData.title.romaji || aniListData.title.english || aniListData.title.native,
    description: aniListData.description || 'NA',
    episodes: aniListData.episodes || 'NA',
    seasonYear: aniListData.seasonYear || 'NA',
    coverImage: aniListData.coverImage?.extraLarge || 'NA',
    streamingEpisodes: aniListData.streamingEpisodes || [],
    relationType: relationType || 'NA'
  };
};

export const queryAniList = async (req, res) => {
  try {
    const { source, sauceData, animeTitle, engName, jpName, user_id, screenshotId, anilist_id } = req.body;
    console.log('Received request body:', req.body);

    

    let aniListData = null;
    let bestFuzzyMatch = null;

    // Priority 1: Search by anilist_id if available
    if (anilist_id  !== 'unknown') {
      console.log(`Searching with anilist_id: ${anilist_id}`);
      aniListData = await searchAniListById(anilist_id);
      console.log('anilistdata in priorty 1',aniListData)
      if (aniListData) {
        return res.status(200).json(formatAniListResponse(aniListData));
      }
    }

    // Priority 2: Search by title fields if available
    const searchQuery = animeTitle || engName || jpName||source;
    console.log('prioty 2 search query ',searchQuery)
    if (searchQuery) {
      console.log(`Searching with query: ${searchQuery}`);
      aniListData = await searchAniListByTitle(searchQuery);
      console.log('anilistdata in priorty 2',aniListData)
      if (aniListData) {
        return res.status(200).json(formatAniListResponse(aniListData, searchQuery));
      }
    }
    const generateTitleVariants = (title) => {
      const variants = [title];
      // Generate a few more variants, such as without special characters, or with alternate spacing
      const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').trim(); // Remove special characters
      variants.push(cleanTitle);
      const splitTitle = title.split(' ');
      if (splitTitle.length > 1) {
        variants.push(splitTitle.join(' '));
      }
      return [...new Set(variants)];
    };
    
    const extractCoreTitle = (title) => {
      const dynamicStopwords = ["manga", "unknown", "episode", "OVA", "special", "part", "vol"];
      const words = title.split(' ');
      const coreWords = words.filter(word => !dynamicStopwords.includes(word.toLowerCase()));
      return coreWords.join(' ').trim() || title; // Return full title if no core words are left
    };
    
    const findRelatedSeries = async (sourceTitle) => {
      try {
        const aniListData = await searchAniListByTitle(sourceTitle);
        if (aniListData && aniListData.relations && aniListData.relations.edges.length > 0) {
          return aniListData.relations.edges
            .filter(edge => ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'PARENT', 'ALTERNATIVE', 'ADAPTATION', 'SPIN_OFF'].includes(edge.relationType)) // Added more relation types
            .map(edge => ({
              title: edge.node.title.romaji || edge.node.title.english || edge.node.title.native,
              id: edge.node.id,
              relationType: edge.relationType
            }));
        }
        return [];
      } catch (err) {
        console.error(`Error finding related series for title "${sourceTitle}":`, err.message);
        return [];
      }
    };
    
    const searchWithCoreTitleAndSynonyms = async (title) => {
      const coreTitle = extractCoreTitle(title);
      console.log(`Extracted core title for search: ${coreTitle}`);
    
      if (coreTitle) {
        // Search AniList with the core title first
        let aniListData = await searchAniListByTitle(coreTitle);
    
        // If no result, try alternative titles (synonyms)
        if (!aniListData) {
          console.log(`No exact match found for core title: ${coreTitle}. Searching for alternative titles.`);
          const alternativeTitles = await findAlternativeTitles(coreTitle);
          for (const titleVariant of generateTitleVariants(coreTitle)) {
            aniListData = await searchAniListByTitle(titleVariant);
            if (aniListData) {
              return aniListData;
            }
          }
          
        }
        
        return aniListData; // Return the data if found
      }
      
      return null;
    };
            

   // Priority 3: Fuzzy search with sauceData
if (sauceData && sauceData.length > 0) {
  console.log('No exact match found. Attempting fuzzy search with sauceData.');

  // Sort the sauceData based on similarity scores in descending order
  sauceData.sort((a, b) => b.similarity - a.similarity);

  // Traverse through the top 3 results and pick the best matching title
  let bestFuzzyMatch = null;
  for (let i = 0; i < Math.min(5, sauceData.length); i++) { // Extended to top 5 results
    const current = sauceData[i];
    console.log(`Checking fuzzy match #${i + 1}:`, current);
    
    const coreTitle = extractCoreTitle(current.anime_title || '');
    if (coreTitle && current.eng_name && current.source) {
      bestFuzzyMatch = { ...current, anime_title: coreTitle }; // Use core title
      // Don't break, continue to check other matches
    }
  }
  

  // If we found a valid match, use it to get related anime series or details
  if (bestFuzzyMatch) {
    console.log('Best fuzzy match priority 3 (with core title):', bestFuzzyMatch);

    // Attempt to use the related anime (if available) to enhance the result
    const result = await searchWithCoreTitleAndSynonyms(bestFuzzyMatch.anime_title);
    console.log('Result after searching with core title and synonyms:', result);

    if (result) {
      return res.status(200).json(result);
    }
  }
}

// If no match found, return the best fuzzy match or a fallback response
if (bestFuzzyMatch) {
  return res.status(200).json({
    id: null,
    title: bestFuzzyMatch.anime_title || bestFuzzyMatch.eng_name || bestFuzzyMatch.source || 'NA',
    description: 'No detailed information available from AniList.',
    episodes: 'NA',
    seasonYear: 'NA',
    coverImage: bestFuzzyMatch.thumbnail || firstResult.coverImage || "default-thumbnail.jpg", // Show original thumbnail from bestFuzzyMatch if available
    streamingEpisodes: [],
    relationType: 'NA',
    note: 'This is an approximate match based on available data.'
  });
} else {
  // Fallback in case no valid fuzzy match is found
  return res.status(200).json({
    id: null,
    title: source || 'NA',
    description: 'No information available.',
    episodes: 'NA',
    seasonYear: 'NA',
    coverImage: 'NA',
    streamingEpisodes: [],
    relationType: 'NA',
    note: 'No match found.'
  });
}

    
  } catch (err) {
    console.error('Unexpected error occurred:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};