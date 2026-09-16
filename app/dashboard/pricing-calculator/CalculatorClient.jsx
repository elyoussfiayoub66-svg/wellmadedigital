'use client';

import { useState, useMemo } from 'react';
import { calculatePricing, applyMutualExclusives } from '@/lib/calc';
import { Check, Info, FileText, Save, RefreshCw } from 'lucide-react';

export default function CalculatorClient({ initialData }) {
  const { features, groups, featureGroups, exclusivePairs } = initialData;
  
  // State: { featureId: { checked: boolean, quantity: number } }
  const [selections, setSelections] = useState({});

  const handleToggle = (id) => {
    setSelections(prev => {
      const isChecked = !prev[id]?.checked;
      let next = {
        ...prev,
        [id]: {
          checked: isChecked,
          quantity: prev[id]?.quantity || 1
        }
      };
      
      if (isChecked) {
        next = applyMutualExclusives(next, id, exclusivePairs);
      }
      
      return next;
    });
  };

  const handleQuantity = (id, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setSelections(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: qty
      }
    }));
  };

  const handleReset = () => {
    if (window.confirm("Clear all selections?")) {
      setSelections({});
    }
  };

  const handleSave = () => {
    // For V1: Simple save to local storage (or DB if wired up)
    localStorage.setItem('saved_quote', JSON.stringify({ selections, date: new Date().toISOString() }));
    alert('Quote configuration saved locally.');
  };

  const handleGenerateQuote = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.from('crm_settings').select('agency_address, agency_email, agency_phone').single();
      
      let agencySettings = {
        address: 'Casablanca, Morocco',
        bank_name: 'CIH Bank',
        rib: '000000000000000000000000',
        email: data?.agency_email || 'hello@wellmadedigital.com',
        phone: data?.agency_phone || '+212 600 000 000'
      };
      
      if (data?.agency_address && data.agency_address.startsWith('{')) {
        try {
          const parsed = JSON.parse(data.agency_address);
          agencySettings.address = parsed.address || agencySettings.address;
          agencySettings.bank_name = parsed.bank_name || agencySettings.bank_name;
          agencySettings.rib = parsed.rib || agencySettings.rib;
        } catch(e) {}
      }

      const { generateStyledPDF } = await import('@/lib/pdfGenerator');
      
      const discountTotal = calculation.appliedDiscounts.reduce((sum, d) => sum + d.discountAmount, 0);

      await generateStyledPDF({
        title: 'PROJECT ESTIMATE',
        reference: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(),
        dueDate: 'Validity: 30 Days',
        status: 'Estimate',
        // Calculator quote requested only totals, no items, but to keep the layout pretty we can pass one summary item.
        items: [
          {
            desc: 'Website Design & Development Services',
            qty: 1,
            rate: calculation.subtotal,
            discount: discountTotal,
            total: calculation.finalPrice
          }
        ],
        subtotal: calculation.subtotal,
        discount: discountTotal,
        finalPrice: calculation.finalPrice,
        clientName: 'Client',
        clientAddress: 'Pending Project Scope',
        agencyName: 'Wellmade Digital',
        agencyEmail: agencySettings.email,
        agencyPhone: agencySettings.phone,
        agencyAddress: agencySettings.address,
        bankName: agencySettings.bank_name,
        rib: agencySettings.rib
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF quote.");
    }
  };

  // Perform calculations
  const calculation = useMemo(() => {
    return calculatePricing({ selections, features, groups, featureGroups });
  }, [selections, features, groups, featureGroups]);

  // Group features by category for display
  const categorizedFeatures = useMemo(() => {
    const cats = {};
    features.forEach(f => {
      if (!cats[f.category]) cats[f.category] = [];
      cats[f.category].push(f);
    });
    return cats;
  }, [features]);
  
  // Track dependencies visually
  const isFeatureDependent = (fId) => {
    return featureGroups.some(fg => fg.feature_id === fId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Left Column: Feature Selection */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {Object.entries(categorizedFeatures).map(([category, items]) => (
          <div key={category} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(feature => {
                const isChecked = selections[feature.id]?.checked || false;
                const qty = selections[feature.id]?.quantity || 1;
                const hasDeps = isFeatureDependent(feature.id);
                
                return (
                  <div 
                    key={feature.id}
                    className={`
                      relative p-4 rounded-lg border transition-all duration-200 cursor-pointer
                      flex flex-col gap-3
                      ${isChecked ? 'bg-brand-accent/10 border-brand-accent' : 'bg-brand-surface border-brand-border hover:border-zinc-700'}
                    `}
                    onClick={() => handleToggle(feature.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 shrink-0 ${isChecked ? 'bg-brand-accent border-brand-accent' : 'border-brand-border'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            {feature.name}
                            {hasDeps && (
                              <span title="Part of a dependency group" className="text-brand-gold opacity-70">
                                <Info className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-brand-secondary mt-0.5">
                            {parseFloat(feature.price).toLocaleString()} MAD {feature.pricing_type === 'per_page' ? '/ page' : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Input (only if checked & per_page) */}
                    {isChecked && feature.pricing_type === 'per_page' && (
                      <div className="pl-8 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <label className="text-xs text-brand-secondary">Qty:</label>
                        <input 
                          type="number" 
                          min="1"
                          value={qty}
                          onChange={(e) => handleQuantity(feature.id, e.target.value)}
                          className="w-16 bg-brand-bg border border-brand-border rounded px-2 py-1 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                        />
                        <span className="text-xs font-medium text-brand-accent ml-auto">
                          {(parseFloat(feature.price) * qty).toLocaleString()} MAD
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Sticky Summary */}
      <div className="w-full lg:w-1/3 sticky top-4">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
            <span>Project Summary</span>
            <span className="bg-brand-dark text-brand-text text-xs px-2 py-1 rounded border border-brand-border">
              {calculation.selectedDetails.length} items
            </span>
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-secondary">Subtotal</span>
              <span className="text-brand-text font-medium">{calculation.subtotal.toLocaleString()} MAD</span>
            </div>
            
            {calculation.appliedDiscounts.length > 0 && (
              <div className="pt-2 border-t border-brand-border space-y-2">
                {calculation.appliedDiscounts.map((d, i) => (
                  <div key={i} className="flex justify-between items-start text-sm">
                    <div className="flex flex-col">
                      <span className="text-brand-accent font-medium">{d.groupName} Discount</span>
                      <span className="text-xs text-brand-muted">10% off grouped features</span>
                    </div>
                    <span className="text-brand-accent font-medium">-{d.discountAmount.toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t border-brand-border flex justify-between items-center">
              <span className="text-base text-brand-secondary font-bold">Final Price</span>
              <span className="text-2xl font-bold text-white">{calculation.finalPrice.toLocaleString()} MAD</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button 
              onClick={handleGenerateQuote}
              disabled={calculation.selectedDetails.length === 0}
              className="w-full bg-brand-accent hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Generate Quote
            </button>
            <div className="flex gap-3">
              <button 
                onClick={handleSave}
                disabled={calculation.selectedDetails.length === 0}
                className="w-1/2 bg-brand-dark border border-brand-border hover:bg-brand-bg text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button 
                onClick={handleReset}
                disabled={calculation.selectedDetails.length === 0}
                className="w-1/2 bg-brand-dark border border-brand-border hover:bg-brand-bg text-brand-secondary font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
