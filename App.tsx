import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Youtube, 
  Banknote, 
  CalendarDays, 
  Infinity as InfinityIcon,
  Sparkles
} from 'lucide-react';
import { LinkItem } from './types';

// --- Components ---

/**
 * Custom Whatsapp Icon
 * Lucide doesn't include brand logos, so we use a custom SVG to ensure it looks correct.
 */
const WhatsappIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
      <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/10 transition-transform duration-500 hover:scale-105">
        {/* Placeholder for the Dancer Logo */}
        <div className="text-white text-center">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 text-rose-100" />
            <span className="font-serif font-bold italic text-xs md:text-sm tracking-widest text-white block">OFICINA</span>
            <span className="font-sans font-light text-[0.6rem] md:text-xs tracking-widest text-rose-100 block uppercase">De Dança</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Link Button Component
 * Highly interactive button with hover states and spring animations.
 */
const LinkButton: React.FC<{ item: LinkItem; index: number }> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
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
      className="relative w-full max-w-md group"
    >
      <div className={`
        relative overflow-hidden
        w-full h-14 md:h-16 
        bg-white/95 backdrop-blur-sm 
        rounded-2xl 
        flex items-center justify-center 
        shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] 
        hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.4)]
        transition-all duration-300 ease-out
        border border-white/50
        group-hover:-translate-y-1
      `}>
        {/* Hover Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
        
        {/* Icon & Text Container */}
        <div className="relative z-10 flex items-center gap-3 md:gap-4 text-slate-800">
          <item.icon 
            className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isHovered ? 'scale-110 text-rose-500' : 'text-slate-600'}`} 
            strokeWidth={1.5}
          />
          <span className={`text-sm md:text-base font-medium tracking-wide transition-colors duration-300 ${isHovered ? 'text-rose-900' : 'text-slate-800'}`}>
            {item.label}
          </span>
        </div>

        {/* Shine Effect on Hover */}
        <div className={`absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 transition-all duration-700 ${isHovered ? 'left-[100%]' : ''}`} />
      </div>
    </motion.a>
  );
};

/**
 * Divider Component
 * The infinity symbol separator.
 */
const Divider: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex items-center justify-center gap-4 py-6 md:py-8 w-full max-w-xs mx-auto opacity-60"
    >
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <InfinityIcon className="w-5 h-5 text-white/80 shrink-0" strokeWidth={1.5} />
      <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-white/60 to-transparent" />
    </motion.div>
  );
};

// --- Main App ---

const LINKS: LinkItem[] = [
  { id: '1', label: 'Whatsapp', url: '#', icon: WhatsappIcon },
  { id: '2', label: 'Youtube', url: '#', icon: Youtube },
  { id: '3', label: 'Valores', url: '#', icon: Banknote }, // Changed to Banknote (Money bill)
  { id: '4', label: 'Horários', url: '#', icon: CalendarDays }, 
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-rose-300 text-slate-900 selection:bg-rose-200">
      
      {/* Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-300 via-pink-400 to-rose-300" />
        
        {/* Animated Orbs (The "Awwwards" touch) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
        
        {/* Noise Overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16">
        
        <div className="w-full max-w-md flex flex-col items-center">
          <Logo />

          <div className="w-full flex flex-col gap-4">
            {/* First Group of Buttons */}
            {LINKS.slice(0, 2).map((link, idx) => (
              <LinkButton key={link.id} item={link} index={idx} />
            ))}

            <Divider />

            {/* Second Group of Buttons */}
            {LINKS.slice(2, 4).map((link, idx) => (
              <LinkButton key={link.id} item={link} index={idx + 2} />
            ))}
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;