import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContent, Page, PageItem, ContentItem } from '../types';
import { uploadContentToGitHub, REPO_OWNER, REPO_NAME } from '../utils/github';

const STORAGE_KEY = 'od_renata_bio_content';
const PROCESSING_KEY = 'od_renata_processing_timestamp';
const CONTENT_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/content.json`;

const INITIAL_CONTENT: AppContent = {
  pages: [
    {
      id: 'home',
      items: [
         { id: '1', type: 'link', label: 'Whatsapp', url: 'https://wa.me/5551994051212?text=Ol%C3%A1!%20Eu%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.', iconName: 'Whatsapp' },
         { id: '2', type: 'link', label: 'Youtube', url: 'https://www.youtube.com/@oficinadedanca', iconName: 'Youtube' },
         { id: 'sep1', type: 'separator' },
         { id: '3', type: 'nav', label: 'Valores', targetPageId: 'valores', iconName: 'Banknote' },
         { id: '4', type: 'nav', label: 'Horários', targetPageId: 'horarios', iconName: 'CalendarDays' },
      ]
    },
    {
      id: 'valores',
      title: 'Valores',
      iconName: 'Banknote',
      items: [
        { id: 'v1', type: 'file', label: 'Ballet, Jazz e Tecido', url: '/valores-ballet.png' },
        { id: 'v2', type: 'file', label: 'Dança Livre, Dança de Salão e Fitness', url: '/valores-fitness.png' },
      ]
    },
    {
      id: 'horarios',
      title: 'Horários',
      iconName: 'CalendarDays',
      items: [
        { id: 'h1', type: 'file', label: 'Ballet', url: '/horarios-ballet.png' },
        { id: 'h2', type: 'file', label: 'Jazz', url: '/horarios-jazz.png' },
        { id: 'h3', type: 'file', label: 'Outras Modalidades', url: '/horarios-outras.png' },
      ]
    }
  ]
};

interface ContentContextType {
  content: AppContent;
  draftContent: AppContent;
  hasUnsavedChanges: boolean;
  isPublishing: boolean;
  isProcessing: boolean; // Site is rebuilding
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  addItemToPage: (pageId: string, item: PageItem) => void;
  updateItemInPage: (pageId: string, itemId: string, updates: Partial<PageItem>) => void;
  deleteItemFromPage: (pageId: string, itemId: string) => void;
  reorderItemsInPage: (pageId: string, newItems: PageItem[]) => void;
  resetContent: () => void;
  saveChanges: () => void;
  revertChanges: () => void;
  publishChanges: (token: string) => Promise<void>;
  pendingUploads: Map<string, File>;
  setPendingUpload: (itemId: string, file: File) => void;
  clearPendingUpload: (itemId: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<AppContent>(INITIAL_CONTENT);
  const [draftContent, setDraftContent] = useState<AppContent>(INITIAL_CONTENT);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state
  const [pendingUploads, setPendingUploads] = useState<Map<string, File>>(new Map());

  // Helper to update pending uploads
  const setPendingUpload = (itemId: string, file: File) => {
      setPendingUploads(prev => new Map(prev).set(itemId, file));
      setHasUnsavedChanges(true); // Tracking pending upload as a change
  };

  const clearPendingUpload = (itemId: string) => {
      setPendingUploads(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemId);
          return newMap;
      });
  };

  useEffect(() => {
    const checkProcessingStatus = () => {
        const timestamp = localStorage.getItem(PROCESSING_KEY);
        if (timestamp) {
            const timePassed = Date.now() - parseInt(timestamp, 10);
            if (timePassed < 60000) { // 1 minute
                setIsProcessing(true);
                // Set timeout to clear it
                setTimeout(() => {
                    setIsProcessing(false);
                    localStorage.removeItem(PROCESSING_KEY);
                }, 60000 - timePassed);
            } else {
                localStorage.removeItem(PROCESSING_KEY);
            }
        }
    };
    checkProcessingStatus();

    const loadContent = async () => {
        try {
            const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setContent(data);
                
                // Only load saved draft if it exists, otherwise init with fetched data
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        
                        // Compare with fetched data to see if there are actual changes
                        // We check if the saved content is deeply equal to the fetched content
                        // Using JSON.stringify for deep comparison (keys must be in same order, which they usually are for same structure)
                        // If they match, we assume NO unsaved changes, even if localStorage exists.
                        const isIdentical = JSON.stringify(parsed) === JSON.stringify(data);
                        
                        setDraftContent(parsed);

                        // If the local content matches the remote content, we don't need to consider it "unsaved"
                        // This fixes the issue where refreshing after a publish (even after propagation) shows "unsaved changes"
                        // Also, if they are identical, we clear the local storage to avoid confusion if remote changes by another user
                        
                        // BUT: If isProcessing is true, trust local version and don't flag unsaved changes
                        // The user just published, so remote is stale.
                        const processing = localStorage.getItem(PROCESSING_KEY);
                        let isStillProcessing = false;
                        if (processing && (Date.now() - parseInt(processing, 10) < 60000)) {
                             isStillProcessing = true;
                        }

                        if (isIdentical) {
                             localStorage.removeItem(STORAGE_KEY);
                             setHasUnsavedChanges(false);
                        } else {
                             // If we are processing, it's not "unsaved", it's "pending publish"
                             // We suppress the unsaved warning if we know we just published
                             setHasUnsavedChanges(!isStillProcessing); 
                        }
                        
                        setDraftContent(parsed);
                    } catch (e) {
                         setDraftContent(data);
                    }
                } else {
                    setDraftContent(data);
                }
            } else {
                // Fallback to local storage or initial content
                const saved = localStorage.getItem(STORAGE_KEY);
                 if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setContent(parsed);
                        setDraftContent(parsed);
                    } catch (e) {
                        console.error("Failed to parse local storage", e);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch content from GitHub", error);
             // Fallback to local storage or initial content
              const saved = localStorage.getItem(STORAGE_KEY);
               if (saved) {
                  try {
                      const parsed = JSON.parse(saved);
                      setContent(parsed);
                      setDraftContent(parsed);
                  } catch (e) {
                      console.error("Failed to parse local storage", e);
                  }
              }
        }
    };
    loadContent();
  }, []);

  const saveChanges = () => {
    setContent(draftContent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftContent));
    setHasUnsavedChanges(true); // Changes are saved locally but not published
  };

  const publishChanges = async (token: string) => {
      try {
          setIsPublishing(true);
          // Pass the pending uploads map to the upload function
          await uploadContentToGitHub(draftContent, token, pendingUploads);
          
          setContent(draftContent);
          // Clear successful uploads
          setPendingUploads(new Map());
          
          // Update local storage to reflect the latest published version
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draftContent));
          
          // Set Processing Timestamp
          const now = Date.now();
          localStorage.setItem(PROCESSING_KEY, now.toString());
          setIsProcessing(true);
          setTimeout(() => {
              setIsProcessing(false);
              localStorage.removeItem(PROCESSING_KEY);
          }, 60000);

          setHasUnsavedChanges(false);
          // Alert is removed in favor of UI feedback
          // alert("Changes published successfully! Note: It may take a few minutes for changes to appear on the public site.");
      } catch (error) {
          console.error("Failed to publish changes", error);
          alert("Failed to publish changes. Check console for details.");
          throw error;
      } finally {
          setIsPublishing(false);
      }
  };

  const revertChanges = () => {
    setDraftContent(content);
    setHasUnsavedChanges(false);
    setPendingUploads(new Map()); // Clear any pending uploads on revert
    localStorage.removeItem(STORAGE_KEY); // Clear draft
  };

  const updateDraft = (newContent: AppContent) => {
    setDraftContent(newContent);
    setHasUnsavedChanges(true);
  };

  const addPage = (page: Page) => {
    updateDraft({ ...draftContent, pages: [...draftContent.pages, page] });
  };

  const updatePage = (pageId: string, updates: Partial<Page>) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.map(p => p.id === pageId ? { ...p, ...updates } : p)
    });
  };

  const deletePage = (pageId: string) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.filter(p => p.id !== pageId)
    });
  };

  const addItemToPage = (pageId: string, item: PageItem) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.map(p => 
        p.id === pageId ? { ...p, items: [...p.items, item] } : p
      )
    });
  };

  const updateItemInPage = (pageId: string, itemId: string, updates: Partial<PageItem>) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.map(p => 
        p.id === pageId ? { 
          ...p, 
          items: p.items.map(i => i.id === itemId ? { ...i, ...updates } as PageItem : i) 
        } : p
      )
    });
  };

  const deleteItemFromPage = (pageId: string, itemId: string) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.map(p => 
        p.id === pageId ? { 
          ...p, 
          items: p.items.filter(i => i.id !== itemId) 
        } : p
      )
    });
  };

  const reorderItemsInPage = (pageId: string, newItems: PageItem[]) => {
    updateDraft({
      ...draftContent,
      pages: draftContent.pages.map(p => 
        p.id === pageId ? { ...p, items: newItems } : p
      )
    });
  };

  const resetContent = () => {
    setContent(INITIAL_CONTENT);
    setDraftContent(INITIAL_CONTENT);
    setHasUnsavedChanges(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ContentContext.Provider value={{
      content,
      draftContent,
      hasUnsavedChanges,
      addPage,
      updatePage,
      deletePage,
      addItemToPage,
      updateItemInPage,
      deleteItemFromPage,
      reorderItemsInPage,
      resetContent,
      saveChanges,
      revertChanges,
      publishChanges,
      isPublishing,
      isProcessing,
      setPendingUpload,
      clearPendingUpload,
      pendingUploads
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
