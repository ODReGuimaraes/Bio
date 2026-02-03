import React from 'react';
import { motion } from 'framer-motion';
import { Infinity as InfinityIcon } from 'lucide-react';

/**
 * Divider Component
 * The infinity symbol separator.
 */
const Divider: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-4 py-6 md:py-8 w-full max-w-xs mx-auto overflow-hidden">
      <motion.div 
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "0%", opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.5, ease: "easeInOut" }}
        className="h-[1px] w-full bg-gradient-to-r from-transparent via-white to-transparent" 
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
      >
        <InfinityIcon className="w-5 h-5 text-white shrink-0" strokeWidth={1.5} />
      </motion.div>
      <motion.div 
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: "0%", opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.5, ease: "easeInOut" }}
        className="h-[1px] w-full bg-gradient-to-l from-transparent via-white to-transparent" 
      />
    </div>
  );
};

export default Divider;
