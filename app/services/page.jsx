import Link from 'next/link';
import { ArrowRight, Workflow, Database, BarChart3, Users, Calendar, ShieldCheck } from 'lucide-react';

export default function ServicesPage() {
  const solutions = [
    {
      id: 'crm',
      icon: <Users className="w-5 h-5" />,
      title: 'CRM & Client Management',
      problem: 'Generic CRMs force you to adapt your sales process to their software, leading to unused features and poor team adoption.',
      what: 'Custom CRMs built exclusively around your actual sales pipeline and client lifecycle.',
      who: 'Service businesses, agencies, and B2B companies with complex sales cycles.',
      outcome: 'Higher team adoption, perfect pipeline visibility, and no monthly per-user license fees.'
    },
    {
      id: 'booking',
      icon: <Calendar className="w-5 h-5" />,
      title: 'Booking & Scheduling',
      problem: 'Off-the-shelf booking tools don\'t handle complex logic like custom quoting, asset availability, or multi-step qualifications.',
      what: 'Intelligent booking engines that qualify leads, check real-time availability, and route requests instantly.',
      who: 'Rental businesses, consulting firms, and high-volume service providers.',
      outcome: 'Zero double-bookings, automated lead qualification, and a seamless client experience.'
    },
    {
      id: 'automation',
      icon: <Workflow className="w-5 h-5" />,
      title: 'Automation & Workflows',
      problem: 'Employees spend hours moving data between spreadsheets, emails, and isolated tools.',
      what: 'Automated data pipelines and workflows that connect your disparate tools and trigger actions automatically.',
      who: 'Operationally heavy businesses processing high volumes of data or transactions.',
      outcome: 'Massive reduction in manual data entry, fewer human errors, and faster processing times.'
    },
    {
      id: 'dashboards',
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Dashboards & Analytics',
      problem: 'Business data is scattered across 5 different platforms, making it impossible to get a real-time health check.',
      what: 'Centralized operational dashboards pulling live data into one single source of truth.',
      who: 'Founders, operations managers, and finance teams needing clear visibility.',
      outcome: 'Faster decision making based on real-time data, not end-of-month spreadsheet consolidation.'
    },
    {
      id: 'custom',
      icon: <Database className="w-5 h-5" />,
      title: 'Custom Software & Portals',
      problem: 'Your core business IP relies on clunky workarounds because no software exists for your specific niche.',
      what: 'Full-stack custom web applications, client portals, and internal tools.',
      who: 'Businesses with unique operational models or those wanting to offer a digital portal to clients.',
      outcome: 'A proprietary digital asset that increases enterprise value and deeply embeds you with clients.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-dark/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-medium text-brand-text flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[120px] h-auto object-contain" />
            Wellmade Digital
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-text/70">
            <Link href="/services" className="text-brand-text">Solutions</Link>
            <Link href="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
          </nav>
          <Link href="/book" className="text-sm font-medium bg-brand-accent text-brand-text-light px-5 py-2.5 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all">
            Book Consultation
          </Link>
        </div>
      </header>

      {/* Header */}
      <section className="py-24 px-6 bg-brand-bg border-b border-brand-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-brand-text mb-6">
            Solutions for Modern Operations
          </h1>
          <p className="text-xl text-brand-text/70 max-w-2xl mx-auto">
            We don't sell software subscriptions. We build the exact digital infrastructure your business needs to scale.
          </p>
        </div>
      </section>

      {/* Solutions List */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          {solutions.map((solution) => (
            <div key={solution.id} className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
              <div className="md:col-span-4 sticky top-32">
                <div className="w-12 h-12 bg-brand-surface rounded-lg flex items-center justify-center text-brand-accent mb-6 shadow-sm border border-brand-dark/5">
                  {solution.icon}
                </div>
                <h2 className="text-2xl font-medium text-brand-text mb-4">{solution.title}</h2>
                <div className="text-brand-text/70 pb-6 border-b border-brand-dark/5">
                  Best for: <span className="text-brand-text font-medium">{solution.who}</span>
                </div>
              </div>
              <div className="md:col-span-8 space-y-10">
                <div>
                  <h4 className="text-sm font-medium text-brand-accent mb-3">The Problem</h4>
                  <p className="text-lg text-brand-text/80 leading-relaxed bg-brand-surface p-6 border border-brand-dark/5 rounded-xl">
                    {solution.problem}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-brand-accent mb-3">What We Build</h4>
                  <p className="text-lg text-brand-text/80 leading-relaxed">
                    {solution.what}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-brand-accent mb-3">Business Outcome</h4>
                  <div className="flex gap-4 items-start bg-brand-dark text-brand-text-light p-6 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-brand-accent shrink-0 mt-0.5" />
                    <p className="text-lg leading-relaxed">
                      {solution.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-brand-dark text-center text-brand-text-light">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-6">Stop adapting to generic software.</h2>
          <p className="text-xl text-brand-text-light/70 mb-10">
            Let's discuss your current operational bottlenecks and see if a custom system makes sense.
          </p>
          <Link href="/book" className="inline-flex text-base font-medium bg-brand-accent text-brand-text-light px-8 py-4 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all items-center gap-2">
            Book a consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-bg py-12 px-6 border-t border-brand-dark/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-medium text-brand-text flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[100px] h-auto object-contain" />
            Wellmade Digital
          </div>
          <p className="text-sm text-brand-text/60">&copy; {new Date().getFullYear()} Wellmade Digital.</p>
        </div>
      </footer>
    </div>
  );
}
