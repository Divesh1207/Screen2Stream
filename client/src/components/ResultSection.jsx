import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PlayCircle, ExternalLink, Film, Info, Copy, ChevronDown, ChevronUp, Star, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stripHtmlTags = (text) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

// Function to determine the anime title based on priority
const getAnimeTitle = (aniListData) => {
  console.log('anilist data in result section component  ',aniListData)
  console.log('anilist data title in result section component  ',aniListData.title)
  
  if (aniListData.title?.english) return aniListData.title.english;
  if (aniListData?.title) return aniListData.title;
  if (aniListData.title?.romaji) return aniListData.title.romaji;
  return "NA"; // Fallback title
};

const ResultSection = () => {
  const location = useLocation();
  const result = location.state?.result;
  const [isStreamingLinksOpen, setIsStreamingLinksOpen] = useState(false);
  const [isWebsitesOpen, setIsWebsitesOpen] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const toggleStreamingLinks = () => setIsStreamingLinksOpen(!isStreamingLinksOpen);
  const toggleWebsites = () => setIsWebsitesOpen(!isWebsitesOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 150; // Set max length for the truncated text
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const text = stripHtmlTags(result.aniListData.description);
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setShowCopiedNotification(true);
    setTimeout(() => setShowCopiedNotification(false), 2000);
  };

  if (!result || !result.aniListData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="bg-gradient-to-r from-blue-900 to-purple-900 text-white min-h-screen flex items-center justify-center"
      >
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto border border-gray-700">
          <p className="text-red-400 text-center">No data available.</p>
        </div>
      </motion.div>
    );
  }

  const animeTitle = getAnimeTitle(result.aniListData);

  return (
    <motion.div 
      initial={{ opacity: 1 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="font-mono min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${result.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'local'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
      <div className="relative min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 bg-opacity-90 font-medium text-white p-6 rounded-lg shadow-2xl max-w-3xl mx-auto border border-gray-700 space-y-6"
        >
          {/* Thumbnail and Title Section */}
          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative rounded-xl shadow-xl overflow-hidden max-w-sm">
              <img
                src={result.thumbnail}
                alt={animeTitle}
                className="w-full h-auto shadow-md"
                onError={(e) => { e.target.src = 'path/to/fallback/image.jpg'; }}
              />
            </div>
            <h2 className="text-2xl font-bold text-center mt-4 text-blue-300">
              {animeTitle}
            </h2>
          </motion.div>

          {/* Anime Info Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-blue-300 flex items-center justify-center space-x-2 mb-4">
              <Film className="text-blue-400" />
              <span>Anime Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <Star className="text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Score</p>
                <p className="font-bold text-lg">{result.aniListData.averageScore / 10} / 10</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <Calendar className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Year</p>
                <p className="font-bold text-lg">{result.aniListData.seasonYear}</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <Clock className="text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Episodes</p>
                <p className="font-bold text-lg">{result.aniListData.episodes}</p>
              </div>
            </div>
            
            <div className="text-center mt-4">
      <p className="text-sm font-mono text-gray-300">
        {isExpanded ? text : text.slice(0, MAX_LENGTH) + (text.length > MAX_LENGTH ? '...' : '')}
      </p>
      {text.length > MAX_LENGTH && (
        <button 
          onClick={handleToggle} 
          className="text-blue-400 hover:text-blue-600 text-sm font-semibold mt-2 focus:outline-none"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>

          </motion.div>

          {/* Streaming Links Section */}
          <motion.div 
            className="space-y-4 bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div 
              className="flex items-center justify-between cursor-pointer bg-gray-700 bg-opacity-50 p-3 rounded-lg shadow-md hover:bg-opacity-75 transition-colors" 
              onClick={toggleStreamingLinks}
            >
              <h3 className="sm:text-sm md:text-lg font-semibold text-yellow-300 flex items-center space-x-2">
                <PlayCircle className="text-yellow-400" />
                <span>Streaming Links</span>
              </h3>
              <motion.div animate={{ rotate: isStreamingLinksOpen ? 180 : 0 }}>
                <ChevronDown className="text-yellow-400" />
              </motion.div>
            </div>
            <AnimatePresence>
              {isStreamingLinksOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {result.streamingLinks && result.streamingLinks.length > 0 ? (
                    result.streamingLinks.map((link, index) => (
                      <motion.div 
                        key={index} 
                        className="relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-yellow-300 hover:text-white transition-all duration-300 flex items-center justify-between shadow-md hover:shadow-lg"
                        >
                          <div className="flex-1">
                            <span className="text-sm truncate">{link.provider}</span>
                            <p className="text-xs text-gray-400">{link.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Stream {index + 1}</p> {/* Added stream text */}
                          </div>
                          
                          <ExternalLink className="text-yellow-400 ml-2 flex-shrink-0" size={18} />
                          <span className="mx-2 text-gray-400">|</span> {/* Added separator */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(link.url);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy Link"
                          >
                            <Copy size={18} />
                          </button>
                        </a>
                        {showCopiedNotification && (
                          <motion.div 
                            className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 text-yellow-300 text-sm rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <span>Copied!</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No streaming links available.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Websites Section */}
          <motion.div 
            className="space-y-4 bg-gray-800 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div 
              className="flex items-center justify-between cursor-pointer bg-gray-700 bg-opacity-50 p-3 rounded-lg shadow-md hover:bg-opacity-75 transition-colors" 
              onClick={toggleWebsites}
            >
              <h3 className="md:text-lg sm:text-sm font-semibold text-yellow-300 flex items-center space-x-2">
                <ExternalLink className="text-yellow-400" />
                <span>Official Websites</span>
              </h3>
              <motion.div animate={{ rotate: isWebsitesOpen ? 180 : 0 }}>
                <ChevronDown className="text-yellow-400" />
              </motion.div>
            </div>
            <AnimatePresence>
              {isWebsitesOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {result.websites && result.websites.length > 0 ? (
                    result.websites.map((website, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-yellow-300 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                      >
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <span className="text-sm">{website.name}</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(website.url);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          <Copy size={18} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No official websites available.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResultSection;
