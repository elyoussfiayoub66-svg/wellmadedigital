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

  return (
    <div className="grapesjs-page">
      <style dangerouslySetInnerHTML={{ __html: page.css_content || '' }} />
      <div dangerouslySetInnerHTML={{ __html: page.html_content || '' }} />
    </div>
  );
}
