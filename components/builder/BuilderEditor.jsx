'use client';

import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPluginForms from 'grapesjs-plugin-forms';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Desktop, Smartphone, Monitor } from 'lucide-react';

export default function BuilderEditor({ pageId }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
        height: '100vh',
        width: 'auto',
        storageManager: {
          type: 'remote',
          stepsBeforeSave: 3,
          autosave: false,
        },
        plugins: [gjsPresetWebpage, gjsBlocksBasic, gjsPluginForms],
        pluginsOpts: {
          gjsPresetWebpage: {},
          gjsBlocksBasic: {},
          gjsPluginForms: {}
        },
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
      const projectData = editor.getProjectData();

      const { error } = await supabase
        .from('landing_pages')
        .update({
          html_content: html,
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg">
      {/* Top Navigation */}
      <div className="h-14 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/landing-pages')}
            className="flex items-center justify-center p-2 rounded hover:bg-brand-border/50 text-brand-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-brand-text">Landing Page Builder</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-brand-bg rounded-lg border border-brand-border p-1 mr-4">
            <button onClick={() => editor?.setDevice('Desktop')} className="p-1.5 rounded hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors">
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => editor?.setDevice('Mobile portrait')} className="p-1.5 rounded hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-bold text-sm rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>
      
      {/* GrapesJS Container */}
      <div id="gjs" ref={editorRef} className="flex-1 w-full h-full overflow-hidden"></div>
      
      <style jsx global>{`
        /* ----------------------------------------------------- */
        /* GrapesJS Modern "Figma/Webflow" Dark Theme Overrides  */
        /* ----------------------------------------------------- */
        
        /* 1. Canvas Area */
        .gjs-cv-canvas {
          top: 0;
          width: 100%;
          height: 100%;
          /* Dotted background pattern */
          background-color: #0E0E0F !important;
          background-image: radial-gradient(#2A2A2B 1px, transparent 1px) !important;
          background-size: 24px 24px !important;
        }

        /* 2. Base Colors */
        .gjs-one-bg { background-color: #1A1A1B !important; }
        .gjs-two-color { color: #F7F5F0 !important; }
        .gjs-three-bg { background-color: #C2496B !important; color: white !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #C2496B !important; }
        
        /* 3. Panels & Top Bar */
        .gjs-pn-panel {
          background-color: #1A1A1B !important;
          border-color: #2A2A2B !important;
        }
        .gjs-pn-views-container {
          box-shadow: -4px 0 15px rgba(0,0,0,0.2);
          border-left: 1px solid #2A2A2B !important;
          background-color: #1A1A1B !important;
        }
        .gjs-pn-views {
          border-bottom: 1px solid #2A2A2B !important;
          background-color: #1A1A1B !important;
        }
        .gjs-pn-btn {
          color: #F7F5F0 !important;
          opacity: 0.5;
          transition: all 0.2s ease;
        }
        .gjs-pn-btn:hover {
          opacity: 1;
        }
        .gjs-pn-active {
          color: #C2496B !important;
          opacity: 1;
          box-shadow: none !important;
          border-bottom: 2px solid #C2496B;
        }
        
        /* 4. Blocks (Drag & Drop components) */
        .gjs-blocks-c {
          padding: 16px !important;
          gap: 12px !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr;
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

        /* 5. Style Manager (Right Sidebar) */
        .gjs-sm-sector {
          border-bottom: 1px solid #2A2A2B !important;
        }
        .gjs-sm-title {
          background-color: #1A1A1B !important;
          color: #F7F5F0 !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.5px !important;
          padding: 16px !important;
          border-bottom: 1px solid #2A2A2B !important;
        }
        .gjs-sm-properties {
          background-color: #1A1A1B !important;
          padding: 12px !important;
        }
        .gjs-sm-property {
          margin-bottom: 12px !important;
        }
        
        /* Form fields inside style manager */
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
        
        /* 6. Layers / DOM elements */
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
        .gjs-layer-title:hover {
          background-color: #2A2A2B !important;
        }
        
        /* 7. Scrollbars */
        .gjs-pn-views-container::-webkit-scrollbar,
        .gjs-blocks-c::-webkit-scrollbar {
          width: 6px;
        }
        .gjs-pn-views-container::-webkit-scrollbar-track,
        .gjs-blocks-c::-webkit-scrollbar-track {
          background: #1A1A1B;
        }
        .gjs-pn-views-container::-webkit-scrollbar-thumb,
        .gjs-blocks-c::-webkit-scrollbar-thumb {
          background: #2A2A2B;
          border-radius: 4px;
        }
        .gjs-pn-views-container::-webkit-scrollbar-thumb:hover,
        .gjs-blocks-c::-webkit-scrollbar-thumb:hover {
          background: #3A3A3B;
        }
      `}</style>
    </div>
  );
}
