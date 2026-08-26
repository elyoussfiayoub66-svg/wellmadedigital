'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowRight, Terminal, Layers, Workflow, CheckCircle2, ShieldCheck, 
  FileText, Blocks, MessagesSquare, Cpu, Search, Briefcase, 
  User, Database, Building2, Code2, MoveRight, Atom, Code, 
  FileCode2, TerminalSquare, Box, Server, DatabaseBackup, Wind, Webhook,
  LayoutTemplate, MonitorSmartphone, Settings, CloudCog
} from 'lucide-react';

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const StaggerGroup = ({ children, className }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      visible: { transition: { staggerChildren: 0.1 } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const TECH_STACK = [
  { name: 'Next.js', icon: LayoutTemplate },
  { name: 'React', icon: Atom },
  { name: 'JSX', icon: Code },
  { name: 'TypeScript', icon: FileCode2 },
  { name: 'Python', icon: TerminalSquare },
  { name: 'Laravel', icon: Box },
  { name: 'Node.js', icon: Server },
  { name: 'Supabase', icon: Database },
  { name: 'PostgreSQL', icon: DatabaseBackup },
  { name: 'Tailwind CSS', icon: Wind },
  { name: 'APIs & Integrations', icon: Webhook }
];
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        router.push('/signup');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
  const [caseStudies, setCaseStudies] = useState([]);
  
  useEffect(() => {
    async function loadStudies() {
      const supabase = createClient();
      const { data } = await supabase
        .from('case_studies')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false });
      if (data) setCaseStudies(data);
    }
    loadStudies();
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-accent selection:text-brand-text-light">
      
      {/* Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-dark/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[120px] h-auto object-contain" />
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-text/70">
            <Link href="/services" className="hover:text-brand-text transition-colors">Solutions</Link>
            <Link href="/services" className="hover:text-brand-text transition-colors">Services</Link>
            <Link href="#case-studies" className="hover:text-brand-text transition-colors">Case Studies</Link>
            <Link href="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
          </nav>
          <Link 
            href="/book" 
            className="text-sm font-medium bg-brand-accent text-brand-text-light px-5 py-2.5 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all"
          >
            Book Consultation
          </Link>
        </div>
      </motion.header>

      {/* SECTION 1 - HERO */}
      <section ref={heroRef} className="relative pt-32 pb-40 px-6 bg-brand-dark text-brand-text-light overflow-hidden">
        {/* Cinematic Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent"></div>
        
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-5xl mx-auto text-center relative z-10 pt-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-text-light/10 bg-brand-text-light/5 text-brand-accent font-medium text-sm tracking-wide uppercase mb-10"
          >
            <ShieldCheck className="w-4 h-4" />
            Technology & Business Solutions
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-medium leading-[1.05] tracking-tight mb-8"
          >
            We build the systems that run your business.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-brand-text-light/80 leading-relaxed max-w-3xl mx-auto mb-12 font-normal"
          >
            We don't just build websites. We engineer custom digital systems, software, and automation around how your business actually operates.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/book" 
              className="w-full sm:w-auto text-base font-medium bg-brand-accent text-brand-text-light px-8 py-4 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-accent/20"
            >
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/services" 
              className="w-full sm:w-auto text-base font-medium bg-transparent text-brand-text-light border border-brand-text-light/20 px-8 py-4 rounded-lg hover:bg-brand-text-light/5 hover:border-brand-text-light/40 transition-colors flex items-center justify-center"
            >
              Explore Our Solutions
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2 - EXPERTISE MARQUEE */}
      <section className="py-8 bg-brand-surface border-b border-brand-dark/5 overflow-hidden">
        <div className="max-w-[100vw] mx-auto flex flex-col items-center">
          <FadeUp>
            <h3 className="text-sm font-medium text-brand-text/50 mb-8 uppercase tracking-widest text-center px-6">Powered by Modern Technology</h3>
          </FadeUp>
          
          {/* Marquee Container */}
          <div className="relative w-full flex overflow-hidden group">
            {/* Gradient Masks for smooth fade on edges */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-brand-surface to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-brand-surface to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
              {[...TECH_STACK, ...TECH_STACK].map((tech, idx) => (
                <div key={idx} className="flex items-center gap-3 px-8 text-brand-text/70 hover:text-brand-text transition-colors">
                  <tech.icon className="w-5 h-5 text-brand-accent" />
                  <span className="text-lg font-medium whitespace-nowrap">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - THE PROBLEM */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="max-w-3xl mb-20">
              <div className="w-12 h-1 bg-brand-accent mb-8"></div>
              <h2 className="text-4xl md:text-6xl font-medium text-brand-text mb-6 leading-tight tracking-tight">
                Your business shouldn't have to work around its software.
              </h2>
            </div>
          </FadeUp>

          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <StaggerItem className="bg-brand-surface p-10 rounded-2xl border border-brand-dark/5 hover:border-brand-accent/20 transition-colors group">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-brand-text mb-3">Manual Work</h3>
              <p className="text-brand-text/70 leading-relaxed">Repetitive, manual tasks consume valuable hours that your team should be spending on high-value work and business growth.</p>
            </StaggerItem>
            
            <StaggerItem className="bg-brand-surface p-10 rounded-2xl border border-brand-dark/5 hover:border-brand-accent/20 transition-colors group">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform">
                <Blocks className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-brand-text mb-3">Disconnected Tools</h3>
              <p className="text-brand-text/70 leading-relaxed">When critical information is scattered across isolated platforms, you lose visibility and create constant operational friction.</p>
            </StaggerItem>
            
            <StaggerItem className="bg-brand-surface p-10 rounded-2xl border border-brand-dark/5 hover:border-brand-accent/20 transition-colors group">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-brand-text mb-3">Lost Opportunities</h3>
              <p className="text-brand-text/70 leading-relaxed">Inefficient processes and dropped data mean leads, customers, and vital communications inevitably slip through the cracks.</p>
            </StaggerItem>
            
            <StaggerItem className="bg-brand-surface p-10 rounded-2xl border border-brand-dark/5 hover:border-brand-accent/20 transition-colors group">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-brand-text mb-3">Generic Software</h3>
              <p className="text-brand-text/70 leading-relaxed">Off-the-shelf software rarely fits your unique processes, forcing you to compromise on how you actually want to run your business.</p>
            </StaggerItem>
          </StaggerGroup>
          
          <FadeUp delay={0.4}>
            <div className="bg-brand-dark text-brand-text-light p-10 rounded-2xl text-2xl font-medium text-center shadow-2xl shadow-brand-dark/10 relative overflow-hidden">
              <div className="relative z-10">We replace fragmented workflows with unified operational systems designed precisely for your reality.</div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 4 - SOLUTIONS */}
      <section className="py-40 px-6 bg-brand-surface border-y border-brand-dark/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-bg rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp>
            <div className="max-w-3xl mb-24">
              <div className="w-12 h-1 bg-brand-accent mb-8"></div>
              <h2 className="text-4xl md:text-6xl font-medium text-brand-text mb-8 tracking-tight">We build around your business.</h2>
              <p className="text-xl text-brand-text/70 leading-relaxed">
                We don't force your operations into predefined software constraints. Every solution we engineer is designed from the ground up around your actual needs and goals.
              </p>
            </div>
          </FadeUp>
          
          <StaggerGroup className="grid md:grid-cols-2 gap-x-16 gap-y-20">
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">Custom Business Systems</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Engineered digital infrastructure for your daily operations.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: Unified operations and total visibility across your business.</span></div>
            </StaggerItem>
            
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">CRM & Client Management</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Lead and relationship management built exclusively around your sales pipeline.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: Perfect pipeline clarity and higher team adoption without per-user licensing fees.</span></div>
            </StaggerItem>
            
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">Booking & Scheduling</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Intelligent scheduling engines that handle complex routing and asset availability.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: Zero double-bookings and a seamless, automated client experience.</span></div>
            </StaggerItem>
            
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">Workflow Automation</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Data pipelines that connect your tools and trigger actions automatically.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: Dramatic reduction in manual data entry and human error.</span></div>
            </StaggerItem>
            
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">Dashboards & Analytics</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Centralized hubs pulling live data into a single source of truth.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: Faster, more accurate decision-making based on real-time metrics.</span></div>
            </StaggerItem>
            
            <StaggerItem>
              <h3 className="text-2xl font-medium text-brand-text mb-3">Custom Web Applications</h3>
              <p className="text-brand-text/70 mb-6 leading-relaxed text-lg">Proprietary web software and internal tools for highly specific business models.</p>
              <div className="bg-brand-bg px-5 py-4 rounded-lg text-sm font-medium text-brand-text flex items-start gap-3 border border-brand-dark/5"><MoveRight className="w-5 h-5 text-brand-accent shrink-0"/> <span className="pt-0.5">Outcome: A unique digital asset that increases enterprise value and scales.</span></div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* SECTION 5 - PROCESS */}
      <section className="py-40 px-6 bg-brand-dark text-brand-text-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp>
            <div className="max-w-3xl mb-24">
              <div className="w-12 h-1 bg-brand-accent mb-8"></div>
              <h2 className="text-4xl md:text-6xl font-medium mb-8 tracking-tight">From problem to system.</h2>
              <p className="text-xl text-brand-text-light/70 leading-relaxed">
                Every successful project begins by deeply understanding the business bottleneck before deciding what should be built.
              </p>
            </div>
          </FadeUp>
          
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">01</div>
              <h4 className="text-2xl font-medium mb-4">Discover</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Understand the business, workflow, bottlenecks, and objectives.</p>
            </StaggerItem>
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">02</div>
              <h4 className="text-2xl font-medium mb-4">Define</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Identify the actual problem and determine exactly what the technical solution needs to accomplish.</p>
            </StaggerItem>
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">03</div>
              <h4 className="text-2xl font-medium mb-4">Design</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Map the user experience, system architecture, data workflows, and interface.</p>
            </StaggerItem>
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">04</div>
              <h4 className="text-2xl font-medium mb-4">Build</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Develop the solution cleanly and efficiently using the appropriate modern technologies.</p>
            </StaggerItem>
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">05</div>
              <h4 className="text-2xl font-medium mb-4">Deploy</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Launch the system to secure infrastructure, integrate it with your tools, and make it fully operational.</p>
            </StaggerItem>
            <StaggerItem className="border-t border-brand-text-light/10 pt-8 hover:border-brand-accent transition-colors duration-500">
              <div className="text-brand-accent font-medium text-lg mb-6 font-mono">06</div>
              <h4 className="text-2xl font-medium mb-4">Evolve</h4>
              <p className="text-brand-text-light/70 leading-relaxed text-lg">Continually monitor, refine, and expand the system as your business grows.</p>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* SECTION 7 - CASE STUDIES */}
      {caseStudies.length > 0 && (
        <section id="case-studies" className="py-40 px-6 bg-brand-surface relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <FadeUp>
              <div className="max-w-3xl mb-20">
                <div className="w-12 h-1 bg-brand-accent mb-8"></div>
                <h2 className="text-4xl md:text-6xl font-medium mb-8 tracking-tight text-brand-text">The outcomes we build.</h2>
                <p className="text-xl text-brand-text/70 leading-relaxed">
                  Real business problems. Custom engineered systems. Tangible results.
                </p>
              </div>
            </FadeUp>
            
            <div className="grid md:grid-cols-2 gap-12">
              {caseStudies.map((study, idx) => (
                <FadeUp key={study.id} delay={idx * 0.1}>
                  <div className="bg-brand-bg rounded-2xl p-10 border border-brand-dark/5 hover:border-brand-accent/30 transition-colors h-full flex flex-col group">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-2xl font-medium text-brand-text mb-2">{study.client_name}</h3>
                        <p className="text-brand-text/50 font-medium text-sm tracking-wide uppercase">{study.industry}</p>
                      </div>
                      <div className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-medium mb-4 text-brand-text leading-snug">{study.title}</h4>
                    <p className="text-brand-text/70 mb-10 flex-1 leading-relaxed">{study.short_description}</p>
                    
                    {study.results && study.results.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-brand-dark/10">
                        {study.results.slice(0, 2).map((result, rIdx) => (
                          <div key={rIdx}>
                            <div className="text-2xl font-medium text-brand-accent mb-1">{result.metric}</div>
                            <div className="text-sm text-brand-text/70 font-medium">{result.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 11 - FINAL CTA */}
      <section className="py-40 px-6 text-center bg-brand-surface relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center mx-auto mb-10 border border-brand-dark/5 shadow-sm">
              <img src="/assets/logo.png" alt="Icon" className="w-8 h-auto" />
            </div>
            <h2 className="text-4xl md:text-6xl font-medium text-brand-text mb-8 tracking-tight">Your problem is unique.<br/>Your solution should be too.</h2>
            <p className="text-xl md:text-2xl text-brand-text/70 mb-12 leading-relaxed font-normal max-w-3xl mx-auto">
              Tell us what you want to build, automate, improve, or fix. Let's design the exact digital infrastructure your business needs to reach the next level.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/contact" 
                className="w-full sm:w-auto inline-flex text-base font-medium bg-brand-dark text-brand-text-light px-8 py-5 rounded-lg hover:opacity-90 transition-all items-center justify-center gap-2"
              >
                Start a Conversation
              </Link>
              <Link 
                href="/book" 
                className="w-full sm:w-auto inline-flex text-base font-medium bg-brand-accent text-brand-text-light px-8 py-5 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all items-center justify-center gap-2 shadow-xl shadow-brand-accent/20"
              >
                Book a Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 12 - FOOTER CONTENT */}
      <footer className="bg-brand-bg py-20 px-6 border-t border-brand-dark/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/assets/logo.png" alt="WebGoBuilder Logo" className="w-[120px] h-auto object-contain" />
            </div>
            <p className="text-brand-text/70 max-w-sm text-lg">
              "Digital systems built around your business."
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div className="space-y-5 flex flex-col">
              <Link href="/services" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">Solutions</Link>
              <Link href="/services" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">Services</Link>
              <Link href="#case-studies" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">Case Studies</Link>
            </div>
            <div className="space-y-5 flex flex-col">
              <Link href="#" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">About</Link>
              <Link href="/contact" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">Contact</Link>
              <Link href="/book" className="font-medium text-brand-text/70 hover:text-brand-accent transition-colors">Book a Consultation</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-brand-dark/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-text/50">
            &copy; {new Date().getFullYear()} WebGoBuilder. All rights reserved.
          </p>
          <p className="text-sm text-brand-text/50">
            Company Reg No. 12345678
          </p>
        </div>
      </footer>
      
    </div>
  );
}
