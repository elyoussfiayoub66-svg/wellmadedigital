import re
import sys

def modify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state for outreachData
    content = content.replace(
        "const [projectStatusData, setProjectStatusData] = useState([]);",
        "const [projectStatusData, setProjectStatusData] = useState([]);\n  const [outreachData, setOutreachData] = useState([]);"
    )

    # 2. Add extra icons to import
    content = content.replace(
        "TrendingUp, Wallet, Users, FolderGit2, AlertCircle, TrendingDown, Award",
        "TrendingUp, Wallet, Users, FolderGit2, AlertCircle, TrendingDown, Award, Search, Calendar, PhoneCall"
    )
    
    # 3. Add default metrics to useState
    content = content.replace(
        "conversionRate: 0,\n    activeProjects: 0\n  });",
        "conversionRate: 0,\n    activeProjects: 0,\n    totalProspects: 0,\n    meetingsBooked: 0,\n    responseRate: 0\n  });"
    )

    # 4. Fetch prospects and calculate new metrics in fetchDashboardData
    fetch_injection = """
        // Fetch Appointments
        const { data: appointments } = await supabase.from('appointments').select('*');
        
        // Fetch Prospects
        const { data: prospects } = await supabase.from('prospects').select('*');
        
        let callsMadeCount = 0;
        let responsesCount = 0;
        let pMeetingsBooked = 0;
        
        (prospects || []).forEach(p => {
          const out = (p.outreach_status || '').toLowerCase();
          const follow = (p.followup_status || '').toLowerCase();
          
          const isNoAnswer = out.includes('voice mail') || out.includes('no answer') || follow.includes('voice mail') || follow.includes('no answer');
          const isResponded = out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
          
          if (isNoAnswer || isResponded) {
            callsMadeCount++;
          }
          if (isResponded) {
            responsesCount++;
          }
        });
        
        const responseRate = callsMadeCount > 0 ? (responsesCount / callsMadeCount) * 100 : 0;
        
        setMetrics({
          netProfit: agencyRevenue - totalExpenses,
          pipelineValue,
          conversionRate,
          activeProjects: activeProjects.length,
          totalProspects: prospects?.length || 0,
          meetingsBooked: appointments?.length || 0,
          responseRate
        });
"""
    # Replace the old setMetrics call
    old_setmetrics = """        setMetrics({
          netProfit: agencyRevenue - totalExpenses,
          pipelineValue,
          conversionRate,
          activeProjects: activeProjects.length
        });"""
    content = content.replace(old_setmetrics, fetch_injection)

    # 5. Add Outreach chart data builder
    chart_injection = """
        const monthlyOutreach = {};
        last6Months.forEach(m => {
            monthlyOutreach[m] = { month: m, 'Calls Made': 0, 'Meetings Booked': 0, 'Clients Closed': 0 };
        });

        prospects?.forEach(p => {
            const out = (p.outreach_status || '').toLowerCase();
            const follow = (p.followup_status || '').toLowerCase();
            const isCall = out.includes('voice mail') || out.includes('no answer') || out.includes('not interested') || out.includes('follow up') || out.includes('meeting booked') || follow.includes('voice mail') || follow.includes('no answer') || follow.includes('not interested') || follow.includes('meeting booked') || follow.includes('do not contact');
            if (isCall) {
                const d = new Date(p.updated_at || p.created_at);
                const m = d.toLocaleString('default', { month: 'short', year: '2-digit' });
                if (monthlyOutreach[m]) monthlyOutreach[m]['Calls Made']++;
            }
        });

        appointments?.forEach(a => {
            const m = new Date(a.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (monthlyOutreach[m]) monthlyOutreach[m]['Meetings Booked']++;
        });

        leads?.filter(l => l.status === 'CLOSED_WON').forEach(l => {
            const m = new Date(l.updated_at || l.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (monthlyOutreach[m]) monthlyOutreach[m]['Clients Closed']++;
        });

        setOutreachData(last6Months.map(m => monthlyOutreach[m]));
"""
    content = content.replace("setFinanceData(last6Months.map(m => monthlyFinance[m]));", "setFinanceData(last6Months.map(m => monthlyFinance[m]));\n" + chart_injection)

    # 6. Add new cards
    new_cards = """      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Search className="w-16 h-16 text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Total Prospects</h3>
          <div className="text-3xl font-black text-brand-text">{metrics.totalProspects}</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">In your pipeline</div>
        </div>

        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border relative overflow-hidden group hover:border-fuchsia-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-16 h-16 text-fuchsia-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Meetings Booked</h3>
          <div className="text-3xl font-black text-brand-text">{metrics.meetingsBooked}</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">All Time</div>
        </div>

        <div className="bg-gradient-to-br from-brand-surface to-brand-surface/50 p-6 rounded-2xl border border-brand-border relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PhoneCall className="w-16 h-16 text-cyan-500" />
          </div>
          <h3 className="text-sm font-semibold text-brand-text/70 mb-2 uppercase tracking-wider">Response Rate</h3>
          <div className="text-3xl font-black text-brand-text">{metrics.responseRate.toFixed(1)}%</div>
          <div className="text-xs text-brand-text/50 mt-2 font-medium">From total outreach</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
"""
    content = content.replace("      {/* KPI Cards */}\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">", new_cards)

    # 7. Add new Line chart
    line_chart = """      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Outreach Chart */}
        <div className="lg:col-span-3 bg-brand-surface rounded-2xl border border-brand-border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-brand-accent" /> Outreach & Conversion Pipeline (Past 6 Months)
          </h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outreachData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} dx={-10} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                   labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="Calls Made" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="Meetings Booked" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorMeetings)" />
                <Area type="monotone" dataKey="Clients Closed" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorClients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
"""
    content = content.replace("      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">\n        {/* Main Chart */}", line_chart)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    modify_file('c:\\Users\\AYOUB\\Desktop\\webgobuilder\\app\\dashboard\\page.jsx')
