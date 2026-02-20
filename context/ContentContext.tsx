import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContent, Page, PageItem, ContentItem } from '../types';
import { uploadContentToGitHub, REPO_OWNER, REPO_NAME } from '../utils/github';

const STORAGE_KEY = 'od_renata_bio_content';
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
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<AppContent>(INITIAL_CONTENT);
  const [draftContent, setDraftContent] = useState<AppContent>(INITIAL_CONTENT);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
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
                        setDraftContent(parsed);
                        setHasUnsavedChanges(true); // Treat local storage as unsaved changes vs remote
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
          await uploadContentToGitHub(draftContent, token);
          setContent(draftContent);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draftContent));
          setHasUnsavedChanges(false);
          alert("Changes published successfully!");
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
      isPublishing
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
