'use client';

/**
 * /thank-you — Post-form confirmation page
 * Arabic RTL, cinematic dark design matching the funnel
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Search, Target, Check } from 'lucide-react';

function trackEvent(name, payload = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.trackEvent === 'function') window.trackEvent(name, payload);
    if (typeof window.gtag       === 'function') window.gtag('event', name, payload);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name, ...payload });
    if (typeof window.fbq        === 'function') window.fbq('trackCustom', name, payload);
  } catch (_) {}
}

export default function ThankYouPage() {
  const router = useRouter();
  const [name,   setName]   = useState('');
  const [agency, setAgency] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    trackEvent('ThankYou_View');
    if (typeof sessionStorage !== 'undefined') {
      setName(sessionStorage.getItem('lead_name') || '');
      setAgency(sessionStorage.getItem('lead_agency') || '');
    }
    // Animate in
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    {
      n: '٠١',
      icon: <Phone className="w-6 h-6" />,
      title: 'التواصل معك',
      body: 'سيتواصل معك أحد فريقنا خلال ٢٤ ساعة عبر الهاتف أو واتساب لتحديد موعد الاجتماع.',
    },
    {
      n: '٠٢',
      icon: <Search className="w-6 h-6" />,
      title: 'الاجتماع التشخيصي',
      body: 'اجتماع قصير (٣٠ دقيقة) نناقش فيه طريقة عمل وكالتك والمشاكل التشغيلية التي تواجهها.',
    },
    {
      n: '٠٣',
      icon: <Target className="w-6 h-6" />,
      title: 'الحل المناسب',
      body: 'إن كنا نستطيع مساعدتك، نقترح الحل الأنسب لوكالتك تحديداً. لا التزام إلا إذا اقتنعت.',
    },
  ];

  return (
    <div className="ty-page" dir="rtl">
      <TyStyles />

      {/* Background */}
      <div className="ty-bg">
        <div className="ty-graphic-bg">
          <div className="ty-orb ty-orb-1" />
          <div className="ty-orb ty-orb-2" />
          <div className="ty-grid" />
        </div>
        <div className="ty-bg-overlay" />
        <div className="ty-grain" />
      </div>

      {/* Content */}
      <main className={`ty-main ${visible ? 'ty-in' : ''}`}>

        {/* Brand */}
        <div className="ty-brand">
          <img src="/1.png" alt="ScaleUp Agency Logo" className="brand-logo" />
          ScaleUp Agency
        </div>

        {/* Check mark hero */}
        <div className="ty-hero">
          <div className="ty-check-ring">
            <div className="ty-check-icon"><Check className="w-10 h-10" /></div>
          </div>
          <div className="ty-badge">تم استلام طلبك</div>
          <h1 className="ty-h1">
            {name ? `شكراً، ${name}.` : 'شكراً.'}
          </h1>
          <p className="ty-sub">
            {agency
              ? `استلمنا معلومات وكالة «${agency}» وسنتواصل معك قريباً.`
              : 'استلمنا طلبك وسنتواصل معك قريباً.'
            }
          </p>
        </div>

        {/* Next steps */}
        <div className="ty-card">
          <h2 className="ty-card-title">الخطوات التالية</h2>
          <div className="ty-steps">
            {steps.map((s, i) => (
              <div key={i} className="ty-step">
                <div className="ty-step-left">
                  <span className="ty-step-n">{s.n}</span>
                  {i < steps.length - 1 && <div className="ty-step-line" />}
                </div>
                <div className="ty-step-right">
                  <span className="ty-step-icon">{s.icon}</span>
                  <h3 className="ty-step-title">{s.title}</h3>
                  <p className="ty-step-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prepare */}
        <div className="ty-prepare">
          <h3 className="ty-prepare-title">ما يمكنك فعله الآن</h3>
          <p className="ty-prepare-body">
            قبل الاجتماع، فكّر في: ما هي أكبر ٣ مشاكل تشغيلية تواجهها يومياً؟ هذا سيجعل الاجتماع أكثر فائدة لك.
          </p>
        </div>

        {/* Footer actions */}
        <div className="ty-actions">
          <a href="/" className="ty-home-btn">← العودة للرئيسية</a>
          <p className="ty-note">لا يوجد التزام بالشراء · الاجتماع مجاني تماماً</p>
        </div>

      </main>
    </div>
  );
}

function TyStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700;900&display=swap');
      :root{--bg:#0A0A0B;--bg-2:#111113;--bg-3:#161618;--line:#1E1E21;--line-2:#2A2A2E;--ink:#F2F0EB;--ink-2:#B8B5AE;--muted:#6B6B70;--accent:#C9A227;--accent-d:#A07E1A;--accent-l:rgba(201,162,39,0.12);--green:#34C759;--r:3px;--font-d:'IBM Plex Sans Arabic','Cairo',sans-serif;--font-b:'Cairo','IBM Plex Sans Arabic',sans-serif;}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{height:100%;}
      .ty-page{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-b);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:40px 20px;}

      /* Background */
      .ty-bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
      .ty-graphic-bg {position:absolute;inset:0;background:var(--bg);overflow:hidden;}
      .ty-orb {position:absolute;border-radius:50%;filter:blur(80px);opacity:0.6;animation:drift 20s infinite alternate ease-in-out;}
      .ty-orb-1 {width:60vw;height:60vw;background:radial-gradient(circle, rgba(52,199,89,0.15) 0%, transparent 70%);top:-20%;left:-10%;}
      .ty-orb-2 {width:50vw;height:50vw;background:radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%);bottom:-10%;right:-10%;animation-delay:-5s;}
      .ty-grid {position:absolute;inset:0;background-size:40px 40px;background-image:linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);mask-image:linear-gradient(to bottom, black 40%, transparent 100%);-webkit-mask-image:linear-gradient(to bottom, black 40%, transparent 100%);}
      @keyframes drift {0%{transform:translate(0,0) scale(1);}100%{transform:translate(5%, 10%) scale(1.1);}}
      .ty-bg-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,11,.98) 0%,rgba(10,10,11,.85) 100%);}
      .ty-grain{position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");}

      /* Main container */
      .ty-main{position:relative;z-index:1;width:100%;max-width:640px;opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease;}
      .ty-in{opacity:1;transform:translateY(0);}

      /* Brand */
      .ty-brand {display:flex;align-items:center;justify-content:center;gap:12px;font-family:var(--font-d);font-weight:700;font-size:20px;color:var(--ink);margin-bottom:40px;direction:ltr;}
      .brand-logo {height:28px;width:auto;}

      /* Hero */
      .ty-hero{text-align:center;margin-bottom:40px;}
      .ty-check-ring{
        width:80px;height:80px;border-radius:50%;
        border:1px solid rgba(52,199,89,.3);
        background:rgba(52,199,89,.08);
        display:flex;align-items:center;justify-content:center;
        margin:0 auto 20px;
        box-:0 0 40px rgba(52,199,89,.15);
        animation:ringPulse 2.5s ease-out;
      }
      @keyframes ringPulse{0%{box-:0 0 0 0 rgba(52,199,89,.4);}70%{box-:0 0 0 20px rgba(52,199,89,0);}100%{box-:0 0 40px rgba(52,199,89,.15);}}
      .ty-check-icon{font-size:32px;color:var(--green);font-weight:900;}
      .ty-badge{
        display:inline-block;border:1px solid rgba(52,199,89,.4);color:var(--green);
        font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
        padding:6px 16px;border-radius:100px;margin-bottom:20px;
        background:rgba(52,199,89,.06);
      }
      .ty-h1{font-family:var(--font-d);font-size:clamp(32px,5vw,52px);font-weight:700;margin-bottom:14px;line-height:1.2;}
      .ty-sub{font-size:16px;color:var(--ink-2);line-height:1.75;max-width:440px;margin:0 auto;}

      /* Card */
      .ty-card{background:var(--bg-2);border:1px solid var(--line-2);padding:40px;margin-bottom:20px;}
      .ty-card-title{font-family:var(--font-d);font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:32px;}

      /* Steps */
      .ty-steps{display:flex;flex-direction:column;}
      .ty-step{display:flex;gap:24px;position:relative;}
      .ty-step-left{display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;}
      .ty-step-n{font-family:var(--font-d);font-size:13px;font-weight:700;color:var(--accent);line-height:1;padding-top:4px;width:32px;text-align:center;}
      .ty-step-line{width:1px;flex:1;background:var(--line);margin:8px 0;min-height:24px;}
      .ty-step-right{padding-bottom:32px;flex:1;}
      .ty-step:last-child .ty-step-right{padding-bottom:0;}
      .ty-step-icon{font-size:22px;display:block;margin-bottom:10px;}
      .ty-step-title{font-family:var(--font-d);font-size:17px;font-weight:700;margin-bottom:8px;}
      .ty-step-body{font-size:14px;color:var(--ink-2);line-height:1.75;}

      /* Prepare */
      .ty-prepare{background:var(--accent-l);border:1px solid rgba(201,162,39,.25);padding:28px 32px;margin-bottom:28px;}
      .ty-prepare-title{font-family:var(--font-d);font-size:15px;font-weight:700;color:var(--accent);margin-bottom:10px;}
      .ty-prepare-body{font-size:14px;color:var(--ink-2);line-height:1.75;}

      /* Actions */
      .ty-actions{text-align:center;}
      .ty-home-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border:1px solid var(--line-2);color:var(--ink-2);font-family:var(--font-b);font-size:14px;font-weight:600;text-decoration:none;border-radius:var(--r);margin-bottom:16px;transition:border-color .2s,color .2s;}
      .ty-home-btn:hover{border-color:var(--accent);color:var(--accent);}
      .ty-note{font-size:12px;color:var(--muted);}

      @media(max-width:640px){
        .ty-page{padding:24px 16px;align-items:flex-start;}
        .ty-card{padding:24px 20px;}
        .ty-prepare{padding:20px;}
      }
    `}</style>
  );
}
