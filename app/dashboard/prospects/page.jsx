'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Edit2, Trash2, X, Search, CalendarPlus, Plus, ChevronLeft, ChevronRight, MapPin, AlignLeft, Users, AtSign, Megaphone, AlertCircle, Send, UploadCloud, Download } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import toast, { Toaster } from 'react-hot-toast';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('All');
  const [filterOutreach, setFilterOutreach] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  // Selection
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // 2-Column Container State
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerCity, setDrawerCity] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerSaving, setDrawerSaving] = useState(false);

  // Global Announcement Modal State
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcing, setAnnouncing] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef(null);
  
  // Phone Check State
  const [phoneError, setPhoneError] = useState('');

  const [scheduleData, setScheduleData] = useState({
    hostId: '',
    date: '',
    time: '',
    meetingLink: '',
    note: ''
  });

  const [formData, setFormData] = useState({
    id: null,
    business_name: '',
    owner_name: '',
    niche: '',
    ig_handle: '',
    phone: '',
    email: '',
    pipeline_status: 'not contacted',
    outreach_status: 'not called',
    followup_status: ''
  });

  const fetchProspectsAndAnnouncements = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('id, full_name').eq('id', user.id).single();
      if (profile) setCurrentUser(profile);
    }
    
    // Fetch Prospects
    const { data: pData } = await supabase.from('prospects').select('*').order('created_at', { ascending: false });
    if (pData) setProspects(pData);
    
    // Fetch Global Announcements
    const { data: aData } = await supabase.from('crm_announcements').select('*').order('created_at', { ascending: false }).limit(20);
    if (aData) setGlobalAnnouncements(aData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProspectsAndAnnouncements();
  }, []);

  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
      if (data) {
        const withTags = data.map(m => ({ ...m, tag: m.full_name.replace(/\s+/g, '') }));
        setTeamMembers(withTags);
      }
    }
    loadTeam();
  }, []);

  // Phone duplicate checker
  useEffect(() => {
    if (formData.phone && formData.phone.trim().length > 4) {
      // Check if another prospect has this exact phone
      const isDuplicate = prospects.some(p => p.phone === formData.phone && p.id !== formData.id);
      if (isDuplicate) {
        setPhoneError('This phone number already exists in the CRM.');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  }, [formData.phone, formData.id, prospects]);

  const openAddModal = () => {
    setFormData({
      id: null,
      business_name: '',
      owner_name: '',
      niche: '',
      ig_handle: '',
      phone: '',
      email: '',
      pipeline_status: 'not contacted',
      outreach_status: 'not called',
      followup_status: ''
    });
    setPhoneError('');
    setIsModalOpen(true);
  };

  const downloadTemplate = () => {
    const csvContent = "business_name,owner_name,email,phone,ig_handle,niche\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "prospects_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    setImporting(true);
    setImportResults(null);
    
    const isCsv = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          uploadParsedData(results.data);
        },
        error: (err) => {
          setImportResults({ total: 0, success: 0, failed: 0, errors: ['Failed to parse CSV'] });
          setImporting(false);
        }
      });
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        uploadParsedData(jsonData);
      };
      reader.onerror = () => {
        setImportResults({ total: 0, success: 0, failed: 0, errors: ['Failed to read Excel file'] });
        setImporting(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportResults({ total: 0, success: 0, failed: 0, errors: ['Unsupported file type. Use CSV or Excel.'] });
      setImporting(false);
    }
  };

  const uploadParsedData = async (data) => {
    if (!data || data.length === 0) {
      setImportResults({ total: 0, success: 0, failed: 0, errors: ['File is empty or invalid'] });
      setImporting(false);
      return;
    }

    const supabase = createClient();
    let successCount = 0;
    let failedCount = 0;
    const errors = [];
    
    const existingPhones = new Set(prospects.map(p => p.phone).filter(Boolean));
    const processedPhones = new Set();
    
    const validRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      
      const bName = row.business_name || row['Business Name'] || row.BusinessName || '';
      const oName = row.owner_name || row['Owner Name'] || row.OwnerName || '';
      const email = row.email || row.Email || '';
      const phone = (row.phone || row.Phone || '')?.toString().trim();
      const ig = row.ig_handle || row['IG Handle'] || row.ig || '';
      const niche = row.niche || row.Niche || '';

      if (!bName) {
        failedCount++;
        errors.push(`Row ${rowNum}: Missing business_name`);
        continue;
      }
      
      if (phone && phone.length > 4) {
        if (existingPhones.has(phone) || processedPhones.has(phone)) {
          failedCount++;
          errors.push(`Row ${rowNum}: Duplicate phone number (${phone})`);
          continue;
        }
        processedPhones.add(phone);
      }
      
      validRows.push({
        business_name: bName,
        owner_name: oName,
        email: email,
        phone: phone,
        ig_handle: ig,
        niche: niche,
        pipeline_status: 'not contacted',
        outreach_status: 'not called',
        followup_status: '',
        created_by: currentUser?.id
      });
    }

    if (validRows.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize);
        const { error } = await supabase.from('prospects').insert(chunk);
        
        if (error) {
           failedCount += chunk.length;
           errors.push(`Failed to insert batch starting at row ${i + 1}: ${error.message}`);
        } else {
           successCount += chunk.length;
        }
      }
    }

    setImportResults({
      total: data.length,
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10)
    });
    
    setImporting(false);
    
    if (successCount > 0) {
      toast.success(`Imported ${successCount} prospects`);
      fetchProspectsAndAnnouncements();
    }
  };


  const openEditModal = (prospect, e) => {
    if (e) e.stopPropagation();
    setFormData({ ...prospect });
    setPhoneError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // MENTION LOGIC (Global Announcement)
  const handleAnnouncementChange = (e) => {
    const val = e.target.value;
    setNewAnnouncement(val);
    
    const words = val.split(/[\s\n]/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const insertMention = (tag) => {
    const words = newAnnouncement.split(/[\s\n]/);
    words.pop();
    const newVal = words.join(' ') + (words.length > 0 ? ' ' : '') + `@${tag} `;
    setNewAnnouncement(newVal);
    setShowMentionMenu(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const addGlobalAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setAnnouncing(true);
    try {
      const supabase = createClient();
      
      const { data: newAnn, error: annError } = await supabase.from('crm_announcements').insert([{
        author_id: currentUser?.id,
        author_name: currentUser?.full_name || 'Team Member',
        content: newAnnouncement
      }]).select().single();
      
      if (annError) {
        if (annError.message.includes('does not exist')) {
          toast.error("Database table missing. Please run crm_announcements.sql");
        } else {
          throw annError;
        }
        return;
      }

      // Notify Tagged Users
      const taggedAll = newAnnouncement.includes('@All');
      const notifyPromises = [];
      for (const member of teamMembers) {
        if (member.id === currentUser?.id) continue;
        const isTagged = taggedAll || newAnnouncement.includes(`@${member.tag}`);
        if (isTagged) {
          notifyPromises.push(
            supabase.from('notifications').insert({
              user_id: member.id,
              type: 'info',
              title: 'New Announcement Mention',
              message: `${currentUser?.full_name || 'Someone'} tagged you in a global announcement.`
            })
          );
        }
      }
      if (notifyPromises.length > 0) await Promise.all(notifyPromises);

      toast.success('Announcement posted');
      setNewAnnouncement('');
      setIsAnnounceModalOpen(false);
      setGlobalAnnouncements(prev => [newAnn, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to post announcement');
    } finally {
      setAnnouncing(false);
    }
  };

  const deleteGlobalAnnouncement = async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('crm_announcements').delete().eq('id', id);
      if (error) throw error;
      toast.success('Announcement deleted');
      setGlobalAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete announcement');
    }
  };

  const filteredMentions = [
    { tag: 'All', full_name: 'Everyone' },
    ...teamMembers.filter(m => m.id !== currentUser?.id)
  ].filter(m => m.tag.toLowerCase().includes(mentionQuery) || m.full_name.toLowerCase().includes(mentionQuery));


  // Schedule Modal
  useEffect(() => {
    async function fetchSlots() {
      if (!scheduleData.hostId || !scheduleData.date) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/availability?date=${scheduleData.date}&assignee_id=${scheduleData.hostId}`);
        const data = await res.json();
        if (res.ok && data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [scheduleData.hostId, scheduleData.date]);

  const openScheduleModal = (prospect, e) => {
    if (e) e.stopPropagation();
    setScheduleTarget(prospect);
    setScheduleData({
      hostId: '',
      date: '',
      time: '',
      meetingLink: '',
      note: ''
    });
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduleTarget(null);
  };

  const updateSchedule = (key, value) => setScheduleData(prev => ({ ...prev, [key]: value }));

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.time) return toast.error("Please select a meeting time.");
    
    setScheduleSubmitting(true);
    try {
      const supabase = createClient();
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        full_name: scheduleTarget.owner_name || scheduleTarget.business_name || 'Unknown',
        phone: scheduleTarget.phone,
        agency_name: scheduleTarget.business_name,
        email: scheduleTarget.email,
        instagram: scheduleTarget.ig_handle,
        status: 'NEW'
      }]).select().single();
      
      if (leadError) throw leadError;

      const scheduledAt = new Date(`${scheduleData.date}T${scheduleData.time}:00.000Z`).toISOString();
      const { error: apptError } = await supabase.from('appointments').insert([{
        lead_id: leadData.id,
        assignee_id: scheduleData.hostId,
        scheduled_at: scheduledAt,
        notes: scheduleData.note,
        meeting_link: scheduleData.meetingLink,
        status: 'SCHEDULED'
      }]);

      if (apptError) throw apptError;
      await supabase.from('prospects').update({ pipeline_status: 'meeting scheduled' }).eq('id', scheduleTarget.id);

      toast.success("Meeting scheduled successfully");
      closeScheduleModal();
      fetchProspectsAndAnnouncements();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneError) return; // Prevent submission if duplicate
    
    setSubmitting(true);
    const supabase = createClient();
    try {
      if (formData.id) {
        const { error } = await supabase.from('prospects').update({
            business_name: formData.business_name,
            owner_name: formData.owner_name,
            niche: formData.niche,
            ig_handle: formData.ig_handle,
            phone: formData.phone,
            email: formData.email,
            pipeline_status: formData.pipeline_status,
            outreach_status: formData.outreach_status,
            followup_status: formData.followup_status
          }).eq('id', formData.id);

        if (error) throw error;
        toast.success('Prospect updated!');
        if (selectedProspect?.id === formData.id) setSelectedProspect(prev => ({ ...prev, ...formData }));
      } else {
        const { error } = await supabase.from('prospects').insert([{
            business_name: formData.business_name,
            owner_name: formData.owner_name,
            niche: formData.niche,
            ig_handle: formData.ig_handle,
            phone: formData.phone,
            email: formData.email,
            pipeline_status: formData.pipeline_status,
            outreach_status: formData.outreach_status,
            followup_status: formData.followup_status,
            created_by: currentUser?.id
          }]);

          if (error) {
            if (error.message.includes('created_by')) {
              toast.error("Database missing 'created_by' column. Run prospects_created_by.sql");
            } else {
              throw error;
            }
          } else {
            toast.success('Prospect added!');
          }
      }

      closeModal();
      fetchProspectsAndAnnouncements(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error("Failed to save prospect.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prospect, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(prospect);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    try {
      await supabase.from('prospects').delete().eq('id', deleteTarget.id);
      toast.success('Prospect deleted');
      if (selectedProspect?.id === deleteTarget.id) setSelectedProspect(null);
      
      // Update local state to immediately remove it
      setProspects(prev => prev.filter(p => p.id !== deleteTarget.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete prospect.");
    } finally {
      setDeleteTarget(null);
    }
  };

  // IN-PAGE CONTAINER LOGIC
  const openProspectPanel = (prospect) => {
    setSelectedProspect(prospect);
    setDrawerCity(prospect.city || '');
    setDrawerNotes(prospect.notes || '');
  };

  const saveProspectDetails = async () => {
    if (!selectedProspect) return;
    setDrawerSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('prospects').update({
        city: drawerCity,
        notes: drawerNotes
      }).eq('id', selectedProspect.id);
      
      if (error) {
        if (error.message.includes('does not exist')) toast.error("Run prospects_db_update.sql first.");
        else throw error;
      } else {
        toast.success('Details saved');
        setProspects(prev => prev.map(p => p.id === selectedProspect.id ? { ...p, city: drawerCity, notes: drawerNotes } : p));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save details');
    } finally {
      setDrawerSaving(false);
    }
  };


  const pipelineOptions = ["not contacted", "contacted", "meeting scheduled", "discovery call completed", "negotiation", "closed", "lost"];
  const outreachOptions = ["email sent", "dm sent", "no answer", "no answer 1", "no answer 2", "no answer 3", "voice mail", "voice mail 1", "voice mail 2", "not called", "meeting booked", "follow up", "not interested", "do not call", "wrong contact"];
  const followupOptions = ["", "meeting booked", "not interested", "do not contact", "no answer", "voice mail"];

  const uniqueNiches = [...new Set(prospects.map(p => p.niche).filter(Boolean))].sort();

  const displayedProspects = prospects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      p.business_name?.toLowerCase().includes(q) || 
      p.owner_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.ig_handle?.toLowerCase().includes(q) ||
      p.niche?.toLowerCase().includes(q)
    );
    if (!matchesSearch) return false;

    if (filterNiche !== 'All' && p.niche !== filterNiche) return false;
    if (filterOutreach !== 'All' && p.outreach_status !== filterOutreach) return false;

    if (activeTab === 'all') return true;
    
    const out = p.outreach_status?.toLowerCase() || '';
    const follow = p.followup_status?.toLowerCase() || '';
    return out.includes('no answer') || out.includes('voice mail') || out.includes('follow up') || follow !== '';
  });


  // Select All Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(displayedProspects.map(p => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (id, e) => {
    e.stopPropagation();
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleExportExcel = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one prospect to export.');
      return;
    }
    const dataToExport = prospects.filter(p => selectedRows.includes(p.id)).map(p => ({
      'Business Name': p.business_name || '',
      'Owner Name': p.owner_name || '',
      'Email': p.email || '',
      'Phone': p.phone || '',
      'IG Handle': p.ig_handle || '',
      'Niche': p.niche || '',
      'Pipeline Status': p.pipeline_status || '',
      'Outreach Status': p.outreach_status || '',
      'City': p.city || '',
      'Notes': p.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Prospects");
    XLSX.writeFile(workbook, "Prospects_Export.xlsx");
  };

  const handleBulkMarkContacted = async () => {
    if (selectedRows.length === 0) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('prospects')
        .update({ pipeline_status: 'contacted' })
        .in('id', selectedRows);

      if (error) throw error;
      toast.success(`Marked ${selectedRows.length} prospects as contacted`);
      setProspects(prev => prev.map(p => selectedRows.includes(p.id) ? { ...p, pipeline_status: 'contacted' } : p));
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update prospects');
    }
  };

  const totalPages = Math.ceil(displayedProspects.length / rowsPerPage);
  const paginatedProspects = displayedProspects.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterNiche, filterOutreach, activeTab, rowsPerPage]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    const s = status.toLowerCase();
    if (s.includes('closed') || s.includes('booked') || s.includes('completed')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('lost') || s.includes('not interested') || s.includes('wrong') || s.includes('do not call')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('negotiation') || s.includes('no answer') || s.includes('voice mail') || s.includes('follow up')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const customSelectClass = "appearance-none bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent pr-10 cursor-pointer hover:border-brand-text/30 transition-colors bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"%23F7F5F0\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\"/></svg>')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px]";

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Prospects</h1>
          <p className="text-brand-text/70">Manage your outreach pipeline and followups.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Niche Filter */}
          <select value={filterNiche} onChange={e => setFilterNiche(e.target.value)} className={`${customSelectClass} min-w-[140px]`}>
            <option value="All">All Niches</option>
            {uniqueNiches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          
          {/* Outreach Filter */}
          <select value={filterOutreach} onChange={e => setFilterOutreach(e.target.value)} className={`${customSelectClass} min-w-[140px]`}>
            <option value="All">All Outreach</option>
            {outreachOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-sm text-brand-text"
            />
          </div>
          
          <button onClick={() => setIsAnnounceModalOpen(true)} className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors font-medium text-sm whitespace-nowrap">
            <Megaphone className="w-4 h-4" />
            Announcement
          </button>
          

          {selectedRows.length > 0 && (
            <>
              <button onClick={handleBulkMarkContacted} className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors font-medium text-sm whitespace-nowrap">
                <Users className="w-4 h-4" />
                Mark Contacted ({selectedRows.length})
              </button>
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors font-medium text-sm whitespace-nowrap">
                <Download className="w-4 h-4" />
                Export ({selectedRows.length})
              </button>
            </>
          )}
          <button onClick={() => {setIsImportModalOpen(true); setImportResults(null);}} className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors font-medium text-sm whitespace-nowrap">

            <UploadCloud className="w-4 h-4" />
            Import
          </button>

          <button onClick={openAddModal} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Global Announcements Container Above Tabs */}
      {globalAnnouncements.length > 0 && (
        <div className="mb-6 bg-brand-surface border border-brand-border rounded-xl p-4 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-text border-b border-brand-border pb-2">
            <Megaphone className="w-4 h-4 text-brand-accent" /> Team Announcements
          </div>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {globalAnnouncements.map((ann) => (
              <div key={ann.id} className="group relative min-w-[300px] max-w-[400px] shrink-0 bg-brand-bg/50 border border-brand-border p-3 rounded-xl flex gap-3 pr-8">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0 font-bold text-xs uppercase border border-brand-accent/30">
                  {ann.author_name?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-text truncate">{ann.author_name}</span>
                    <span className="text-[10px] text-brand-text/50 shrink-0">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-brand-text/80 mt-1 whitespace-pre-wrap leading-relaxed line-clamp-2">
                    {ann.content.split(/(@\w+)/g).map((part, index) => 
                      part.startsWith('@') ? <span key={index} className="text-brand-accent font-semibold">{part}</span> : part
                    )}
                  </p>
                </div>
                {(ann.author_id === currentUser?.id) && (
                  <button 
                    onClick={() => deleteGlobalAnnouncement(ann.id)}
                    className="absolute top-2 right-2 p-1.5 text-brand-text/30 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex border-b border-brand-border mb-6 shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          All Prospects
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'followups' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text/60 hover:text-brand-text'}`}
        >
          Followups
        </button>
      </div>

      {/* 2-COLUMN LAYOUT CONTAINER */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Side: Table */}
        <div className={`flex-1 flex flex-col min-w-0 bg-brand-surface rounded-xl border border-brand-border overflow-hidden transition-all duration-300 ${selectedProspect ? 'hidden lg:flex' : 'flex'}`}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50 sticky top-0 z-10 shadow-sm">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox"
                      className="rounded border-brand-border text-brand-accent focus:ring-brand-accent cursor-pointer"
                      checked={displayedProspects.length > 0 && selectedRows.length === displayedProspects.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Business Info</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Contact Details</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Pipeline Status</th>
                  <th className="p-4 font-medium text-brand-text/70 text-sm">Outreach Status</th>
                  {activeTab === 'followups' && (
                    <th className="p-4 font-medium text-brand-text/70 text-sm">Followup Status</th>
                  )}
                  <th className="p-4 font-medium text-brand-text/70 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'followups' ? 7 : 6} className="p-8 text-center text-brand-text/50">Loading prospects...</td>
                  </tr>
                ) : paginatedProspects.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'followups' ? 7 : 6} className="p-8 text-center text-brand-text/50">No prospects found.</td>
                  </tr>
                ) : (
                  paginatedProspects.map((prospect) => (
                    <tr 
                      key={prospect.id} 
                      onClick={() => openProspectPanel(prospect)}
                      className={`border-b border-brand-border hover:bg-brand-bg/50 transition-colors cursor-pointer group ${selectedProspect?.id === prospect.id ? 'bg-brand-bg/50 border-l-4 border-l-brand-accent' : 'border-l-4 border-l-transparent'} ${selectedRows.includes(prospect.id) ? 'bg-brand-bg/30' : ''}`}
                    >
                      <td className="p-4 w-12 text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          className="rounded border-brand-border text-brand-accent focus:ring-brand-accent cursor-pointer"
                          checked={selectedRows.includes(prospect.id)}
                          onChange={(e) => toggleRowSelection(prospect.id, e)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-brand-text group-hover:text-brand-accent transition-colors">{prospect.business_name}</div>
                        <div className="text-xs text-brand-text/60 mt-0.5">{prospect.owner_name || 'No owner listed'} • {prospect.niche || 'No niche'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-brand-text/80">{prospect.email || '-'}</div>
                        <div className="text-xs text-brand-text/60 mt-0.5">{prospect.phone || '-'} {prospect.ig_handle ? `• ${prospect.ig_handle}` : ''}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.pipeline_status)}`}>
                          {prospect.pipeline_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.outreach_status)}`}>
                          {prospect.outreach_status}
                        </span>
                      </td>
                      {activeTab === 'followups' && (
                        <td className="p-4">
                          {prospect.followup_status ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(prospect.followup_status)}`}>
                              {prospect.followup_status}
                            </span>
                          ) : (
                            <span className="text-xs text-brand-text/40">-</span>
                          )}
                        </td>
                      )}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => openScheduleModal(prospect, e)} className="p-1.5 text-brand-text/50 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Schedule Meeting">
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => openEditModal(prospect, e)} className="p-1.5 text-brand-text/50 hover:text-brand-accent hover:bg-brand-accent/10 rounded-md transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => handleDelete(prospect, e)} className="p-1.5 text-brand-text/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
          
          {/* Pagination Controls */}
          {!loading && displayedProspects.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-brand-border bg-brand-bg/30 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm text-brand-text/70">Rows per page:</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className={`${customSelectClass} py-1.5 pl-3 pr-8 min-h-0 bg-[right_8px_center] bg-[length:12px_12px]`}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={150}>150</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-brand-text/70">
                  {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, displayedProspects.length)} of {displayedProspects.length}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-text/70 hover:text-brand-text hover:bg-brand-surface disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-text/70 hover:text-brand-text hover:bg-brand-surface disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: IN-PAGE CONTAINER FOR PROSPECT DETAILS */}
        {selectedProspect && (
          <div className="w-full lg:w-[400px] shrink-0 bg-brand-surface border border-brand-border rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between p-5 border-b border-brand-border shrink-0 bg-brand-bg/50">
              <div>
                <h2 className="text-lg font-bold text-brand-text">{selectedProspect.business_name}</h2>
                <p className="text-xs text-brand-text/60 mt-1">{selectedProspect.owner_name} • {selectedProspect.niche}</p>
              </div>
              <button onClick={() => setSelectedProspect(null)} className="p-2 text-brand-text/50 hover:text-brand-text rounded-full hover:bg-brand-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
              
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getStatusColor(selectedProspect.pipeline_status)}`}>
                  {selectedProspect.pipeline_status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getStatusColor(selectedProspect.outreach_status)}`}>
                  {selectedProspect.outreach_status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-text border-b border-brand-border pb-2">
                  <AlignLeft className="w-4 h-4" /> Core Details
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-text/70 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> City
                  </label>
                  <input 
                    type="text" 
                    value={drawerCity} 
                    onChange={e => setDrawerCity(e.target.value)} 
                    placeholder="E.g. Los Angeles, CA"
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-text/70 flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" /> Notes
                  </label>
                  <textarea 
                    rows={8}
                    value={drawerNotes} 
                    onChange={e => setDrawerNotes(e.target.value)} 
                    placeholder="Background info, budget, goals..."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                  />
                </div>

                <button 
                  onClick={saveProspectDetails}
                  disabled={drawerSaving}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text text-sm font-medium py-2 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                >
                  {drawerSaving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Prospect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-2xl rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <h2 className="text-xl font-medium text-brand-text">{formData.id ? 'Edit' : 'Add'} Prospect</h2>
              <button onClick={closeModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="prospect-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Business Name</label>
                    <input required type="text" value={formData.business_name} onChange={e => updateForm('business_name', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Owner Name</label>
                    <input type="text" value={formData.owner_name} onChange={e => updateForm('owner_name', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Email</label>
                    <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className={`w-full bg-brand-bg border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:ring-brand-accent'} rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1`} />
                    {phoneError && <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> {phoneError}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">IG Handle</label>
                    <input type="text" value={formData.ig_handle} onChange={e => updateForm('ig_handle', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Niche</label>
                  <input type="text" value={formData.niche} onChange={e => updateForm('niche', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>

                <div className="border-t border-brand-border pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-brand-text mb-4">Pipeline & Outreach</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Pipeline Status</label>
                      <select value={formData.pipeline_status} onChange={e => updateForm('pipeline_status', e.target.value)} className={`${customSelectClass} w-full`}>
                        {pipelineOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">Outreach Status</label>
                      <select value={formData.outreach_status} onChange={e => updateForm('outreach_status', e.target.value)} className={`${customSelectClass} w-full`}>
                        {outreachOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-brand-text">Followup Status</label>
                      <select value={formData.followup_status} onChange={e => updateForm('followup_status', e.target.value)} className={`${customSelectClass} w-full`}>
                        {followupOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt || 'None'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="prospect-form" 
                type="submit" 
                disabled={submitting || !!phoneError}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {submitting ? 'Saving...' : 'Save Prospect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Announcement Modal */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl overflow-hidden border border-brand-border flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-brand-border shrink-0">
              <h2 className="text-lg font-medium text-brand-text flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-accent" /> New Announcement
              </h2>
              <button onClick={() => setIsAnnounceModalOpen(false)} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="relative">
                <div className="bg-brand-bg rounded-xl border border-brand-border p-3 focus-within:border-brand-accent focus-within:ring-1 focus-within:ring-brand-accent transition-all">
                  <textarea 
                    ref={textareaRef}
                    rows={4}
                    value={newAnnouncement}
                    onChange={handleAnnouncementChange}
                    placeholder="Type your announcement... Tag @All or @someone to push an alert to them."
                    className="w-full bg-transparent border-none text-sm text-brand-text focus:outline-none resize-none placeholder:text-brand-text/40"
                  />
                </div>

                {/* Mention Dropdown */}
                {showMentionMenu && (
                  <div className="absolute top-full left-0 mt-2 w-full max-h-48 overflow-y-auto bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50 p-1 custom-scrollbar">
                    {filteredMentions.length === 0 ? (
                      <div className="p-3 text-xs text-brand-text/50 text-center">No users found</div>
                    ) : (
                      filteredMentions.map(user => (
                        <button
                          key={user.tag}
                          type="button"
                          onClick={() => insertMention(user.tag)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-brand-bg rounded-lg transition-colors flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0 font-bold text-[10px] uppercase">
                            {user.tag === 'All' ? <AtSign className="w-3 h-3" /> : user.tag.slice(0,2)}
                          </div>
                          <span className="font-medium text-brand-text">{user.full_name}</span>
                          <span className="text-xs text-brand-text/40">@{user.tag}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-brand-border bg-brand-bg/50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsAnnounceModalOpen(false)} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                onClick={addGlobalAnnouncement} 
                disabled={announcing || !newAnnouncement.trim()}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {announcing ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && scheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
           {/* Modal omitted for brevity, logic identical to previously */}
           {/* (Wait, I must include it otherwise it's gone!) */}
           <div className="bg-brand-surface w-full max-w-lg rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
              <div>
                <h2 className="text-xl font-medium text-brand-text">Schedule Meeting</h2>
                <p className="text-xs text-brand-text/60 mt-1">with {scheduleTarget.business_name}</p>
              </div>
              <button onClick={closeScheduleModal} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="schedule-form" onSubmit={handleScheduleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Meeting Host</label>
                    <select required value={scheduleData.hostId} onChange={e => { updateSchedule('hostId', e.target.value); updateSchedule('time', ''); }} className={`${customSelectClass} w-full`}>
                      <option value="">Select a host</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Date</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={scheduleData.date} onChange={e => { updateSchedule('date', e.target.value); updateSchedule('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center justify-between">
                    Available Times
                    {loadingSlots && <span className="text-brand-accent text-xs">Loading...</span>}
                  </label>
                  
                  {!scheduleData.date || !scheduleData.hostId ? (
                    <div className="text-sm text-brand-text/50 p-4 border border-dashed border-brand-border rounded-lg text-center bg-brand-bg/50">
                      Select a host and date to see slots
                    </div>
                  ) : availableSlots.length === 0 && !loadingSlots ? (
                    <div className="text-sm text-red-500 p-4 border border-dashed border-red-200 rounded-lg text-center bg-red-50">
                      No available slots.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                      {availableSlots.map(slot => (
                        <button
                          key={slot} type="button"
                          onClick={() => updateSchedule('time', slot)}
                          className={`py-2 px-1 rounded-md text-xs font-medium transition-all ${
                            scheduleData.time === slot 
                              ? 'bg-brand-accent text-white ' 
                              : 'bg-brand-bg text-brand-text hover:border-brand-accent border border-brand-border'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-brand-text">Meeting Link (Optional)</label>
                  <input type="url" placeholder="https://zoom.us/j/..." value={scheduleData.meetingLink} onChange={e => updateSchedule('meetingLink', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Internal Notes</label>
                  <textarea rows={3} value={scheduleData.note} onChange={e => updateSchedule('note', e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-brand-border bg-brand-surface shrink-0 flex items-center justify-end gap-3">
              <button type="button" onClick={closeScheduleModal} className="text-brand-text/70 hover:text-brand-text text-sm font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
              <button 
                form="schedule-form" 
                type="submit" 
                disabled={scheduleSubmitting}
                className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {scheduleSubmitting ? 'Scheduling...' : 'Confirm Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Prospects Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-brand-border shrink-0">
              <h2 className="text-lg font-medium text-brand-text flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-brand-accent" /> Import Prospects
              </h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-brand-text/50 hover:text-brand-text p-1 rounded-full hover:bg-brand-bg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              {!importResults ? (
                <>
                  <div className="mb-6 bg-brand-bg/50 border border-brand-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-brand-text mb-2">Expected Format</h3>
                    <p className="text-xs text-brand-text/70 mb-3">Your CSV or Excel file should contain the following columns. <strong>business_name</strong> is required.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">business_name*</span>
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">owner_name</span>
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">email</span>
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">phone</span>
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">ig_handle</span>
                      <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded text-xs text-brand-text font-mono">niche</span>
                    </div>
                    <button onClick={downloadTemplate} className="text-sm text-brand-accent hover:underline flex items-center gap-1 font-medium">
                      <Download className="w-3.5 h-3.5" /> Download Template
                    </button>
                  </div>

                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center hover:border-brand-accent transition-colors bg-brand-bg/30 relative"
                  >
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <UploadCloud className="w-10 h-10 text-brand-text/30 mx-auto mb-3" />
                    <h3 className="text-brand-text font-medium mb-1">Drag and drop file here</h3>
                    <p className="text-brand-text/50 text-xs mb-4">Supports .CSV, .XLSX</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded-lg text-sm font-medium hover:border-brand-accent transition-colors disabled:opacity-50"
                    >
                      {importing ? 'Processing...' : 'Browse Files'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-6 text-center">
                    <div className="text-4xl mb-2">{importResults.failed === 0 && importResults.success > 0 ? '🎉' : importResults.success > 0 ? '⚠️' : '❌'}</div>
                    <h3 className="text-lg font-semibold text-brand-text mb-1">Import Complete</h3>
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{importResults.success}</div>
                        <div className="text-xs text-brand-text/60 uppercase tracking-wider font-medium">Added</div>
                      </div>
                      <div className="w-px h-8 bg-brand-border"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{importResults.failed}</div>
                        <div className="text-xs text-brand-text/60 uppercase tracking-wider font-medium">Failed</div>
                      </div>
                    </div>
                  </div>
                  
                  {importResults.errors.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Errors
                      </h4>
                      <ul className="space-y-1">
                        {importResults.errors.map((err, idx) => (
                          <li key={idx} className="text-xs text-red-400/80">• {err}</li>
                        ))}
                        {importResults.failed > 10 && (
                          <li className="text-xs text-brand-text/50 italic mt-2">...and {importResults.failed - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-brand-border bg-brand-bg/50 flex justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setIsImportModalOpen(false)} 
                className={`${importResults ? 'bg-brand-accent text-white border-transparent' : 'bg-brand-surface border-brand-border text-brand-text'} border px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all`}
              >
                {importResults ? 'Done' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 

        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleConfirmDelete} 
        title='Delete Prospect?' 
        message={`${deleteTarget?.business_name} will be permanently removed.`} 
        confirmText='Yes, Delete' 
        confirmStyle='danger' 
      />
      <Toaster position='top-right' />
    </div>
  );
}
