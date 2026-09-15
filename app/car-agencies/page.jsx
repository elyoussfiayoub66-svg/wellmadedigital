'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap, Info, Clock, Check } from 'lucide-react';
import { submitCarAgencyBooking } from '@/app/actions/car-agencies';
import * as meta from '@/lib/tracking/meta';
import FAQ from '@/components/home/FAQ';
import { useRouter } from 'next/navigation';

export default function CarAgenciesLP() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [status, setStatus] = useState('idle');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    fleetSize: '1–5 véhicules', 
    painPoint: 'Tout ça à la fois',
    role: 'Propriétaire',
    meetingDate: '', 
    meetingTime: '' 
  });

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
      const result = await submitCarAgencyBooking({
        name: formData.name,
        phone: formData.phone,
        fleetSize: formData.fleetSize,
        painPoint: formData.painPoint,
        role: formData.role,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
      });

      if (!result.success) throw new Error(result.error || 'Erreur inconnue');

      // Client-side tracking events
      try {
        meta.event('Lead', { content_name: 'Car Agencies LP PAS' });
        meta.event('Schedule');
        meta.event('Demo_Booked');
      } catch {}

      router.push('/thank-you');
    } catch (err) { 
      alert("Erreur: " + (err.message || JSON.stringify(err))); 
      setStatus('idle'); 
    }
  };

  const goToForm = (e) => { 
    e.preventDefault(); 
    document.getElementById('rdv')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
  };

  /* ── CTA button (reusable) ── */
  const CTA = ({ className = '', text = "Réservez Votre Appel Gratuit de 15 Minutes" }) => (
    <a 
      href="#rdv" 
      onClick={goToForm} 
      className={`flex flex-col items-center justify-center w-full bg-[#C2496B] hover:bg-[#a83c5c] text-white font-semibold text-sm tracking-wide px-6 py-4 rounded-2xl active:scale-[.98] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)] hover:shadow-[0_8px_32px_rgba(194,73,107,0.45)] ${className}`}
    >
      <span className="flex items-center gap-2">{text} <ArrowRight className="w-4 h-4" /></span>
      <span className="text-[10px] text-white/70 font-normal mt-1 text-center">Reprenez le contrôle sur votre flotte — cette semaine, pas dans six mois.</span>
    </a>
  );

  return (
    <div className="bg-[#0A0A0B] text-[#F0EDE8] font-sans antialiased pb-28 md:pb-0">

      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3.5">
          <Link href="/"><img src="/assets/logo.png?v=2" alt="Logo" className="h-8 w-auto" /></Link>
          <a href="#rdv" onClick={goToForm} className="text-[11px] font-semibold tracking-widest uppercase text-[#C2496B] hover:text-white transition-colors">
            Prendre le contrôle →
          </a>
        </div>
      </header>

      {/* ═══ 1. PROBLEM (HERO) ═══ */}
      <section className="relative min-h-[92svh] flex flex-col justify-end px-6 pb-12 pt-28 max-w-lg mx-auto overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop" 
            alt="Luxury Car Interior" 
            className="w-full h-full object-cover opacity-30 grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/70 to-[#0A0A0B]" />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-[2.2rem] leading-[1.08] font-semibold tracking-tight">
            Chaque réservation perdue dans WhatsApp, <span className="text-[#C2496B]">c'est un peu de contrôle sur votre propre entreprise qui vous échappe.</span>
          </h1>

          <p className="text-base text-white/60 font-light leading-relaxed">
            Vous avez construit cette agence vous-même. Mais aujourd'hui, elle tourne entre WhatsApp, Instagram, et un carnet — et un peu plus de contrôle vous échappe chaque jour.
          </p>

          <CTA />
        </div>
      </section>

      {/* ═══ 2. AGITATE ═══ */}
      <section className="px-6 py-20 max-w-lg mx-auto">
        <h2 className="text-xl font-medium text-white mb-8">Voici à quoi ça ressemble, concrètement :</h2>

        <div className="space-y-4 mb-10">
          {[
            "Une réservation reçue par message WhatsApp la semaine dernière — impossible à retrouver dans la conversation",
            "Un client qui écrit sur Instagram pendant que vous êtes au téléphone avec un autre — et le message se perd dans la liste",
            "Une page du carnet tachée, déchirée, ou tout simplement oubliée à la maison le jour où vous en avez besoin",
            "Une réservation notée à la main, une autre dans la tête, une autre \"on verra bien\" — jusqu'au jour où deux clients se présentent pour la même voiture"
          ].map((text, i) => (
            <div key={i} className="flex gap-4 items-start bg-white/[.02] border border-white/[.06] p-4 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#C2496B]/10 border border-[#C2496B]/20 text-[#C2496B] flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-white/70 font-light leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="relative rounded-3xl overflow-hidden mb-10 border border-white/[.08]">
          <img 
            src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop" 
            alt="Person checking phone messages" 
            className="w-full h-48 object-cover grayscale opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent" />
        </div>

        <div className="space-y-6 border-l-2 border-[#C2496B]/40 pl-5">
          <p className="text-base text-white/80 font-light leading-relaxed">
            Rien de tout ça n'est une grosse erreur en soi. Mais additionné, jour après jour, c'est votre entreprise qui vous échappe un peu plus — pas parce que vous gérez mal, mais parce qu'aucun outil ne vous a été conçu pour vraiment tout voir au même endroit.
          </p>
          <p className="text-base text-[#C2496B] font-medium leading-relaxed">
            Et plus votre flotte grandit, plus l'écart entre ce que vous croyez savoir et ce qui se passe réellement s'agrandit.
          </p>
        </div>
      </section>

      {/* ═══ 3. SOLVE ═══ */}
      <section className="px-6 py-16 max-w-lg mx-auto bg-[#C2496B]/[.03] border-y border-[#C2496B]/10">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-6">Ce n'est pas une question d'organisation personnelle. C'est une question d'outil.</h2>

        <p className="text-sm text-white/60 font-light leading-relaxed mb-8">
          Nous ne vendons pas une application de réservation générique. Nous construisons, pour chaque agence, un système qui centralise tout — chaque réservation, chaque client, chaque voiture — à un seul endroit, visible depuis votre téléphone, à tout moment.
        </p>

        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/[.08]">
          <img 
            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop" 
            alt="Modern car dashboard and control" 
            className="w-full h-56 object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
        </div>

        <p className="text-base text-white font-medium leading-relaxed mb-8 text-center px-4">
          Dites-nous ce qui vous coûte le plus de temps ou de stress en ce moment, et on vous montre exactement comment reprendre le contrôle — construit autour de la façon dont votre agence fonctionne, pas un modèle standard.
        </p>

        <CTA />
      </section>

      {/* ═══ 4. FORM CARD ═══ */}
      <section id="rdv" className="mx-4 my-16 max-w-lg md:mx-auto rounded-3xl overflow-hidden border border-white/[.08] bg-[#111112] shadow-[0_16px_60px_rgba(0,0,0,0.5)]">
        <div className="relative h-36 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop" 
            alt="Car keys handover" 
            className="w-full h-full object-cover grayscale opacity-25" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#C2496B]/20 to-[#111112]" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-xl font-semibold text-white tracking-tight">Formulaire de qualification</p>
            <p className="text-xs text-white/40 mt-0.5">Réservation pour votre appel de 15 minutes</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* trust tags */}
          <div className="flex gap-2 flex-wrap mb-2">
            {[
              { i: Shield, t: "100% gratuit" }, 
              { i: CheckCircle2, t: "Sans engagement" }
            ].map(({ i: I, t }) => (
              <span key={t} className="inline-flex items-center gap-1.5 bg-white/[.04] border border-white/[.07] rounded-full px-3 py-1">
                <I className="w-3 h-3 text-[#C2496B]" /><span className="text-[10px] text-white/60 font-medium">{t}</span>
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5">Nom</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => set('name', e.target.value)} 
                placeholder="Votre nom complet"
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5">Téléphone / WhatsApp</label>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={e => set('phone', e.target.value)} 
                placeholder="+212 6..."
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5">Propriétaire ou gérant ?</label>
              <select 
                value={formData.role} 
                onChange={e => set('role', e.target.value)}
                className="w-full bg-[#1A1A1C] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer"
              >
                <option value="Propriétaire">Propriétaire</option>
                <option value="Gérant">Gérant</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5">Nombre de voitures dans votre flotte</label>
              <select 
                value={formData.fleetSize} 
                onChange={e => set('fleetSize', e.target.value)}
                className="w-full bg-[#1A1A1C] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer"
              >
                <option value="1–5 véhicules">1–5</option>
                <option value="6–15 véhicules">6–15</option>
                <option value="16+ véhicules">16+</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5">Ce qui vous fait perdre le plus de temps/argent</label>
              <select 
                value={formData.painPoint} 
                onChange={e => set('painPoint', e.target.value)}
                className="w-full bg-[#1A1A1C] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer"
              >
                <option value="Réservations éparpillées entre WhatsApp/Instagram/carnet">Réservations éparpillées (WhatsApp/Instagram/carnet)</option>
                <option value="Oublis et doubles réservations">Oublis et doubles réservations</option>
                <option value="Recherche d'informations perdues">Recherche d'informations perdues</option>
                <option value="Tout ça à la fois">Tout ça à la fois</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/40 mb-1.5 mt-2">Date souhaitée pour l'appel</label>
              <input 
                required 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={formData.meetingDate}
                onChange={e => { set('meetingDate', e.target.value); set('meetingTime', ''); }}
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer" 
              />
            </div>

            {formData.meetingDate && (
              <div>
                <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1.5">Créneau disponible</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-white/35">
                    <span className="w-3 h-3 rounded-full border-2 border-[#C2496B] border-t-transparent animate-spin" />
                    Recherche des créneaux...
                  </div>
                ) : !availableSlots.length ? (
                  <p className="text-xs text-white/30 py-2">Aucun créneau libre à cette date. Veuillez choisir un autre jour.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {availableSlots.map(s => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => set('meetingTime', s)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          formData.meetingTime === s 
                            ? 'bg-[#C2496B] text-white shadow-[0_0_12px_rgba(194,73,107,0.4)]' 
                            : 'bg-white/[.04] text-white/50 border border-white/[.07] hover:border-[#C2496B]/40 hover:text-white/80'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full mt-4 flex flex-col items-center justify-center bg-[#C2496B] hover:bg-[#a83c5c] disabled:opacity-50 text-white font-semibold text-sm tracking-wide py-4 px-2 rounded-2xl active:scale-[.99] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)]"
            >
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Confirmation en cours...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-2">Réservez Votre Appel Gratuit <ArrowRight className="w-4 h-4" /></span>
                  <span className="text-[10px] text-white/70 font-normal mt-1 text-center">Reprenez le contrôle sur votre flotte — cette semaine, pas dans six mois.</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <FAQ />

      {/* ═══ STICKY BOTTOM MOBILE CTA ═══ */}
      <div className={`fixed bottom-0 inset-x-0 px-4 pb-4 pt-2 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/[.05] z-50 transition-transform duration-500 md:hidden ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <a href="#rdv" onClick={goToForm} className="flex items-center justify-center gap-2 w-full bg-[#C2496B] text-white font-semibold text-sm py-3.5 rounded-2xl shadow-lg">
          Réserver Mon Appel Gratuit <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
