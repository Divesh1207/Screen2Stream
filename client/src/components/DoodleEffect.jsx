// DoodleEffect.js
import React from 'react';
import { motion } from 'framer-motion';

const DoodleEffect = ({ percentage }) => {  // Accept percentage as prop

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50">
      <div className="relative flex flex-col items-center">
        {/* Loader Circle */}
        <div className="relative flex items-center justify-center">
          <div className="relative flex items-center justify-center w-24 h-24">
            <motion.div
              className="absolute w-24 h-24 rounded-full border-t-4 border-blue-400 border-solid"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            ></motion.div>

            <div
              className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-800"
              style={{ border: '4px solid rgba(255, 255, 255, 0.3)' }}
            >
              <span className="text-white text-2xl font-bold">{percentage}%</span> {/* Display percentage */}
            </div>
          </div>
        </div>

        <motion.p
  className="text-white sm:text-sm md:text-xl font-semibold mt-4 text-center shadow-md px-4 py-2 rounded-lg"
  animate={{ opacity: [0, 1], y: [10, 0], scale: [0.95, 1] }}
  transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 150 }}
>
  "Every step you take is a step towards the person you want to become." – Naruto Uzumaki
</motion.p>


      </div>
    </div>
  );
};

export default DoodleEffect;
