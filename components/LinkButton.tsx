import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ButtonProps } from '../types';
import { getIcon } from '../utils/iconMap';

/**
 * Link Button Component
 * Highly interactive button with hover states and spring animations.
 */
const LinkButton: React.FC<ButtonProps> = ({ item, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = getIcon(item.iconName);

  // Helper to handle local vs external URLs
  const getHref = (url?: string) => {
    if (!url) return '#';
    // External links, special protocols, and Base64 data (uploaded files)
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('data:')) return url;
    
    // It's a local path (from project files), prepend base URL for GitHub Pages
    const baseUrl = import.meta.env.BASE_URL;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    return `${cleanBase}${cleanUrl}`;
  };
  
  // Decide element based on type
  // If we have an onClick, we use button (usually for navigation items or special actions)
  // If not, we check if it is a link/file
  const isButton = !!onClick || item.type === 'nav';
  const Element = isButton ? motion.button : motion.a;
  
  const isDataUrl = item.url?.startsWith('data:');

  const props = isButton 
    ? { onClick } 
    : { 
        href: getHref(item.url), 
        // For data URLs, avoid target="_blank" to prevent "Not allowed to navigate top frame to data URL" error
        // Instead, let it download in the current context
        target: isDataUrl ? undefined : "_blank", 
        rel: "noopener noreferrer",
        download: isDataUrl ? item.label || 'download' : undefined
      };

  return (
    // @ts-ignore
    <Element
      {...props}
      onClick={(e) => {
        if (!isButton && isDataUrl) {
           // Optional: If we want to force download behavior or handle differently
           // But 'download' attribute on a tag usually works for data URLs in most browsers
           // If it fails, constructing a Blob and opening it might be needed, but let's try download attr first
        }
        if (onClick) onClick();
      }}
      {...props}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: 0.3 + (index * 0.1), 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-md group block text-left"
    >
      <div className={`
        relative overflow-hidden
        w-full h-14 md:h-16 
        bg-white/95 
        rounded-2xl 
        flex items-center justify-center 
        shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] 
        hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.4)]
        transition-all duration-300 ease-out
        border border-white/50 transform-gpu will-change-transform
        group-hover:-translate-y-1
      `}>
        {/* Hover Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
        
        {/* Icon & Text Container */}
        <div className="relative z-10 flex items-center gap-3 md:gap-4 text-slate-800">
          {Icon && (
            <Icon 
              className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isHovered ? 'scale-110 text-[#EF62A2]' : 'text-slate-600'}`} 
              strokeWidth={1.5}
            />
          )}
          <span className={`text-sm md:text-base font-medium tracking-wide transition-colors duration-300 ${isHovered ? 'text-[#EF62A2]' : 'text-slate-800'}`}>
            {item.label}
          </span>
        </div>

        {/* Shine Effect on Hover */}
        <div className={`absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 transition-all duration-700 ${isHovered ? 'left-[100%]' : ''}`} />
      </div>
    </Element>
  );
};

export default LinkButton;
