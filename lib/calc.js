/**
 * Utility functions for pricing calculator math and dependencies.
 */

export function calculatePricing({ 
  selections, 
  features, 
  groups, 
  featureGroups 
}) {
  let subtotal = 0;
  let finalPrice = 0;
  let discountTotal = 0;
  
  // Track features to categories/groups they belong to
  // structure: { featureId: [groupIds...] }
  const featureToGroups = {};
  featureGroups.forEach(fg => {
    if (!featureToGroups[fg.feature_id]) {
      featureToGroups[fg.feature_id] = [];
    }
    featureToGroups[fg.feature_id].push(fg.group_id);
  });
  
  // Calculate raw subtotal and gather selected feature info
  const selectedDetails = [];
  
  for (const [id, state] of Object.entries(selections)) {
    if (!state.checked) continue;
    
    const feature = features.find(f => f.id === id);
    if (!feature) continue;
    
    const qty = feature.pricing_type === 'per_page' ? (state.quantity || 1) : 1;
    const linePrice = parseFloat(feature.price) * qty;
    
    subtotal += linePrice;
    
    selectedDetails.push({
      ...feature,
      quantity: qty,
      linePrice,
      groups: featureToGroups[id] || []
    });
  }

  // Calculate dependency group discounts
  // Rule: When multiple dependent features are selected, apply discount to the group.
  // Rule: A feature can only receive one dependency discount.
  const appliedDiscounts = [];
  const discountedFeatureIds = new Set();
  
  // Process each group to see if we have multiple selected features in it
  for (const group of groups) {
    const groupFeatures = selectedDetails.filter(
      f => f.groups.includes(group.id) && !discountedFeatureIds.has(f.id)
    );
    
    // The requirement: "When multiple dependent features are selected together, the algorithm should calculate the combined price... apply a 10% discount"
    if (groupFeatures.length > 1) {
      const groupTotal = groupFeatures.reduce((sum, f) => sum + f.linePrice, 0);
      const discountAmount = groupTotal * (parseFloat(group.discount_percentage) / 100);
      
      discountTotal += discountAmount;
      
      appliedDiscounts.push({
        groupId: group.id,
        groupName: group.name,
        originalTotal: groupTotal,
        discountAmount: discountAmount,
        discountedTotal: groupTotal - discountAmount,
        features: groupFeatures.map(f => f.name)
      });
      
      // Mark these features as discounted so they don't get double discounted
      groupFeatures.forEach(f => discountedFeatureIds.add(f.id));
    }
  }
  
  finalPrice = subtotal - discountTotal;
  
  return {
    subtotal,
    discountTotal,
    finalPrice,
    appliedDiscounts,
    selectedDetails
  };
}

export function applyMutualExclusives(currentSelections, newSelectionId, exclusivePairs) {
  // Make a copy of selections to mutate safely
  const updatedSelections = { ...currentSelections };
  
  if (!updatedSelections[newSelectionId]?.checked) {
    return updatedSelections;
  }

  // Find if this new selection conflicts with anything
  for (const pair of exclusivePairs) {
    if (pair.feature_id_1 === newSelectionId && updatedSelections[pair.feature_id_2]?.checked) {
      updatedSelections[pair.feature_id_2] = { ...updatedSelections[pair.feature_id_2], checked: false };
    }
    if (pair.feature_id_2 === newSelectionId && updatedSelections[pair.feature_id_1]?.checked) {
      updatedSelections[pair.feature_id_1] = { ...updatedSelections[pair.feature_id_1], checked: false };
    }
  }
  
  return updatedSelections;
}
