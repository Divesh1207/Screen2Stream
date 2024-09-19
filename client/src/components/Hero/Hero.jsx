
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Film, Clock, Terminal, Zap, Database, UploadCloud, PlayCircle, CheckCircle } from 'lucide-react';
import { uploadImage, searchAnime, queryAniList, fetchStreamingLinks } from '../../api/api';
import ErrorMessage from '../ErrorMessage';
import ResultSection from '../ResultSection';
import SubmitButton from '../SubmitButton';
import DoodleEffect from '../DoodleEffect';
import Footer from '../Footer';

const Hero = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [result, setResult] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(25);
  const navigate = useNavigate();

  const [fileUploaded, setFileUploaded] = useState(false); // Track if a file is uploaded

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileUploaded(true); // Mark file as uploaded
      setSelectedFile(file);
     
      setError(null); // Clear error if file is selected
    } else {
      setFileUploaded(false); // Mark file as not uploaded
    }

    
  };

  const incrementPercentage = useCallback(() => {
    setPercentage(prevPercentage => {
      if (prevPercentage >= nextMilestone - 1) return prevPercentage;
      return prevPercentage + 0.1; // Slower increment
    });
  }, [nextMilestone]);

  useEffect(() => {
    let intervalId;
    if (loading && percentage < 100) {
      intervalId = setInterval(() => {
        incrementPercentage();
      }, 100); // Slower interval
    }
    return () => clearInterval(intervalId);
  }, [loading, percentage, incrementPercentage]);

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
      setPercentage(0);
      setCurrentMilestone(0);
      setNextMilestone(25);

      const uploadResponse = await uploadImage(formData);
      setPercentage(25);
      setCurrentMilestone(25);
      setNextMilestone(50);

      const { imageUrl } = uploadResponse;
      if (!imageUrl) throw new Error('Image URL is missing.');

      const imageResult = await searchAnime(imageUrl);
      setPercentage(50);
      setCurrentMilestone(50);
      setNextMilestone(75);

      if (!imageResult || !Array.isArray(imageResult.sauceNao) || imageResult.sauceNao.length === 0) {
        throw new Error('No results found from searching the anime picture');
      }
      const sauceData=imageResult.sauceNao
console.log('saucenoe array data',sauceData)
      const firstResult = imageResult.sauceNao[0];
      console.log('user id extracting in hero component',imageResult.user_id)
      const user_id=imageResult.user_id
const anilist_id=firstResult.anilist_id
const anime_title=firstResult.anime_title
const source=firstResult.source
console.log('Anime title extracting from sauce result',anime_title)
      console.log('First result of sauce Data in hero component',firstResult)
      
      const requestBody = {
        sauceData:sauceData,
        user_id:user_id,
        anilist_id:anilist_id,
        
        animeTitle: anime_title!== "Unknown" ? anime_title : null,
        source: firstResult.source||null,
        engName: firstResult.eng_name !== "Unknown" ? firstResult.eng_name : null,
        jpName: firstResult.jp_name !== "Unknown" ? firstResult.jp_name : null,
        thumbnail: firstResult.thumbnail || null
      };

      const aniListData = await queryAniList(requestBody);
      setPercentage(75);
      setCurrentMilestone(75);
      setNextMilestone(100);
console.log('AnilistData found in hero controller after sucessful api call from anilist backend',aniListData)
console.log('Anilst laake de rha hai sauce wala succesful title',aniListData.successfulTitle)
const successfulTitle=aniListData.successfulTitle
      if (!aniListData) throw new Error('No data found from AniList');

      const consumetResponse = await fetchStreamingLinks(aniListData?.title?.romaji, aniListData?.title?.english,aniListData?.successfulTitle);
      setPercentage(100);
      setCurrentMilestone(100);

      const combinedResult = {
        traceMoeData: imageResult,
        aniListData,
        animeTitle: anime_title!== "Unknown" ? anime_title : null,
        successfulTitle:successfulTitle!=="Unknown"?successfulTitle:null,
        streamingLinks: consumetResponse.streamingLinks,
        officialWebsites: consumetResponse.officialwebsites,
        gem: consumetResponse.gemwebsite,
        thumbnail: requestBody.thumbnail
      };

      setResult(combinedResult);
      navigate('/result', { state: { result: combinedResult } });

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while processing the image.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('Result state updated:', result);
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-size-200 bg-pos-0 animate-gradient-x opacity-30"></div>
      <div className="relative z-10 max-w-7xl w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-12 lg:space-y-16">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 lg:mb-12 relative">
  <span className="absolute top-0 left-1 -ml-1 text-blue-400 opacity-50 blur-sm">Scene2Stream</span>
  <span className="relative md:pl-80">Scene2Stream</span>
</h1>

        <p className="text-base sm:text-sm md:text-sm lg:text-2xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed tracking-wide">
  Discover the world of anime with our advanced AI recognition system.
  <br />
  <span className="text-blue-400 font-semibold">Fast, accurate, and user-friendly!</span>
