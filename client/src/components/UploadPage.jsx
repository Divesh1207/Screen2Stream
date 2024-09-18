import React, { useState } from 'react';
import { uploadImage, searchAnime, queryAniList, fetchStreamingLinks } from '../api/api';  // Import the API calls

import SubmitButton from './SubmitButton';
import ErrorMessage from './ErrorMessage';  // Correct default import


import ResultSection from './ResultSection';
import FileInput from './Fileinput';


const UploadPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            setLoading(true);
            setError(null);

            // Step 1: Upload the image using the modular API function
            const uploadResponse = await uploadImage(formData);
            const { imageUrl } = uploadResponse;

            if (!imageUrl) {
                throw new Error('Preprocessed image URL is missing.');
            }

            // Step 2: Search for anime using the uploaded image
            const imageResult = await searchAnime(imageUrl);
            if (!imageResult || !Array.isArray(imageResult.sauceNao) || imageResult.sauceNao.length === 0) {
                throw new Error('No results found from SauceNAO');
            }

            const firstResult = imageResult.sauceNao[0];
            const animeTitle = firstResult.source !== "Unknown" ? firstResult.source : null;
            const engName = firstResult.eng_name !== "Unknown" ? firstResult.eng_name : null;
            const jpName = firstResult.jp_name !== "Unknown" ? firstResult.jp_name : null;
            const thumbnail = firstResult.thumbnail || null;

            // Prepare request body for AniList query
            const requestBody = {
                ...(animeTitle && { animeTitle }),
                ...(engName && { engName }),
                ...(jpName && { jpName }),
                ...(thumbnail && { thumbnail })
            };

            // Step 3: Query AniList using the modular API function
            const aniListData = await queryAniList(requestBody);

            if (!aniListData) {
                throw new Error('No data found from AniList');
            }

            // Step 4: Fetch streaming links using the modular API function
            const consumetResponse = await fetchStreamingLinks(aniListData?.title?.romaji, aniListData?.title?.english);
            const { streamingLinks, officialwebsites, gemwebsite } = consumetResponse;

            // Combine all data into a single result
            setResult({
                traceMoeData: imageResult,
                aniListData,
                streamingLinks,
                officialWebsites: officialwebsites,
                gem: gemwebsite
            });

        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred while processing the image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        
        <form onSubmit={handleSubmit}>
            <FileInput onChange={handleFileChange} />
            <SubmitButton loading={loading} />
            <ErrorMessage message={error} />
            {result && <ResultSection result={result} />}
        </form>
       
    );
};

export default UploadPage;



