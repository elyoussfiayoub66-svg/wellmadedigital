'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Building2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [agencyRevenue, setAgencyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    project_id: '',
    amount: '',
    category: 'Software/SaaS',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const fetchInitialData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // 1. Fetch Expenses
    const { data: expensesData, error: expError } = await supabase
      .from('expenses')
      .select('*, projects(name)')
      .order('expense_date', { ascending: false });

    if (!expError && expensesData) {
      setExpenses(expensesData);
    }

    // 2. Fetch Projects (for dropdown)
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');
    
    if (projectsData) {
      setProjects(projectsData);
    }

    // 3. Fetch Paid Invoices to calculate the Agency's 13% cut
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'Paid');
      
    if (invoicesData) {
      const totalRevenue = invoicesData.reduce((sum, inv) => sum + Number(inv.amount), 0);
      setAgencyRevenue(totalRevenue * 0.13); // 13% Cut
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const openModal = () => {
    setFormData({
      project_id: '',
      amount: '',
      category: 'Software/SaaS',
      description: '',
      expense_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        project_id: formData.project_id || null, // null means general agency expense
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        expense_date: formData.expense_date
      };

      const { error } = await supabase.from('expenses').insert([payload]);
      if (error) throw error;

      closeModal();
      toast.success("Expense added successfully");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense.");
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
      await supabase.from('expenses').delete().eq('id', id);
      toast.success("Expense deleted successfully");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense.");
    }
  };

  // Calculations
  const generalExpenses = expenses.filter(e => !e.project_id).reduce((sum, e) => sum + Number(e.amount), 0);
  const projectExpenses = expenses.filter(e => e.project_id).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpenses = generalExpenses + projectExpenses;
  const netProfit = agencyRevenue - totalExpenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Expenses & Agency Profit</h1>
          <p className="text-brand-text/70">Track the agency's 13% revenue cut and all expenses.</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90  transition-opacity">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-brand-surface p-6 rounded-xl border border-brand-border h-32 flex flex-col justify-between">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-brand-dark/10 rounded-lg"></div>
                  <div className="h-4 bg-brand-dark/10 rounded w-24 mt-2"></div>
                </div>
                <div className="h-8 bg-brand-dark/10 rounded w-32"></div>
              </div>
            ))}
          </div>
          <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden h-96">
            <div className="p-5 border-b border-brand-border bg-brand-bg/30">
              <div className="h-5 bg-brand-dark/10 rounded w-32"></div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-brand-dark/5 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border ">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Wallet className="w-5 h-5" /></div>
                <h3 className="text-sm font-medium text-brand-text/70">Agency Revenue (13% Cut)</h3>
              </div>
              <div className="text-3xl font-black text-brand-text">MAD {agencyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border ">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
                <h3 className="text-sm font-medium text-brand-text/70">General Expenses</h3>
              </div>
              <div className="text-3xl font-black text-brand-text text-red-600">MAD {generalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border ">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                <h3 className="text-sm font-medium text-brand-text/70">Project Expenses</h3>
              </div>
              <div className="text-3xl font-black text-brand-text text-orange-600">MAD {projectExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div className={`p-6 rounded-xl border  ${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-medium ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>Net Agency Profit</h3>
              </div>
              <div className={`text-3xl font-black ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                MAD {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-brand-surface rounded-xl border border-brand-border  overflow-hidden">
            <div className="p-5 border-b border-brand-border bg-brand-bg/30 flex justify-between items-center">
              <h3 className="font-medium text-brand-text">Expense History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/50">
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Date</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Description</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Category</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Type / Project</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Amount</th>
                    <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-brand-text/50">No expenses recorded yet.</td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                        <td className="p-4 text-sm text-brand-text/70">{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-brand-text">{expense.description || 'No description'}</td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-1 bg-brand-dark/5 text-brand-text/70 text-xs font-medium rounded">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {expense.project_id ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded">
                              <Briefcase className="w-3 h-3" /> Project: {expense.projects?.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                              <Building2 className="w-3 h-3" /> General Agency
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-red-600">
                          - MAD {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl  overflow-hidden border border-brand-border flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <h2 className="text-xl font-medium text-brand-text">Add Expense</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Expense Type</label>
                  <select 
                    value={formData.project_id} 
                    onChange={e => updateForm('project_id', e.target.value)} 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  >
                    <option value="">General Agency Expense (e.g., Software, Rent)</option>
                    <optgroup label="Project Expenses">
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Amount (MAD) *</label>
                    <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => updateForm('amount', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Date</label>
                    <input required type="date" value={formData.expense_date} onChange={e => updateForm('expense_date', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Category</label>
                  <select required value={formData.category} onChange={e => updateForm('category', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
                    <option value="Software/SaaS">Software / SaaS</option>
                    <option value="Advertising">Advertising / Ads</option>
                    <option value="Freelancers">Freelancers / Outsourcing</option>
                    <option value="Hardware">Hardware / Equipment</option>
                    <option value="Office">Office / Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Description *</label>
                  <input required type="text" placeholder="e.g., Vercel Hosting, Facebook Ads" value={formData.description} onChange={e => updateForm('description', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="expense-form" 
                type="submit" 
                disabled={submitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90  transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Add Expense'}
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
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete Expense"
        confirmStyle="danger"
      />
    </div>
  );
}
