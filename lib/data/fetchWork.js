import { createClient } from '@/lib/supabase/server';

export async function getProjects() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    // STRICT RETURN: No hardcoded fallback data.
    if (error || !data) {
      return [];
    }

    // Map Supabase DB fields directly to the expected UI fields
    return data.map((item) => {
      return {
        id: item.id,
        name: item.title,
        category: item.industry || 'Digital Experience',
        image: item.image_url || '/assets/pic1.PNG', // safe fallback to prevent Next Image crash
        description: item.short_description || "",
        challenge: item.problem || "",
        approach: item.solution || "",
        result: "", // Can be mapped from results JSONB if needed
        services: "Strategy • Design • Development",
        href: `/work/${item.id}`
      };
    });
  } catch (e) {
    console.error('Error fetching case studies:', e);
    return [];
  }
}
