import React from 'react';
import { FaGithub, FaEnvelope } from 'react-icons/fa'; // Importing icons from react-icons

const Footer = () => {
  return (
    <footer className="text-white mt-16 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* GitHub Link and Personal Note */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <a 
              href="https://github.com/Divesh1207" // Replace with your GitHub profile link
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-2 hover:text-yellow-400 transition-colors duration-300 text-sm sm:text-base cursor-pointer z-10"
            >
              <FaGithub size={20} className="text-gray-400 hover:text-yellow-400 transition-colors duration-300" />
              <span>GitHub</span>
            </a>
      
<div className="flex items-center space-x-2 md:space-x-3 hover:text-yellow-400 transition-colors duration-300 text-sm sm:text-base cursor-pointer z-10">
  <FaEnvelope size={20} className="text-gray-400 hover:text-yellow-400 transition-colors duration-300" />
  
  <div className="flex flex-col sm:flex-row items-start sm:items-center">
    <span className="whitespace-nowrap">Email Me For any query</span>
    <a 
      href="mailto:diveshp904@gmail.com" 
      className="text-blue-400 hover:underline ml-1 sm:ml-2"
    >
      diveshp904@gmail.com
    </a>
  </div>
</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;