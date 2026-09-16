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
        /* Custom GrapesJS Theme overrides to match the dark UI */
        .gjs-cv-canvas {
          top: 0;
          width: 100%;
          height: 100%;
          background-color: #f4f5f6; /* Lighter background for canvas */
        }
        .gjs-one-bg { background-color: #0E0E0F; }
        .gjs-two-color { color: #C2496B; }
        .gjs-three-bg { background-color: #C2496B; color: white; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #C2496B; }
        
        /* Make panels look modern */
        .gjs-pn-panel {
          background-color: #1A1A1B;
          border-color: #2A2A2B;
        }
        .gjs-pn-btn {
          color: #F7F5F0;
        }
        .gjs-pn-active {
          background-color: #C2496B;
          color: white;
          box-shadow: none;
        }
        /* Right sidebar */
        .gjs-sm-sector .gjs-sm-title {
          background-color: #1A1A1B;
          color: #F7F5F0;
          border-bottom: 1px solid #2A2A2B;
        }
        .gjs-sm-properties {
          background-color: #1A1A1B;
        }
        .gjs-block {
          border-color: #2A2A2B;
          color: #F7F5F0;
        }
        .gjs-block:hover {
          border-color: #C2496B;
          color: #C2496B;
        }
        .gjs-clm-tags .gjs-sm-title, .gjs-clm-tags .gjs-sm-field {
          background-color: #1A1A1B;
          color: #F7F5F0;
        }
      `}</style>
    </div>
  );
}
