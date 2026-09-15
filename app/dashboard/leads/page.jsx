'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Search, Filter, X, Clock, ArrowRight, User, Phone, Mail, Building, MapPin, Calendar, CheckCircle, Trash2, CheckSquare, Square, MinusSquare, AlertTriangle } from 'lucide-react';

// Format date natively
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoString));
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(isoString));
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Selection & Deletion state
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, singleId: null, count: 0 });

  const availableStatuses = ['ALL', ...Array.from(new Set(leads.map(l => l.status || 'NEW')))];

  const openSlideOver = (lead) => {
    setSelectedLead(lead);
    setIsSlideOverOpen(true);
  };

  const closeSlideOver = () => {
    setIsSlideOverOpen(false);
    setTimeout(() => setSelectedLead(null), 300); // delay to allow animation
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter(lead => {
    const term = search.toLowerCase();
    const matchesSearch = (
      (lead.full_name && lead.full_name.toLowerCase().includes(term)) ||
      (lead.agency_name && lead.agency_name.toLowerCase().includes(term)) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phone && lead.phone.toLowerCase().includes(term))
    );
    const matchesStatus = filterStatus === 'ALL' || (lead.status || 'NEW') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id));
  const isSomeSelected = filteredLeads.some(l => selectedLeadIds.has(l.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds(new Set());
    } else {
      const next = new Set(selectedLeadIds);
      filteredLeads.forEach(l => next.add(l.id));
      setSelectedLeadIds(next);
    }
  };

  const toggleSelectLead = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedLeadIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedLeadIds(next);
  };

  const requestDeleteSingle = (id, e) => {
    e.stopPropagation();
    setConfirmModal({ open: true, singleId: id, count: 1 });
  };

  const requestDeleteSelected = () => {
    if (selectedLeadIds.size === 0) return;
    setConfirmModal({ open: true, singleId: null, count: selectedLeadIds.size });
  };

  const confirmDelete = async () => {
    const idsToDelete = confirmModal.singleId 
      ? [confirmModal.singleId] 
      : Array.from(selectedLeadIds);

    if (idsToDelete.length === 0) return;
    setDeleting(true);

    try {
      const supabase = createClient();
      // Cleanup relations safely first
      await supabase.from('appointments').delete().in('lead_id', idsToDelete);
      await supabase.from('form_sessions').update({ lead_id: null }).in('lead_id', idsToDelete);
      await supabase.from('pending_interactions').delete().in('lead_id', idsToDelete);
      
      const { error } = await supabase.from('leads').delete().in('id', idsToDelete);
      if (error) throw error;

      // Update state
      setLeads(prev => prev.filter(l => !idsToDelete.includes(l.id)));
      setSelectedLeadIds(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });

      if (selectedLead && idsToDelete.includes(selectedLead.id)) {
        closeSlideOver();
      }

      setConfirmModal({ open: false, singleId: null, count: 0 });
    } catch (err) {
      console.error('Failed to delete leads:', err);
      alert('Failed to delete: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const updateLeadStatus = async (newStatus) => {
    if (!selectedLead) return;
    try {
      const supabase = createClient();
      const updated_at = new Date().toISOString();
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at })
        .eq('id', selectedLead.id);

      if (error) throw error;

      const updatedLead = { ...selectedLead, status: newStatus, updated_at };
      setSelectedLead(updatedLead);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Leads Overview</h1>
          <p className="text-brand-muted text-sm mt-1">Manage and track your incoming leads.</p>
        </div>
        {selectedLeadIds.size > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in duration-200">
            <span className="text-xs text-brand-muted font-medium">
              {selectedLeadIds.size} selected
            </span>
            <button
              onClick={() => setSelectedLeadIds(new Set())}
              className="px-3 py-1.5 text-xs text-brand-muted hover:text-brand-text bg-brand-bg border border-brand-border rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={requestDeleteSelected}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedLeadIds.size})
            </button>
          </div>
        )}
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            {selectedLeadIds.size > 0 && (
              <button
                onClick={requestDeleteSelected}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete ({selectedLeadIds.size})
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-medium text-brand-text hover:bg-brand-border/40 transition-colors w-full sm:w-auto justify-center"
              >
                <Filter className="w-4 h-4" />
                {filterStatus === 'ALL' ? 'Filter' : filterStatus}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-lg shadow-lg z-20 py-1">
                    {availableStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          filterStatus === status 
                            ? 'bg-brand-accent/10 text-brand-accent font-medium' 
                            : 'text-brand-text hover:bg-brand-bg'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-brand-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-accent" />
              <p>Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-brand-muted">No leads found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-brand-text">
              <thead className="text-xs uppercase bg-brand-bg/50 text-brand-muted border-b border-brand-border">
                <tr>
                  <th className="w-12 px-4 py-4 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 text-brand-muted hover:text-brand-text transition-colors"
                      title={isAllSelected ? "Deselect All" : "Select All"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-accent" />
                      ) : isSomeSelected ? (
                        <MinusSquare className="w-4 h-4 text-brand-accent" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Business</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Problem / Timeline</th>
                  <th className="px-6 py-4 font-semibold text-right">Date</th>
                  <th className="w-16 px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.has(lead.id);
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => openSlideOver(lead)} 
                      className={`hover:bg-brand-bg/30 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-brand-accent/5' : ''
                      }`}
                    >
                      <td className="w-12 px-4 py-4 text-center" onClick={(e) => toggleSelectLead(lead.id, e)}>
                        <button className="p-1 text-brand-muted hover:text-brand-text transition-colors">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-accent" />
                          ) : (
                            <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-brand-text">{lead.full_name || 'N/A'}</div>
                        <div className="text-brand-muted text-xs mt-1 flex flex-col gap-0.5">
                          {lead.email && <span>{lead.email}</span>}
                          {lead.phone && <span>{lead.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.agency_name || 'N/A'}</div>
                        {lead.business_type && (
                          <div className="text-brand-muted text-xs mt-1">{lead.business_type}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'pending for confirmation' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          lead.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          lead.status === 'canceled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          lead.status === 'follow up scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          lead.status === 'followed up' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          lead.status === 'followedup 2' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          lead.status === 'expired' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                          'bg-brand-border/50 text-brand-muted border border-brand-border'
                        }`}>
                          {lead.status || 'pending for confirmation'}
                        </span>
                        {lead.qualification_score !== null && lead.qualification_score !== undefined && (
                          <div className="text-[10px] text-brand-muted mt-2 font-semibold">
                            Score: {lead.qualification_score}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        {lead.main_problem ? (
                          <div className="truncate text-xs text-brand-text mb-1" title={lead.main_problem}>
                            {lead.main_problem}
                          </div>
                        ) : (
                          <span className="text-brand-muted text-xs italic">-</span>
                        )}
                        {lead.buying_timeline && (
                          <div className="text-[10px] text-brand-accent/80 font-medium">
                            {lead.buying_timeline}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-brand-muted text-xs">
                        {formatDate(lead.created_at)}
                        <div className="text-[10px] mt-1">{formatTime(lead.created_at)}</div>
                      </td>
                      <td className="w-16 px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => requestDeleteSingle(lead.id, e)}
                          className="p-2 text-brand-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over backdrop */}
      {isSlideOverOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] transition-opacity"
          onClick={closeSlideOver}
        />
      )}

      {/* Slide-over panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-brand-surface border-l border-brand-border z-[100] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {selectedLead && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <h2 className="text-lg font-semibold text-brand-text">Lead Details</h2>
              <button 
                onClick={closeSlideOver}
                className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="space-y-6">
                {/* Header Info */}
                <div>
                  <h3 className="text-xl font-bold text-brand-text">{selectedLead.full_name || 'No Name'}</h3>
                  <div className="mt-2 space-y-2">
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-sm text-brand-muted">
                        <Mail className="w-4 h-4" />
                        <span>{selectedLead.email}</span>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2 text-sm text-brand-muted">
                        <Phone className="w-4 h-4" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    )}
                    {selectedLead.agency_name && (
                      <div className="flex items-center gap-2 text-sm text-brand-muted">
                        <Building className="w-4 h-4" />
                        <span>{selectedLead.agency_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-brand-border" />

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Activity Timeline</h4>
                  <div className="relative border-l border-brand-border ml-3 space-y-6">
                    
                    {/* Status Update (Mock latest) */}
                    <div className="relative pl-6">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-accent ring-4 ring-brand-surface" />
                      <div className="flex items-start gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-text flex items-center gap-2">
                            Status: 
                            <select 
                              value={selectedLead.status || 'NEW'} 
                              onChange={(e) => updateLeadStatus(e.target.value)}
                              className="bg-brand-bg border border-brand-border text-brand-text text-xs rounded px-2 py-1 outline-none"
                            >
                              <option value="NEW">NEW</option>
                              <option value="pending for confirmation">pending for confirmation</option>
                              <option value="confirmed">confirmed</option>
                              <option value="follow up scheduled">follow up scheduled</option>
                              <option value="followed up">followed up</option>
                              <option value="canceled">canceled</option>
                            </select>
                          </p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {formatDate(selectedLead.updated_at || selectedLead.created_at)} at {formatTime(selectedLead.updated_at || selectedLead.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-muted/80 mt-1">Lead status was updated.</p>
                    </div>

                    {/* Additional fields mock timeline events */}
                    {(selectedLead.main_problem || selectedLead.buying_timeline || selectedLead.current_booking_method || selectedLead.fleet_size) && (
                      <div className="relative pl-6">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-muted ring-4 ring-brand-surface" />
                        <div className="flex items-start gap-2 mb-1">
                          <User className="w-4 h-4 text-brand-muted mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-brand-text">Formulaire de qualification</p>
                            <p className="text-xs text-brand-muted mt-0.5">
                              {formatDate(selectedLead.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 bg-brand-bg p-3 rounded-lg border border-brand-border space-y-3">
                          {selectedLead.current_booking_method && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Propriétaire ou gérant ?</p>
                              <p className="text-sm font-medium text-brand-text">{selectedLead.current_booking_method}</p>
                            </div>
                          )}
                          {selectedLead.fleet_size && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Nombre de voitures dans votre flotte</p>
                              <p className="text-sm font-medium text-brand-text">{selectedLead.fleet_size}</p>
                            </div>
                          )}
                          {selectedLead.main_problem && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Où perdez-vous le plus de réservations ?</p>
                              <p className="text-sm font-medium text-brand-text">{selectedLead.main_problem}</p>
                            </div>
                          )}
                          {selectedLead.buying_timeline && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Délai / Timeline</p>
                              <p className="text-sm font-medium text-brand-text">{selectedLead.buying_timeline}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Creation */}
                    <div className="relative pl-6">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-muted ring-4 ring-brand-surface" />
                      <div className="flex items-start gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-brand-muted mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-brand-text">Landed on platform</p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {formatDate(selectedLead.created_at)} at {formatTime(selectedLead.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-muted/80 mt-1">Lead submitted the form and entered the CRM.</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1A1A1B] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {confirmModal.count === 1 ? 'Delete Lead' : `Delete ${confirmModal.count} Leads`}
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete {confirmModal.count === 1 ? 'this lead' : `these ${confirmModal.count} leads`}? This will permanently remove their records, appointments, and workflow history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, singleId: null, count: 0 })}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
