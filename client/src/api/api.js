
import axios from 'axios';


// Upload Image API Call
export const uploadImage = async (formData) => {
    try {
        const response = await axios.post('api/api/upload', formData, {
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
        const response = await axios.post('api/api/searchanime', { imageUrl });
        return response.data;
    } catch (error) {
        console.error('Error searching anime:', error);
        throw error;
    }
};

// AniList Query API Call
export const queryAniList = async (requestBody) => {
    try {
        const response = await axios.post('api/api/anilistquery', requestBody);
        return response.data;
    } catch (error) {
        console.error('Error querying AniList:', error);
        throw error;
    }
};

// Streaming Links API Call
export const fetchStreamingLinks = async (romaji, english) => {
    try {
        const response = await axios.get('api/api/streaminglinks', {
            params: { romaji, english }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching streaming links:', error);
        throw error;
    }
};
