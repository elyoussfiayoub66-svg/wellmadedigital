export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">Settings</h1>
        <p className="text-brand-text/70">Manage your workspace preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm p-6">
          <h2 className="text-lg font-medium text-brand-text mb-4 border-b border-brand-dark/5 pb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Workspace Name</label>
              <input type="text" defaultValue="My Workspace" className="w-full border-brand-dark/10 rounded-lg p-2 border focus:ring-brand-accent focus:border-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Support Email</label>
              <input type="email" defaultValue="support@example.com" className="w-full border-brand-dark/10 rounded-lg p-2 border focus:ring-brand-accent focus:border-brand-accent" />
            </div>
          </div>
        </div>

        <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm p-6">
          <h2 className="text-lg font-medium text-brand-text mb-4 border-b border-brand-dark/5 pb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-brand-text">Email Notifications</div>
                <div className="text-sm text-brand-text/60">Receive daily summaries</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-brand-dark/20 text-brand-accent focus:ring-brand-accent" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-brand-text">Push Notifications</div>
                <div className="text-sm text-brand-text/60">Get alerts for new messages</div>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-brand-dark/20 text-brand-accent focus:ring-brand-accent" />
            </div>
          </div>
        </div>

        <button className="bg-brand-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">
          Save Changes
        </button>
      </div>
    </div>
  );
}
