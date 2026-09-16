import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Create a server-side Supabase client for static generation / fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 60; // Revalidate every minute if using ISR

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { data } = await supabase
    .from('landing_pages')
    .select('title')
    .eq('slug', resolvedParams.slug)
    .single();
    
  return {
    title: data?.title || 'Landing Page',
  };
}

export default async function CustomLandingPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: page, error } = await supabase
    .from('landing_pages')
    .select('html_content, css_content, title')
    .eq('slug', slug)
    .single();

  if (error || !page) {
    notFound();
  }

  let pureHtml = page.html_content || '';
  let pureJs = '';

  if (pureHtml.includes('<!--GJS_JS_START-->')) {
    const parts = pureHtml.split('<!--GJS_JS_START-->');
    pureHtml = parts[0];
    if (parts[1]) {
      pureJs = parts[1].split('<!--GJS_JS_END-->')[0];
    }
  }

  return (
    <div className="grapesjs-page">
      <style dangerouslySetInnerHTML={{ __html: page.css_content || '' }} />
      <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
      {pureJs && <script dangerouslySetInnerHTML={{ __html: pureJs }} />}
    </div>
  );
}
