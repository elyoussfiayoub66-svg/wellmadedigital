import { createClient } from '@/lib/supabase/server';

export async function getPricingData() {
  const supabase = await createClient();
  
  // Fetch Features
  const { data: features, error: featuresError } = await supabase
    .from('pricing_features')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
    
  if (featuresError) {
    console.error('Error fetching features:', featuresError);
    return { features: [], groups: [], featureGroups: [], exclusivePairs: [] };
  }

  // Fetch Groups
  const { data: groups, error: groupsError } = await supabase
    .from('pricing_groups')
    .select('*');
    
  // Fetch Feature-Group relationships
  const { data: featureGroups, error: featureGroupsError } = await supabase
    .from('pricing_feature_groups')
    .select('*');
    
  // Fetch Exclusive Pairs
  const { data: exclusivePairs, error: exclusivePairsError } = await supabase
    .from('pricing_exclusive_pairs')
    .select('*');

  return {
    features: features || [],
    groups: groups || [],
    featureGroups: featureGroups || [],
    exclusivePairs: exclusivePairs || []
  };
}
