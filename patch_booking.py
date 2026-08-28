import re

def modify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 2 Replacements
    # 1. Update Problem Question
    content = content.replace(
        "What is the main problem you are trying to solve?",
        "What’s the biggest thing you wish your current system could do for you, but it can’t?"
    )
    # 2. Update Current Process Question
    content = content.replace(
        "What processes or tools are you currently using?",
        "How do you currently manage your business information, leads, clients, and daily operations?"
    )
    # 3. Update Desired Outcome Question
    content = content.replace(
        "What does the ideal outcome look like for you?",
        "If you could have one system built specifically around your business, what would you want it to make easier or completely automate?"
    )
    # 4. Make Budget Range Required
    content = content.replace(
        """<label className="text-sm font-medium text-brand-text">Budget Range <span className="text-brand-text/50 font-normal">(Optional)</span></label>
                    <select value={formData.budget} onChange={e => updateForm('budget', e.target.value)}""",
        """<label className="text-sm font-medium text-brand-text">Budget Range</label>
                    <select required value={formData.budget} onChange={e => updateForm('budget', e.target.value)}"""
    )

    # Step 3 and Logic Changes
    # 1. Update loadTeam to fetch closing rate
    old_loadTeam = """  // Fetch team members (profiles) on mount
  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('account_status', 'active');
      if (data) setTeamMembers(data);
    }
    loadTeam();
  }, []);"""
    
    new_loadTeam = """  // Fetch team members (profiles) on mount
  useEffect(() => {
    async function loadTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name, closing_rate').eq('account_status', 'active');
      if (data) {
        // Assign a mock closing rate if not present in DB for advanced distribution algorithm
        const membersWithRates = data.map(m => ({
           ...m, 
           closing_rate: m.closing_rate !== undefined && m.closing_rate !== null ? m.closing_rate : Math.floor(Math.random() * 100)
        }));
        setTeamMembers(membersWithRates);
      }
    }
    loadTeam();
  }, []);"""
    content = content.replace(old_loadTeam, new_loadTeam)

    # 2. Add state for memberAvailability
    content = content.replace(
        "const [availableSlots, setAvailableSlots] = useState([]);",
        "const [availableSlots, setAvailableSlots] = useState([]);\n  const [memberAvailability, setMemberAvailability] = useState({});"
    )

    # 3. Update fetchSlots logic to fetch for ALL team members
    old_fetchSlots = """  // Fetch available slots when assignee or date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!formData.assigneeId || !formData.meetingDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/availability?date=${formData.meetingDate}&assignee_id=${formData.assigneeId}`);
        const data = await res.json();
        
        if (!res.ok) {
          console.error("API returned an error:", data);
          alert(`API Error: ${data.error} \nDetails: ${data.details || 'None'}`);
          setAvailableSlots([]);
          return;
        }

        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        } else {
          console.warn("No availableSlots in response:", data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        alert(`Fetch error: ${err.message}`);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [formData.assigneeId, formData.meetingDate]);"""

    new_fetchSlots = """  // Fetch available slots for ALL team members
  useEffect(() => {
    async function fetchSlots() {
      if (!formData.meetingDate || teamMembers.length === 0) {
        setAvailableSlots([]);
        setMemberAvailability({});
        return;
      }
      setLoadingSlots(true);
      try {
        let allSlots = new Set();
        let availabilityMap = {}; // { timeSlot: [memberId1, memberId2] }

        await Promise.all(teamMembers.map(async (member) => {
          const res = await fetch(`/api/availability?date=${formData.meetingDate}&assignee_id=${member.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.availableSlots) {
              data.availableSlots.forEach(slot => {
                 allSlots.add(slot);
                 if (!availabilityMap[slot]) availabilityMap[slot] = [];
                 availabilityMap[slot].push(member.id);
              });
            }
          }
        }));

        setAvailableSlots(Array.from(allSlots).sort());
        setMemberAvailability(availabilityMap);
      } catch (err) {
        console.error("Fetch error:", err);
        alert(`Fetch error: ${err.message}`);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [formData.meetingDate, teamMembers]);"""
    content = content.replace(old_fetchSlots, new_fetchSlots)

    # 4. Update handleSubmit for smart routing
    old_submitStart = """  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meetingTime) {
      alert("Please select a time slot.");
      return;
    }
    setStatus('submitting');
    
    try {
      const supabase = createClient();"""

    new_submitStart = """  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meetingTime) {
      alert("Please select a time slot.");
      return;
    }

    setStatus('submitting');
    
    try {
      const supabase = createClient();

      // ADVANCED ROUTING LOGIC: Match the highest budget with the highest closing rate closer available at this time
      const availableMemberIds = memberAvailability[formData.meetingTime] || [];
      if (availableMemberIds.length === 0) throw new Error("No team members available for this slot.");

      // Sort available members by closing rate (descending)
      const availableMembers = teamMembers
          .filter(m => availableMemberIds.includes(m.id))
          .sort((a, b) => b.closing_rate - a.closing_rate);

      let selectedAssigneeId = availableMembers[0].id; // Default to best closer
      
      if (availableMembers.length > 1) {
          // Budget ranks: 30k_plus=4, 15k_to_30k=3, 5k_to_15k=2, under_5k=1
          const budget = formData.budget;
          let tierIndex = 0; // 0 is best closer
          
          if (budget === 'under_5k') {
              tierIndex = availableMembers.length - 1; // Lowest closer
          } else if (budget === '5k_to_15k') {
              tierIndex = Math.min(2, availableMembers.length - 1); 
          } else if (budget === '15k_to_30k') {
              tierIndex = Math.min(1, availableMembers.length - 1);
          } else if (budget === '30k_plus') {
              tierIndex = 0; // Best closer
          }
          
          selectedAssigneeId = availableMembers[tierIndex].id;
      }
      """
    
    content = content.replace(old_submitStart, new_submitStart)

    # 5. Fix assignee_id in Insert Appointment
    content = content.replace(
        "assignee_id: formData.assigneeId,",
        "assignee_id: selectedAssigneeId,"
    )

    # 6. Update UI for Step 3
    old_step3 = """              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Who would you like to meet with?</label>
                    <select 
                      required 
                      value={formData.assigneeId} 
                      onChange={e => { updateForm('assigneeId', e.target.value); updateForm('meetingTime', ''); }} 
                      className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all"
                    >
                      <option value="">Select a team member</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.full_name || 'Team Member'}</option>
                      ))}
                    </select>
                  </div>

                  {formData.assigneeId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Preferred Meeting Date</label>
                      <input 
                        required 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.meetingDate} 
                        onChange={e => { updateForm('meetingDate', e.target.value); updateForm('meetingTime', ''); }} 
                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" 
                      />
                    </div>
                  )}

                  {formData.meetingDate && formData.assigneeId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Available Times</label>"""

    new_step3 = """              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Preferred Meeting Date</label>
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.meetingDate} 
                      onChange={e => { updateForm('meetingDate', e.target.value); updateForm('meetingTime', ''); }} 
                      className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" 
                    />
                  </div>

                  {formData.meetingDate && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text">Available Times</label>"""

    content = content.replace(old_step3, new_step3)


    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    modify_file('c:\\Users\\AYOUB\\Desktop\\webgobuilder\\app\\book\\page.jsx')
