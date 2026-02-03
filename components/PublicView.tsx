import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { useContent } from '../context/ContentContext';
import Logo from './Logo';
import LinkButton from './LinkButton';
import Divider from './Divider';
import { PageItem } from '../types';

const PublicView: React.FC = () => {
  const { content } = useContent();
  const [currentViewId, setCurrentViewId] = useState('home');

  // Handle browser back button within the SPA
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.viewId) {
            setCurrentViewId(event.state.viewId);
        } else {
            setCurrentViewId('home');
        }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (viewId: string) => {
      window.history.pushState({ viewId }, '', `?view=${viewId}`);
      setCurrentViewId(viewId);
  };

  const currentPage = content.pages.find(p => p.id === currentViewId) || content.pages.find(p => p.id === 'home');

  if (!currentPage) return null;

  const PageIcon = getIcon(currentPage.iconName);

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-[#EF62A2] text-slate-900 selection:bg-rose-200">
      
      {/* Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#EF62A2] via-pink-500 to-[#EF62A2]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob will-change-transform" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 will-change-transform" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 will-change-transform" />
        
        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-start px-4 pt-20 pb-12 md:pt-32 md:pb-16">
        
        <div className="w-full max-w-md flex flex-col items-center">
          <Logo />

          <AnimatePresence mode="wait">
            <motion.div 
                key={currentPage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex flex-col gap-4"
            >   
                {/* Header for non-home pages */}
                {currentPage.id !== 'home' && (
                    <>
                        {/* Title */}
                        <div className="flex items-center justify-center gap-3 text-slate-800 mb-2">
                            {PageIcon && <PageIcon className="w-6 h-6" />}
                            <h2 className="text-xl font-bold tracking-wide">{currentPage.title}</h2>
                        </div>

                        <div className="mb-2">
                            <button 
                                onClick={() => {
                                    if (window.history.state?.viewId) {
                                        window.history.back();
                                    } else {
                                        navigateTo('home');
                                    }
                                }}
                                className="flex items-center gap-2 text-slate-800 hover:text-rose-900 transition-colors font-medium ml-1"
                            >
                                <ArrowLeft size={20} />
                                Voltar
                            </button>
                        </div>
                    </>
                )}

                {currentPage.items.map((item: PageItem, idx: number) => {
                    if ('type' in item && item.type === 'separator') {
                       return <Divider key={item.id} />;
                    }
                    
                    const linkItem = item as any;
                    
                    return (
                        <LinkButton 
                            key={item.id} 
                            item={linkItem} 
                            index={idx}
                            onClick={
                                 linkItem.type === 'nav' && linkItem.targetPageId
                                    ? () => navigateTo(linkItem.targetPageId!)
                                    : undefined
                            }
                        />
                    );
                })}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PublicView;
