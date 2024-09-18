import axios from 'axios';

// Create an axios instance with baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Ensure this is correct
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// Upload Image API Call
export const uploadImage = async (formData) => {
  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Search Anime API Call
export const searchAnime = async (imageUrl) => {
  try {
    const response = await api.post('/searchanim', { imageUrl });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

// AniList Query API Call
export const queryAniList = async (requestBody) => {
  try {
    const response = await api.post('/anilistquery', requestBody);
    return response.data;
  } catch (error) {
    console.error('Error querying AniList:', error);
    throw error;
  }
};

// Streaming Links API Call
export const fetchStreamingLinks = async (romaji, english) => {
  try {
    const response = await api.get('/streaminglinks', {
      params: { romaji, english }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching streaming links:', error);
    throw error;
  }
};
