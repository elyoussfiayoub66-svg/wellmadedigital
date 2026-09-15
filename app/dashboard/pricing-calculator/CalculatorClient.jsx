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

  const handleGenerateQuote = () => {
    const quoteHtml = `
      <html>
        <head>
          <title>Project Estimate - Wellmade Digital</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: auto; }
            h1 { color: #800020; margin-bottom: 5px; }
            .subtitle { color: #666; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
            th { font-weight: bold; color: #555; }
            .right { text-align: right; }
            .total-row { font-size: 1.2em; font-weight: bold; border-top: 2px solid #111; }
            .discount-row { color: #800020; }
          </style>
        </head>
        <body>
          <h1>Wellmade Digital</h1>
          <div class="subtitle">Project Investment Estimate</div>
          
          <table>
            <thead>
              <tr>
                <th>Service / Feature</th>
                <th class="right">Quantity</th>
                <th class="right">Investment</th>
              </tr>
            </thead>
            <tbody>
              ${calculation.selectedDetails.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="right">${item.quantity > 1 ? item.quantity : '-'}</td>
                  <td class="right">${item.linePrice.toLocaleString()} MAD</td>
                </tr>
              `).join('')}
              
              <tr style="height: 20px;"><td colspan="3"></td></tr>
              
              <tr>
                <td colspan="2" class="right">Subtotal</td>
                <td class="right">${calculation.subtotal.toLocaleString()} MAD</td>
              </tr>
              
              ${calculation.appliedDiscounts.map(d => `
                <tr class="discount-row">
                  <td colspan="2" class="right">Group Discount (${d.groupName})</td>
                  <td class="right">-${d.discountAmount.toLocaleString()} MAD</td>
                </tr>
              `).join('')}
              
              <tr class="total-row">
                <td colspan="2" class="right">Final Investment</td>
                <td class="right">${calculation.finalPrice.toLocaleString()} MAD</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 0.9em; color: #777; text-align: center; margin-top: 50px;">
            This is an estimate. Prices may vary based on specific requirements and finalized scope.
          </p>
        </body>
      </html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(quoteHtml);
    win.document.close();
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
