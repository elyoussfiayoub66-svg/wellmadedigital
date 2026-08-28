import re

def modify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update fetchClients
    fetch_injection = """
    // Fetch prospects to check source
    const { data: prospects } = await supabase
      .from('prospects')
      .select('email, phone, business_name, owner_name');

    if (!error && data) {
      // Process data for the table
      const processed = data.map(lead => {
        // Sort appointments by date to get the most recent
        const sortedAppts = lead.appointments?.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)) || [];
        const latestAppt = sortedAppts[0];

        // Determine source
        let source = 'Social Media';
        if (prospects) {
          const isProspect = prospects.some(p => {
             const emailMatch = p.email && lead.email && p.email.toLowerCase() === lead.email.toLowerCase();
             const phoneMatch = p.phone && lead.phone && p.phone === lead.phone;
             return emailMatch || phoneMatch;
          });
          if (isProspect) source = 'Cold Outreach';
        }

        return {
          ...lead,
          source,
          latest_appointment: latestAppt,
          projects_list: lead.projects || []
        };
      });
"""
    
    old_fetch_part = """
    if (!error && data) {
      // Process data for the table
      const processed = data.map(lead => {
        // Sort appointments by date to get the most recent
        const sortedAppts = lead.appointments?.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)) || [];
        const latestAppt = sortedAppts[0];

        return {
          ...lead,
          latest_appointment: latestAppt,
          projects_list: lead.projects || []
        };
      });
"""
    content = content.replace(old_fetch_part.strip(), fetch_injection.strip())

    # 2. Update Table Header
    old_th = """                <th className="p-4 font-medium text-brand-text/70 text-sm">Contact</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Meeting Status</th>"""
    new_th = """                <th className="p-4 font-medium text-brand-text/70 text-sm">Contact</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Source</th>
                <th className="p-4 font-medium text-brand-text/70 text-sm">Meeting Status</th>"""
    content = content.replace(old_th, new_th)

    # 3. Update colspans in loading state
    content = content.replace('colSpan="6" className="p-8 text-center text-brand-text/50">Loading clients...</td>', 'colSpan="7" className="p-8 text-center text-brand-text/50">Loading clients...</td>')
    content = content.replace('colSpan="6" className="p-8 text-center text-brand-text/50">No clients found.', 'colSpan="7" className="p-8 text-center text-brand-text/50">No clients found.')

    # 4. Update Table Row
    old_td = """                    <td className="p-4">
                      <div className="text-sm text-brand-text/80">{client.email || '-'}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{client.phone || '-'}</div>
                    </td>
                    <td className="p-4">
                      {client.latest_appointment ? ("""
    new_td = """                    <td className="p-4">
                      <div className="text-sm text-brand-text/80">{client.email || '-'}</div>
                      <div className="text-xs text-brand-text/60 mt-0.5">{client.phone || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${client.source === 'Cold Outreach' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-pink-100 text-pink-800 border-pink-200'}`}>
                        {client.source}
                      </span>
                    </td>
                    <td className="p-4">
                      {client.latest_appointment ? ("""
    content = content.replace(old_td, new_td)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    modify_file('c:\\Users\\AYOUB\\Desktop\\webgobuilder\\app\\dashboard\\clients\\page.jsx')
