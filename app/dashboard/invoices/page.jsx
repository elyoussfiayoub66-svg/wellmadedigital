'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Trash2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    id: null,
    status: 'Pending',
    amount: ''
  });

  const fetchInvoices = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        leads(full_name, agency_name),
        projects(name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openEditModal = (invoice) => {
    setFormData({
      id: invoice.id,
      status: invoice.status || 'Pending',
      amount: invoice.amount || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: formData.status,
          amount: formData.amount
        })
        .eq('id', formData.id);

      if (error) throw error;

      closeModal();
      toast.success("Invoice updated successfully");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const executeDelete = async () => {
    const id = confirmDelete.id;
    const supabase = createClient();
    try {
      await supabase.from('invoices').delete().eq('id', id);
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice.");
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Invoices</h1>
          <p className="text-brand-text/70">Manage your automated billing and invoices.</p>
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-dark/5 bg-brand-bg/50">
                <th className="p-4 font-medium text-brand-text/70 text-sm">Invoice Number</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Client Name</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Project Name</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Type</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Amount</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Status</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-brand-dark/5">
                    <td className="p-4"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-32 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-32 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-brand-dark/10 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-5 bg-brand-dark/10 rounded-full"></div></td>
                    <td className="p-4"><div className="flex justify-end gap-2"><div className="w-7 h-7 bg-brand-dark/10 rounded-md"></div><div className="w-7 h-7 bg-brand-dark/10 rounded-md"></div></div></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-brand-text/50">
                    No invoices generated yet. Create a project and set it to Active to automatically generate a deposit invoice.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-brand-dark/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4 font-medium text-brand-text">{inv.invoice_number}</td>
                    <td className="p-4 text-brand-text/80 text-sm">{inv.leads?.agency_name || inv.leads?.full_name || 'No Client'}</td>
                    <td className="p-4 text-brand-text/80 text-sm">{inv.projects?.name || 'No Project'}</td>
                    <td className="p-4 text-brand-text/80 text-sm">{inv.type}</td>
                    <td className="p-4 font-medium text-brand-text">
                      MAD {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(inv)} className="p-1.5 text-brand-text/50 hover:text-brand-accent hover:bg-brand-accent/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-brand-dark/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-dark/5 shrink-0">
              <h2 className="text-xl font-medium text-brand-text">Edit Invoice</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="edit-invoice-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Amount (MAD)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => updateForm('amount', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Status</label>
                  <select required value={formData.status} onChange={e => updateForm('status', e.target.value)} className="w-full bg-brand-bg border border-brand-dark/10 rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-dark/5 bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="edit-invoice-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete Invoice"
        confirmStyle="danger"
      />
    </div>
  );
}