</p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <div className="flex items-center sm:space-x-1 md:space-x-4">
          <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center sm:p-3 sm:pl-6 sm:pr-6 md:p-2 bg-white text-black rounded-lg cursor-pointer hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          {fileUploaded ? ( // Conditionally render Done icon or UploadCloud icon
            <>
              <CheckCircle className="mr-2 text-green-500" /> {/* Done Icon */}
              <span className="hidden md:block">Done</span>
            </>
          ) : (
            <>
              <UploadCloud className="mr-2" /> {/* UploadCloud icon */}
              <span className="hidden md:block">Choose a File</span>
            </>
          )}
        </label>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="flex items-center space-x-2 md:space-x-4  text-white">
              <h2 className='text-white text-2xl md:text-4xl'>+</h2>
              <SubmitButton loading={loading} />
              <h2 className='text-white text-2xl md:text-4xl'>=</h2>
              <h2 className='text-green-400 flex items-center space-x-2'>
                <PlayCircle size={36} className="animate-pulse" />
                <span className=' text-xl md:text-xl font-bold'>Watch Results!</span>
              </h2> 
            </div>
          </div>
          
          {loading && <DoodleEffect percentage={Math.floor(percentage)} />}
          <ErrorMessage message={error} />
          {result && <ResultSection />}
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          {[ 
            { icon: Search, text: 'Advanced AI Recognition', color: 'text-green-400', tooltip: 'Highly accurate image search' },
            { icon: Zap, text: 'Lightning-Fast Results', color: 'text-yellow-400', tooltip: 'Get results in few seconds' },
            { icon: Database, text: 'Extensive Anime Database', color: 'text-blue-400', tooltip: 'Access a vast library of anime scenes' },
            { icon: Film, text: 'Scene Detection', color: 'text-purple-400', tooltip: 'Identify specific anime scenes with precision' },
            { icon: Clock, text: 'Timestamp Matching', color: 'text-pink-400', tooltip: 'Find the exact moment in the episode' },
            { icon: Terminal, text: 'Detailed Metadata', color: 'text-indigo-400', tooltip: 'Receive in-depth details for each result' }
          ].map(({ icon: Icon, text, color, tooltip }, index) => (
            <div key={index} className="relative group flex items-center space-x-4 bg-gray-800 bg-opacity-50 p-4 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <Icon className={`${color}`} size={32} />
              <span className="text-white text-sm sm:text-base">{text}</span>
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 text-xs text-gray-300 bg-gray-900 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{tooltip}</span>
            </div>
          ))}
        </div>
        <div className="bg-gray-800 bg-opacity-70 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 tracking-wide text-center">Featured Anime</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 ">
            {[ 
              {
                title: 'Attack on Titan',
                image: 'https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDdiMzNiNDZlMDAwXkEyXkFqcGdeQXVyNzI3NjY3NjQ@._V1_FMjpg_UX1000_.jpg',
                description: 'Humanity fights for survival against giant humanoid creatures.',
              },
              {
                title: 'Demon Slayer',
                image: 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=85,width=480,height=720/catalog/crunchyroll/765ee047befcfb677d169f5de4c82d5c.jpg',
                description: 'A young boy becomes a demon slayer to save his sister.',
              },
              {
                title: 'My Hero Academia',
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_7v18lAuP_xIA3FKKtm_xIhtdoVPIFbJR4A&s',
                description: 'In a world where superpowers are common, one boy strives to become a hero.',
              },
              {
                title: 'One Piece',
                image: 'https://platform.polygon.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/25132508/one_piece_luffy_new_season.jpg?quality=90&strip=all&crop=21.875,0,56.25,100',
                description: 'A group of pirates searching for the ultimate treasure.',
              },
              {
                title: 'Naruto',
                image: 'https://facts.net/wp-content/uploads/2023/05/Naruto.jpeg',
                description: 'A young ninja seeks recognition and dreams of becoming the Hokage.',
              },
              {
                title: 'Sword Art Online',
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbfxMw3hneagK34kgHYyZW1sC0zs5VwbOM7w&s',
                description: 'Players become trapped in a virtual reality MMORPG.',
              }
            ].map(({ title, image, description }, index) => (
              <div 
              key={index} 
              className="flex flex-col items-center bg-gray-900 bg-opacity-60 rounded-lg shadow-md p-3 hover:bg-gray-800 hover:scale-105 hover:shadow-xl transition-transform duration-300 max-w-xs sm:max-w-sm lg:max-w-md"
            >
              <img 
                src={image} 
                alt={title} 
                className="w-full h-32 sm:h-40 object-cover rounded-md mb-3"
              />
              <h4 className="text-white font-bold text-xs sm:text-sm lg:text-base text-center mb-3">{title}</h4>
              <p className="text-gray-300 text-xs sm:text-sm text-center">{description}</p>
            </div>
            
            ))}
          </div>
        </div>
        <div className="relative bg-gray-900 bg-opacity-70 p-6 rounded-xl border border-gray-700 shadow-lg mt-12">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-6 text-center tracking-wide">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[ 
              { icon: Upload, title: 'Upload Image', description: 'Choose a scene from an anime episode.' },
              { icon: Search, title: 'Processes Scene', description: 'It identifies the anime from the image.' },
              { icon: Film, title: 'Get Results', description: 'Receive detailed info about the anime and streaming links.' }
            ].map(({ icon: Icon, title, description }, index) => (
              <div key={index} className="flex flex-col items-center text-center bg-gray-800 bg-opacity-60 p-6 rounded-lg hover:bg-opacity-80 transition">
                <Icon className="text-blue-400 mb-4" size={40} />
                <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
                <p className="text-gray-300 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  
     <Footer/>
    </div>
  );
};

export default Hero;
