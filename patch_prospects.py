import os

file_path = "app/dashboard/prospects/page.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add states for scheduling
state_declarations = """
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    hostId: '',
    date: '',
    time: '',
    meetingLink: '',
    note: ''
  });
"""
content = content.replace("const [deleteTarget, setDeleteTarget] = useState(null);", "const [deleteTarget, setDeleteTarget] = useState(null);\n" + state_declarations)

# Add loadTeam and fetchSlots effects
effects = """
  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
      if (data) setTeamMembers(data);
    }
    loadTeam();
  }, []);

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

  const openScheduleModal = (prospect) => {
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

  const updateSchedule = (key, value) => {
    setScheduleData(prev => ({ ...prev, [key]: value }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.time) {
      toast.error("Please select a meeting time.");
      return;
    }

    setScheduleSubmitting(true);
    try {
      const supabase = createClient();
      
      // 1. Insert Lead
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        full_name: scheduleTarget.owner_name || scheduleTarget.business_name || 'Unknown',
        phone: scheduleTarget.phone,
        agency_name: scheduleTarget.business_name,
        email: scheduleTarget.email,
        instagram: scheduleTarget.ig_handle,
        status: 'NEW'
      }]).select().single();
      
      if (leadError) throw leadError;

      // 2. Insert Appointment
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

      // 3. Update prospect pipeline status
      await supabase.from('prospects').update({ pipeline_status: 'meeting scheduled' }).eq('id', scheduleTarget.id);

      toast.success("Meeting scheduled successfully");
      closeScheduleModal();
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    } finally {
      setScheduleSubmitting(false);
    }
  };
"""
content = content.replace("const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));", effects + "\n  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));")

# Change the button click action
content = content.replace("onClick={() => window.open('/book', '_blank')}", "onClick={() => openScheduleModal(prospect)}")

# Add the Schedule Modal JSX just before </ConfirmModal>
schedule_modal_jsx = """
      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && scheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
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
                    <select required value={scheduleData.hostId} onChange={e => { updateSchedule('hostId', e.target.value); updateSchedule('time', ''); }} className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent">
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
"""
content = content.replace("<ConfirmModal", schedule_modal_jsx + "\n      <ConfirmModal")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched successfully")
