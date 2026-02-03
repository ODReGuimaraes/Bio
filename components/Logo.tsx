import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Logo Component
 * Uses a simple SVG placeholder but styled to look premium.
 */
const Logo: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center mb-10 group cursor-default"
    >
      {/* Decorative Glow behind logo */}
      <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Actual Logo Container */}
      <div className="relative z-10 w-40 h-40 md:w-56 md:h-56 flex items-center justify-center transition-transform duration-500 hover:scale-105">
        <img 
          src={import.meta.env.BASE_URL + "logo.png"}
          alt="Oficina de Dança Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
             // Fallback if logo.png doesn't exist
             e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback Text if image fails or for styling */}
        <span className="sr-only">Oficina de Dança Renata Guimarães</span>
      </div>
    </motion.div>
  );
};

export default Logo;
