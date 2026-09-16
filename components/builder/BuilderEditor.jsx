'use client';

import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPluginForms from 'grapesjs-plugin-forms';
import gjsCustomCode from 'grapesjs-custom-code';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Desktop, Smartphone, Monitor, Code, Layout, Layers } from 'lucide-react';

export default function BuilderEditor({ pageId }) {
  const editorRef = useRef(null);
  const blocksRef = useRef(null);
  const stylesRef = useRef(null);
  
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [leftTab, setLeftTab] = useState('blocks'); // 'blocks' or 'layers'
  const [rightTab, setRightTab] = useState('styles'); // 'styles' or 'settings'
  
  // Custom Code Modal State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  
  const supabase = createClient();
  const router = useRouter();
  
  useEffect(() => {
    if (!editorRef.current) return;

    const initEditor = async () => {
      // Fetch existing page data
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', pageId)
        .single();
        
      if (error) {
        toast.error("Failed to load page");
        return;
      }

      const e = grapesjs.init({
        container: editorRef.current,
        height: '100%',
        width: '100%',
        storageManager: {
          type: 'remote',
          stepsBeforeSave: 3,
          autosave: false,
        },
        plugins: [gjsPresetWebpage, gjsBlocksBasic, gjsPluginForms, gjsCustomCode],
        pluginsOpts: {
          gjsPresetWebpage: {},
          gjsBlocksBasic: {},
          gjsPluginForms: {},
          gjsCustomCode: {}
        },
        blockManager: { appendTo: '#blocks-container' },
        layerManager: { appendTo: '#layers-container' },
        styleManager: { appendTo: '#styles-container' },
        traitManager: { appendTo: '#traits-container' },
        selectorManager: { appendTo: '#styles-container' },
      });

      // Load data if exists
      if (data.grapesjs_data) {
        e.loadProjectData(data.grapesjs_data);
      } else if (data.html_content) {
        e.setComponents(data.html_content);
        e.setStyle(data.css_content);
      }

      // Add custom lead capture block
      e.BlockManager.add('lead-capture-form', {
        label: 'CRM Lead Form',
        category: 'Forms',
        content: `
          <form action="/api/capture-lead" method="POST" class="crm-lead-form" data-gjs-type="form" style="padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
            <h3 style="margin-bottom: 15px; color: #333;">Book a Meeting</h3>
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #555;">Name</label>
              <input type="text" name="name" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #555;">Email</label>
              <input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #555;">Phone</label>
              <input type="tel" name="phone" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>
            <button type="submit" style="width: 100%; padding: 12px; background: #C2496B; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Submit Request</button>
          </form>
        `,
      });

      setEditor(e);
    };

    initEditor();

    return () => {
      if (editor) editor.destroy();
    };
  }, [pageId]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const js = editor.getJs();
      const projectData = editor.getProjectData();
      
      const bundledHtml = js && js.trim() ? `${html}\n<script>\n${js}\n</script>` : html;

      const { error } = await supabase
        .from('landing_pages')
        .update({
          html_content: bundledHtml,
          css_content: css,
          grapesjs_data: projectData,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

      if (error) throw error;
      toast.success("Page saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const openCodeModal = () => {
    if (!editor) return;
    setCustomHtml(editor.getHtml());
    setCustomCss(editor.getCss());
    setCustomJs(editor.getJs() || '');
    setIsCodeModalOpen(true);
  };

  const applyCustomCode = () => {
    if (!editor) return;
    
    // Inject components and scripts
    const finalHtml = customJs.trim() 
      ? `${customHtml}\n<script>${customJs}</script>` 
      : customHtml;
      
    editor.setComponents(finalHtml);
    editor.setStyle(customCss);
    
    setIsCodeModalOpen(false);
    toast.success("Code injected successfully!");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text">
      
      {/* Left Sidebar: Blocks & Layers */}
      <div className="w-64 flex flex-col shrink-0 bg-brand-surface border-r border-brand-border z-10">
        <div className="h-14 flex items-center border-b border-brand-border px-2 shrink-0">
          <button 
            onClick={() => router.push('/dashboard/landing-pages')}
            className="p-2 rounded-lg hover:bg-brand-border/50 text-brand-muted hover:text-brand-text transition-colors mr-2"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex bg-brand-bg rounded-lg p-1 w-full">
            <button 
              onClick={() => setLeftTab('blocks')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${leftTab === 'blocks' ? 'bg-brand-surface text-brand-accent shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              <Layout className="w-3.5 h-3.5" /> Add
            </button>
            <button 
              onClick={() => setLeftTab('layers')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${leftTab === 'layers' ? 'bg-brand-surface text-brand-accent shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Layers
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           <div id="blocks-container" className={`absolute inset-0 p-3 ${leftTab === 'blocks' ? 'block' : 'hidden'}`}></div>
           <div id="layers-container" className={`absolute inset-0 ${leftTab === 'layers' ? 'block' : 'hidden'}`}></div>
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Topbar inside Center */}
        <div className="h-14 bg-brand-surface border-b border-brand-border flex items-center justify-center px-4 shrink-0 relative z-10">
          <div className="flex items-center bg-brand-bg rounded-lg border border-brand-border p-1">
            <button onClick={() => editor?.setDevice('Desktop')} className="p-1.5 rounded-md hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors" title="Desktop View">
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => editor?.setDevice('Mobile portrait')} className="p-1.5 rounded-md hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors" title="Mobile View">
              <Smartphone className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-brand-border mx-1"></div>
            <button onClick={openCodeModal} className="p-1.5 rounded-md hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors" title="Inject HTML/CSS">
              <Code className="w-4 h-4" />
            </button>
          </div>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-bold text-sm rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        
        {/* Canvas */}
        <div id="gjs" ref={editorRef} className="flex-1 w-full bg-brand-bg"></div>
      </div>

      {/* Right Sidebar: Styles */}
      <div className="w-72 flex flex-col shrink-0 bg-brand-surface border-l border-brand-border z-10">
        <div className="h-14 flex items-center border-b border-brand-border px-2 shrink-0">
          <div className="flex bg-brand-bg rounded-lg p-1 w-full">
            <button 
              onClick={() => setRightTab('styles')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${rightTab === 'styles' ? 'bg-brand-surface text-brand-accent shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Styles
            </button>
            <button 
              onClick={() => setRightTab('settings')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${rightTab === 'settings' ? 'bg-brand-surface text-brand-accent shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Settings
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           <div id="styles-container" className={`absolute inset-0 p-4 ${rightTab === 'styles' ? 'block' : 'hidden'}`}></div>
           <div id="traits-container" className={`absolute inset-0 p-4 ${rightTab === 'settings' ? 'block' : 'hidden'}`}></div>
        </div>
      </div>
      
      {/* Code Injection Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-brand-surface w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-brand-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
              <div>
                <h2 className="text-lg font-bold text-brand-text">Inject HTML & CSS</h2>
                <p className="text-xs text-brand-muted mt-1">Paste your custom code below. It will replace the current page design.</p>
              </div>
              <button onClick={() => setIsCodeModalOpen(false)} className="p-2 text-brand-muted hover:text-white bg-brand-bg rounded-lg">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-4 bg-brand-bg min-h-[400px]">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">HTML Code</label>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  className="flex-1 w-full bg-brand-surface border border-brand-border rounded-xl p-4 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none custom-scrollbar"
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">CSS Code</label>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  className="flex-1 w-full bg-brand-surface border border-brand-border rounded-xl p-4 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none custom-scrollbar"
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">JS Code</label>
                <textarea
                  value={customJs}
                  onChange={(e) => setCustomJs(e.target.value)}
                  className="flex-1 w-full bg-brand-surface border border-brand-border rounded-xl p-4 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none custom-scrollbar"
                  spellCheck={false}
                  placeholder="console.log('Hello World');"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-brand-border bg-brand-surface flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-brand-text bg-brand-bg hover:bg-brand-border/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomCode}
                className="px-6 py-2.5 rounded-xl bg-brand-accent text-sm font-bold text-white hover:bg-brand-accent/90 transition-colors flex items-center gap-2 shadow-lg shadow-brand-accent/20"
              >
                <Code className="w-4 h-4" />
                Inject Code
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Hide Default Preset Panels entirely to use our custom React layout */
        .gjs-pn-panels { display: none !important; }
        
        /* 1. Canvas Area */
        .gjs-cv-canvas {
          top: 0;
          width: 100%;
          height: 100%;
          background-color: #0E0E0F !important;
          background-image: radial-gradient(#2A2A2B 1px, transparent 1px) !important;
          background-size: 24px 24px !important;
        }

        /* Base colors override */
        .gjs-one-bg { background-color: transparent !important; }
        .gjs-two-color { color: #F7F5F0 !important; }
        .gjs-three-bg { background-color: #C2496B !important; color: white !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #C2496B !important; }
        
        /* Blocks */
        .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 12px !important;
        }
        .gjs-block {
          border-radius: 12px !important;
          background-color: #0E0E0F !important;
          border: 1px solid #2A2A2B !important;
          color: #F7F5F0 !important;
          padding: 16px 12px !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
        }
        .gjs-block:hover {
          border-color: #C2496B !important;
          color: #C2496B !important;
          background-color: rgba(194, 73, 107, 0.05) !important;
          transform: translateY(-2px);
        }
        .gjs-block-label {
          font-weight: 600 !important;
          font-size: 11px !important;
          text-transform: capitalize !important;
        }

        /* Style Manager */
        .gjs-sm-sector {
          border-bottom: 1px solid #2A2A2B !important;
          margin-bottom: 16px;
        }
        .gjs-sm-title {
          color: #F7F5F0 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          padding: 0 0 12px 0 !important;
          background: transparent !important;
          border: none !important;
        }
        .gjs-sm-properties {
          padding: 0 0 16px 0 !important;
          background: transparent !important;
        }
        .gjs-field {
          background-color: #0E0E0F !important;
          border: 1px solid #2A2A2B !important;
          border-radius: 6px !important;
          color: #F7F5F0 !important;
          box-shadow: none !important;
        }
        .gjs-field:hover, .gjs-field:focus-within {
          border-color: #C2496B !important;
        }
        
        /* Layers */
        .gjs-layer {
          border-bottom: 1px solid #2A2A2B !important;
        }
        .gjs-layer-name {
          color: #F7F5F0 !important;
          font-size: 12px !important;
        }
        .gjs-layer-active {
          background-color: rgba(194, 73, 107, 0.1) !important;
          border-left: 3px solid #C2496B !important;
        }
        
        /* Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1A1A1B;
        }
        ::-webkit-scrollbar-thumb {
          background: #2A2A2B;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3A3A3B;
        }
      `}</style>
    </div>
  );
}
