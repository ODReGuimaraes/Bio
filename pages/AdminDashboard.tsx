import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { PageItem, ContentItem, ItemType } from '../types';
import { ICON_MAP, getIcon } from '../utils/iconMap';
import { Trash2, Plus, GripVertical, LogOut, FileUp, Save, Settings } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { uploadFileToGitHub } from '../utils/github';

const AdminDashboard: React.FC = () => {
  const { 
    draftContent, 
    addPage, 
    deletePage, 
    addItemToPage, 
    updateItemInPage, 
    deleteItemFromPage, 
    reorderItemsInPage,
    hasUnsavedChanges,
    saveChanges,
    revertChanges,
    publishChanges,
    isPublishing
  } = useContent();
  const navigate = useNavigate();
  
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [githubToken, setGithubToken] = useState<string>(sessionStorage.getItem('githubToken') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Item editing state
  const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemType, setItemType] = useState<ItemType>('link');

  // Delete confirmation state
  const [deleteConf, setDeleteConf] = useState<{
    show: boolean;
    type: 'page' | 'item';
    id: string; // The ID of the thing to delete
    parentId?: string; // for items, the page ID
    name?: string; // For display in the modal
  }>({ show: false, type: 'item', id: '' });

  const confirmDelete = () => {
    if (deleteConf.type === 'page') {
      deletePage(deleteConf.id);
      if (selectedPageId === deleteConf.id) setSelectedPageId('home');
    } else {
      if (deleteConf.parentId) {
        deleteItemFromPage(deleteConf.parentId, deleteConf.id);
      }
    }
    setDeleteConf({ ...deleteConf, show: false });
  };

  // Check auth
  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('../'); // Go back to login if not auth
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('githubToken');
    navigate('/');
  };

  const handleSaveToken = () => {
    sessionStorage.setItem('githubToken', githubToken);
    setShowSettings(false);
  };

  const handleSave = async () => {
      // If we have a token, publish to GitHub. 
      // If not, we just save locally but warn the user? 
      // The user requirement is persistence to repo.
      if (!githubToken) {
          const proceedLocal = window.confirm("No GitHub Token found. Changes will ONLY be saved to your browser cache and will NOT appear on the public site. Go to Settings to add a token?\n\nCancel to Open Settings, OK to Save Locally Only.");
          if (!proceedLocal) {
              setShowSettings(true);
              return;
          }
          saveChanges();
      } else {
          await publishChanges(githubToken);
      }
  };

  const handleCreatePage = () => {
    if (!newPageTitle) return;
    const id = newPageTitle.toLowerCase().replace(/\s+/g, '-');
    addPage({
      id,
      title: newPageTitle,
      iconName: 'FileText',
      items: []
    });
    setNewPageTitle('');
    setIsAddingPage(false);
    setSelectedPageId(id);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let finalUrl = editingItem.url;
    
    // Handle File Upload to GitHub
    if (fileInput) {
        if (!githubToken) {
            alert("A GitHub Token is required to upload files. Please configure it in settings.");
            setShowSettings(true);
            return;
        }

        try {
            setIsUploading(true);
            finalUrl = await uploadFileToGitHub(fileInput, githubToken);
            setIsUploading(false);
        } catch (error) {
            setIsUploading(false);
            alert("Failed to upload to GitHub. Check your token and permissions.");
            return;
        }
    }

    // Check if we are updating an existing item (it has an id)
    if (editingItem.id) {
        const updatedItem: any = {
            type: itemType,
            label: editingItem.label,
            url: finalUrl,
            iconName: editingItem.iconName,
            targetPageId: editingItem.targetPageId
        };

        updateItemInPage(selectedPageId, editingItem.id, updatedItem);
    } else {
        // Create New
        const newItem: PageItem = {
            id: Date.now().toString(),
            type: itemType,
            label: editingItem.label || 'New Item',
            url: finalUrl || '#',
            iconName: editingItem.iconName,
            targetPageId: editingItem.targetPageId
        } as any;
        
        addItemToPage(selectedPageId, newItem);
    }

    setEditingItem(null);
    setIsAddingItem(false);
    setFileInput(null);
  };

  const handleAddSeparator = () => {
    addItemToPage(selectedPageId, { id: Date.now().toString(), type: 'separator' });
  };

  // File upload handling
  const [fileInput, setFileInput] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 1024 * 1024 * 5) { // Increased to 5MB for GitHub
        alert("File size limit is 5MB.");
        return;
      }

      setFileInput(file);
      // We don't convert to base64 anymore for final storage, 
      // but we might want to preview name in UI or pre-fill label
      setEditingItem(prev => ({ 
          ...prev, 
          // We don't set 'url' here anymore to avoid the large base64 string
          // being used as the final URL if upload fails or is skipped.
          // Instead, url will be generated on save.
          
          // Use a temporary placeholder or keep existing, will be overwritten after upload
          label: prev?.label || file.name 
      }));
    }
  };

  const selectedPage = draftContent.pages.find(p => p.id === selectedPageId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h1 className="font-bold text-slate-800">Painel Admin</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-rose-500" title="Settings">
                <Settings size={18} />
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500" title="Logout">
                <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                    <h3 className="font-bold text-lg mb-4">Configurações</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">GitHub Personal Access Token</label>
                        <p className="text-xs text-slate-500 mb-2">Required for uploading files.</p>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2 text-sm"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowSettings(false)} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSaveToken} className="px-3 py-1 bg-rose-500 text-white rounded hover:bg-rose-600">Save</button>
                    </div>
                </div>
            </div>
        )}

        {/* Save Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex bg-white flex-col gap-2">
            {hasUnsavedChanges && (
                <div className="text-xs text-center text-amber-600 font-medium mb-1">
                    Alterações não salvas
                </div>
            )}
            <button 
                onClick={handleSave}
                disabled={(!hasUnsavedChanges && !isPublishing) || isPublishing}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    hasUnsavedChanges || isPublishing
                        ? 'bg-rose-500 text-white shadow-lg hover:bg-rose-600' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                {isPublishing ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publicando...
                    </>
                ) : (
                    <>
                        <Save size={16} /> Salvar
                    </>
                )}
            </button>
            <button 
                onClick={() => {
                   if (confirm('Descartar todas as alterações não salvas?')) revertChanges();
                }}
                disabled={!hasUnsavedChanges}
                className={`w-full py-1 text-xs rounded text-slate-500 hover:text-red-500 ${!hasUnsavedChanges && 'hidden'}`}
            >
                Descartar Alterações
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {draftContent.pages.map(page => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group transition-colors ${selectedPageId === page.id ? 'bg-rose-50 text-rose-600' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <span className="font-medium">{page.title || 'Home'}</span>
              {page.id !== 'home' && (
                <Trash2 
                  size={14} 
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConf({
                        show: true,
                        type: 'page',
                        id: page.id,
                        name: page.title || 'Page'
                    });
                  }} 
                />
              )}
            </button>
          ))}
          
          <div className="pt-2 border-t border-slate-100 mt-2">
            {!isAddingPage ? (
              <button 
                onClick={() => setIsAddingPage(true)}
                className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 px-2 py-1"
              >
                <Plus size={16} /> Adicionar Página
              </button>
            ) : (
              <div className="px-2">
                <input 
                  autoFocus
                  className="w-full border rounded px-2 py-1 text-sm mb-2"
                  placeholder="Título da Página"
                  value={newPageTitle}
                  onChange={e => setNewPageTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleCreatePage} className="bg-rose-500 text-white text-xs px-2 py-1 rounded">Adicionar</button>
                  <button onClick={() => setIsAddingPage(false)} className="text-slate-500 text-xs px-2 py-1">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selectedPage ? (
          <div className="max-w-3xl mx-auto">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                 Editar: {selectedPage.title || 'Home'}
               </h2>
               <div className="flex gap-2">
                 <button 
                    onClick={() => {
                        setEditingItem({}); // Empty for new
                        setItemType('link');
                        setIsAddingItem(true);
                    }} 
                    className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                 >
                   <Plus size={18} /> Adicionar Item
                 </button>
                 <button onClick={handleAddSeparator} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                   Adicionar Separador
                 </button>
               </div>
             </div>

             {/* Items List */}
             <div className="space-y-4">
                {selectedPage.items.length === 0 && <p className="text-slate-400 italic text-center py-8">Nenhum item ainda</p>}
                
                <Reorder.Group 
                  axis="y" 
                  values={selectedPage.items} 
                  onReorder={(newOrder) => reorderItemsInPage(selectedPage.id, newOrder)}
                  className="space-y-4"
                >
                {selectedPage.items.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group cursor-default relative"
                  >
                    <div className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-slate-300 hover:text-slate-500">
                         <GripVertical />
                    </div>
                    
                    <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => {
                             if ('type' in item && item.type !== 'separator') {
                                 setEditingItem(item);
                                 setItemType(item.type);
                                 setIsAddingItem(true);
                             }
                        }}
                    >
                      {'type' in item && item.type === 'separator' ? (
                        <div className="h-[2px] w-full bg-slate-100 flex items-center justify-center">
                            <span className="bg-white px-2 text-slate-400 text-xs uppercase tracking-wider">Separador</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                           {(() => {
                              const I = getIcon((item as ContentItem).iconName);
                              return I ? <I className="w-5 h-5 text-slate-500"/> : null;
                           })()}
                           <div>
                             <h4 className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors">{(item as ContentItem).label}</h4>
                             <p className="text-xs text-slate-500 truncate max-w-md">
                               {(item as ContentItem).type === 'nav' ? `Vai para: ${(item as ContentItem).targetPageId}` : (item as ContentItem).url}
                             </p>
                           </div>
                           <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{(item as ContentItem).type}</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setDeleteConf({
                        show: true, 
                        type: 'item', 
                        id: item.id, 
                        parentId: selectedPage.id,
                        name: 'label' in item ? item.label : 'Separador'
                      })}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Reorder.Item>
                ))}
                </Reorder.Group>
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Selecione uma página para editar</div>
        )}
      </main>

      {/* Add/Edit Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingItem?.id ? 'Editar Item' : 'Adicionar Item'}</h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    {(['link', 'nav', 'file'] as ItemType[]).map(t => (
                        <button
                          key={t} 
                          type="button"
                          onClick={() => setItemType(t)}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${itemType === t ? 'bg-white shadow text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {t === 'link' ? 'Link' : t === 'nav' ? 'Navegação' : 'Arquivo'}
                        </button>
                    ))}
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Rótulo</label>
                 <input 
                   required
                   className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none" 
                   value={editingItem?.label || ''}
                   onChange={e => setEditingItem(prev => ({ ...prev, label: e.target.value }))}
                   placeholder="Rótulo do Botão"
                 />
               </div>

               {/* Dynamic fields based on type */}
               {itemType === 'link' && (
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                   <input 
                     required
                     type="url"
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none" 
                     value={editingItem?.url || ''}
                     onChange={e => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                     placeholder="https://..."
                   />
                 </div>
               )}

               {itemType === 'nav' && (
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Página de Destino</label>
                   <select 
                     required
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                     onChange={e => setEditingItem(prev => ({ ...prev, targetPageId: e.target.value }))}
                     value={editingItem?.targetPageId || ''}
                   >
                     <option value="">Selecione uma página...</option>
                     {draftContent.pages.map(p => (
                       <option key={p.id} value={p.id}>{p.title || 'Home'}</option>
                     ))}
                   </select>
                 </div>
               )}

               {itemType === 'file' && (
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Enviar Arquivo</label>
                   <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileUp className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">{fileInput ? fileInput.name : 'Clique para enviar PDF ou Imagem'}</p>
                   </div>
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                 <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    onChange={e => setEditingItem(prev => ({ ...prev, iconName: e.target.value }))}
                    value={editingItem?.iconName || ''}
                 >
                    <option value="">Sem Ícone</option>
                    {Object.keys(ICON_MAP).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                 </select>
               </div>

               <div className="flex gap-3 pt-4">
                 <button 
                  type="button" 
                  onClick={() => { setIsAddingItem(false); setEditingItem(null); setFileInput(null); }}
                  className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                  type="submit"
                  className="flex-1 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                 >
                   Salvar
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConf.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja excluir 
              <span className="font-bold text-slate-800 mx-1">"{deleteConf.name}"</span>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConf({ ...deleteConf, show: false })}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
