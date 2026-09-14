'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { submitCliniqueBooking } from '@/app/actions/clinique';
import * as meta from '@/lib/tracking/meta';

import { useRouter } from 'next/navigation';

export default function CliniqueLP() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [status, setStatus] = useState('idle');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', businessName: '', meetingDate: '', meetingTime: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      if (!formData.meetingDate) { setAvailableSlots([]); return; }
      setLoadingSlots(true);
      try {
        const r = await fetch(`/api/availability?date=${formData.meetingDate}`);
        if (r.ok) {
          const d = await r.json();
          setAvailableSlots(d.availableSlots?.sort() || []);
        }
      } catch {} finally { setLoadingSlots(false); }
    })();
  }, [formData.meetingDate]);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meetingTime) { alert("Veuillez sélectionner un créneau."); return; }
    setStatus('submitting');
    try {
      const result = await submitCliniqueBooking({
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
      });

      if (!result.success) throw new Error(result.error || 'Erreur inconnue');

      // Client-side pixel events
      meta.event('Lead', { content_name: 'Clinique LP' });
      meta.event('Schedule');
      meta.event('Demo_Booked');

      router.push('/thank-you');
    } catch (err) { alert("Erreur: " + (err.message || JSON.stringify(err))); setStatus('idle'); }
  };

  const goToForm = (e) => { e.preventDefault(); document.getElementById('rdv')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  /* ── CTA button (reused) ── */
  const CTA = ({ className = '' }) => (
    <a href="#rdv" onClick={goToForm} className={`flex items-center justify-center gap-2 w-full bg-[#C2496B] text-white font-semibold text-sm tracking-wide px-6 py-4 rounded-2xl active:scale-[.98] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)] hover:shadow-[0_8px_32px_rgba(194,73,107,0.45)] ${className}`}>
      Réserver mon diagnostic gratuit <ArrowRight className="w-4 h-4" />
    </a>
  );

  return (
    <div className="bg-[#0A0A0B] text-[#F0EDE8] font-sans antialiased pb-28 md:pb-0">

      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3.5">
          <Link href="/"><img src="/assets/logo.png?v=2" alt="Logo" className="h-8 w-auto" /></Link>
          <a href="#rdv" onClick={goToForm} className="text-[11px] font-semibold tracking-widest uppercase text-[#C2496B] hover:text-white transition-colors">
            Diagnostic gratuit →
          </a>
        </div>
      </header>


      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-[92svh] flex flex-col justify-end px-6 pb-10 pt-28 max-w-lg mx-auto overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-25 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/50 to-[#0A0A0B]" />
        </div>

        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-[#C2496B]/12 border border-[#C2496B]/25 text-[#C2496B] text-[10px] tracking-[.18em] uppercase font-bold px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2496B] animate-pulse" /> places limitées
          </span>

          <h1 className="text-[2.2rem] leading-[1.08] font-semibold tracking-tight">
            Vos soins sont excellents.<br />
            <span className="text-[#C2496B]">Votre organisation vous coûte des patients.</span>
          </h1>

          <p className="text-base text-white/55 font-light leading-relaxed">
            Ce matin, un patient a appelé votre cabinet. Personne n'a décroché.
            Il a raccroché, tapé "clinique esthétique" dans Google — et a pris rendez-vous ailleurs.
            Vous ne le saurez jamais.
          </p>

          <CTA />
          <p className="text-center text-[11px] text-white/30 tracking-widest uppercase">15 min · Gratuit · Aucun engagement</p>
        </div>
      </section>


      {/* ═══ 2. NEPQ SELF-REALIZATION ═══ */}
      <section className="px-6 py-20 max-w-lg mx-auto">
        <p className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold mb-8">Pensez à votre journée d'hier</p>

        <div className="space-y-10">
          {/* Situational — neutral, observational */}
          <div className="space-y-1">
            <p className="text-xl font-medium text-white leading-snug">
              Combien de fois hier quelqu'un dans votre équipe s'est levé pour chercher un dossier papier ?
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              Ce temps-là est devenu invisible. Il fait partie de la routine. Mais il existe, et il se répète chaque jour.
            </p>
          </div>

          {/* Problem-awareness — surfacing the cost */}
          <div className="space-y-1 border-l-2 border-[#C2496B]/30 pl-5">
            <p className="text-xl font-medium text-white leading-snug">
              Et quand une demande arrive le soir — un appel, un message Instagram, un formulaire — que se passe-t-il vraiment avant lundi ?
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              Souvent, rien. Et un patient qui attend une réponse ne vous attend pas — il prend rendez-vous ailleurs. Silencieusement.
            </p>
          </div>

          {/* Implication — consequence if nothing changes */}
          <div className="space-y-1 border-l-2 border-[#C2496B]/60 pl-5">
            <p className="text-xl font-medium text-white leading-snug">
              Si rien ne change dans trois mois, combien de patients aurez-vous perdus sans même le savoir ?
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              Pas parce que vos soins n'étaient pas bons. Parce que l'expérience autour ne leur a pas donné confiance.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <CTA />
        </div>
      </section>


      {/* ═══ 3. BEFORE / AFTER ═══ */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <p className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold mb-3">Deux réalités, même cabinet</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-8">Avec du papier vs. avec un système adapté à vous</h2>

        <div className="space-y-4">
          {[
            { scene: "Un patient appelle", left: "Ça sonne dans le vide. Post-it si quelqu'un décroche.", right: "Réponse immédiate, fiche créée automatiquement." },
            { scene: "Un rendez-vous approche", left: "On espère que le patient s'en souvient.", right: "Rappel envoyé 24h avant — automatiquement." },
            { scene: "Un patient revient après 6 mois", left: "On fouille. On redemande. On improvise.", right: "Son historique complet est là en un clic." },
            { scene: "Votre secrétaire est absente", left: "Plus personne ne sait où sont les dossiers.", right: "Tout est accessible par n'importe qui, immédiatement." },
          ].map((r, i) => (
            <div key={i} className="rounded-2xl border border-white/[.06] overflow-hidden bg-white/[.02]">
              <div className="px-4 py-2.5 bg-white/[.03] border-b border-white/[.06]">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-white/50">{r.scene}</p>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-white/[.06]">
                  <p className="text-xs text-white/35 font-light leading-relaxed">{r.left}</p>
                </div>
                <div className="p-4 bg-[#C2496B]/[.04]">
                  <p className="text-xs text-white/90 font-medium leading-relaxed">{r.right}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Reputation row — isolated, heavier */}
          <div className="rounded-2xl border border-[#C2496B]/20 overflow-hidden bg-[#C2496B]/[.06]">
            <div className="px-4 py-2.5 bg-[#C2496B]/[.08] border-b border-[#C2496B]/15">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[#C2496B]">Ce que le patient pense en partant</p>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-[#C2496B]/10">
                <p className="text-xs text-white/35 font-light leading-relaxed italic">"C'est un peu brouillon ici."</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-white font-medium leading-relaxed italic">"Ce cabinet est sérieux. Je le recommande."</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 4. THE GAP ═══ */}
      <section className="relative mx-5 max-w-lg md:mx-auto rounded-3xl overflow-hidden my-8">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop" alt="" className="w-full h-52 object-cover grayscale opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent" />
        <div className="absolute inset-0 bg-[#C2496B]/10 mix-blend-overlay" />
        <div className="relative p-7 -mt-28">
          <p className="text-base text-white/50 font-light leading-relaxed mb-4">
            La différence entre ces deux colonnes, ce n'est pas votre talent. Ce n'est pas votre équipe.
          </p>
          <p className="text-[1.7rem] font-bold tracking-tight text-white leading-tight mb-2">
            C'est un système.
          </p>
          <p className="text-white/40 font-light mb-6">Et pour l'instant, vous n'en avez pas.</p>
          <CTA />
        </div>
      </section>


      {/* ═══ 5. TIME · MONEY · REPUTATION ═══ */}
      <section className="px-6 py-20 max-w-lg mx-auto space-y-12">
        <p className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold">Concrètement, ce que ça change</p>

        {/* Time */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Votre équipe retrouve du temps</h3>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Chaque dossier cherché, chaque rendez-vous recopié, chaque rappel fait à la main — c'est du temps que votre équipe ne passe pas avec les patients. Un système fait ce travail en arrière-plan, sans que personne n'y pense.
          </p>
        </div>

        {/* Money */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Vous arrêtez de perdre du chiffre d'affaires en silence</h3>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Un patient qui appelle et n'obtient pas de réponse ne rappelle pas — il prend rendez-vous ailleurs. Un patient qui oublie son rendez-vous, c'est un créneau vide que vous ne rattraperez pas. Une réponse automatique et un rappel à temps changent directement votre taux de remplissage.
          </p>
        </div>

        {/* Reputation — hits last, hits hardest */}
        <div className="bg-white/[.03] border border-white/[.07] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Vous protégez ce qui compte le plus : votre réputation</h3>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Dans votre métier, vous ne faites pas de publicité agressive. Vous vivez du bouche-à-oreille — et le bouche-à-oreille ne pardonne pas le désordre. Un patient satisfait du soin mais frustré par l'accueil ne recommande pas. Un patient qui se sent pris en charge de A à Z recommande à tout le monde.
          </p>
          <p className="text-sm text-white/70 font-medium mt-3">
            Votre réputation se construit en années. Elle se détruit en quelques expériences.
          </p>
        </div>
      </section>


      {/* ═══ 6. OBJECTION HANDLING (CONVERSATIONAL) ═══ */}
      <section className="px-6 pb-16 max-w-lg mx-auto">
        <div className="bg-white/[.02] border border-white/[.05] rounded-2xl p-6 space-y-5">
          <p className="text-[10px] tracking-[.2em] uppercase text-white/30 font-bold">Ce que vous vous demandez peut-être</p>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white/80 font-medium">"Ça va perturber mon équipe ?"</p>
              <p className="text-white/40 font-light mt-1">Non. On part de votre façon de travailler actuelle. Rien n'est imposé. La formation est incluse, et la transition se fait sans interrompre votre activité.</p>
            </div>
            <div className="border-t border-white/[.05] pt-4">
              <p className="text-white/80 font-medium">"C'est un logiciel standard ?"</p>
              <p className="text-white/40 font-light mt-1">Aucun. Chaque système est construit pour votre cabinet, votre équipe, vos patients. C'est la différence entre un costume sur mesure et du prêt-à-porter.</p>
            </div>
            <div className="border-t border-white/[.05] pt-4">
              <p className="text-white/80 font-medium">"Le diagnostic est vraiment gratuit ?"</p>
              <p className="text-white/40 font-light mt-1">Oui. 15 minutes, sans engagement. Vous repartez avec une vue claire de ce qui vous coûte des patients — que vous travailliez avec nous ou non.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 7. FINAL CTA + FORM ═══ */}
      <section className="px-6 pt-8 pb-4 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Chaque jour sans système, c'est un peu de réputation qui s'effrite en silence.
        </h2>
        <p className="text-sm text-white/45 font-light leading-relaxed">
          La solution est simple. L'appel est gratuit. Et il ne dure que 15 minutes.
        </p>
      </section>

      {/* FORM CARD */}
      <section id="rdv" className="mx-4 mb-16 max-w-lg md:mx-auto rounded-3xl overflow-hidden border border-white/[.08] bg-[#111112] shadow-[0_16px_60px_rgba(0,0,0,0.5)]">

        <div className="relative h-32 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop" alt="" className="w-full h-full object-cover grayscale opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#C2496B]/20 to-[#111112]" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-xl font-semibold text-white tracking-tight">Réservez votre diagnostic</p>
            <p className="text-xs text-white/40 mt-0.5">15 min — gratuit — sans engagement</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* trust */}
          <div className="flex gap-2 flex-wrap">
            {[{ i: Shield, t: "100% gratuit" }, { i: Zap, t: "Réponse sous 24h" }, { i: CheckCircle2, t: "Sans engagement" }].map(({ i: I, t }) => (
              <span key={t} className="inline-flex items-center gap-1.5 bg-white/[.04] border border-white/[.07] rounded-full px-3 py-1">
                <I className="w-3 h-3 text-[#C2496B]" /><span className="text-[10px] text-white/60 font-medium">{t}</span>
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              { k: 'name', l: 'Nom complet', t: 'text', p: 'Dr. Jean Dupont' },
              { k: 'phone', l: 'Téléphone', t: 'tel', p: '+33 6 00 00 00 00' },
              { k: 'businessName', l: 'Nom du cabinet', t: 'text', p: 'Clinique des Champs' },
            ].map(({ k, l, t, p }) => (
              <div key={k}>
                <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">{l}</label>
                <input required type={t} value={formData[k]} onChange={e => set(k, e.target.value)} placeholder={p}
                  className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" />
              </div>
            ))}

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Date souhaitée</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.meetingDate}
                onChange={e => { set('meetingDate', e.target.value); set('meetingTime', ''); }}
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer" />
            </div>

            {formData.meetingDate && (
              <div>
                <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1.5">Créneau</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-white/35"><span className="w-3 h-3 rounded-full border-2 border-[#C2496B] border-t-transparent animate-spin" />Chargement...</div>
                ) : !availableSlots.length ? (
                  <p className="text-xs text-white/30 py-2">Aucun créneau. Essayez une autre date.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {availableSlots.map(s => (
                      <button key={s} type="button" onClick={() => set('meetingTime', s)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${formData.meetingTime === s ? 'bg-[#C2496B] text-white shadow-[0_0_12px_rgba(194,73,107,0.4)]' : 'bg-white/[.04] text-white/50 border border-white/[.07] hover:border-[#C2496B]/40 hover:text-white/80'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={status === 'submitting'}
              className="w-full mt-1 bg-[#C2496B] disabled:opacity-50 text-white font-semibold text-sm tracking-wide py-4 rounded-2xl active:scale-[.99] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)]">
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Traitement...</span>
              ) : 'Confirmer mon rendez-vous →'}
            </button>
          </form>
        </div>
      </section>


      {/* ═══ STICKY MOBILE ═══ */}
      <div className={`fixed bottom-0 inset-x-0 px-4 pb-4 pt-2 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/[.05] z-50 transition-transform duration-500 md:hidden ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <a href="#rdv" onClick={goToForm} className="flex items-center justify-center gap-2 w-full bg-[#C2496B] text-white font-semibold text-sm py-3.5 rounded-2xl shadow-lg">
          Réserver mon diagnostic <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
