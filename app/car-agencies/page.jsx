'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap, Car, Key, Clock, Calendar, Check } from 'lucide-react';
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
    businessName: '', 
    fleetSize: '6–15', 
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
        businessName: formData.businessName,
        fleetSize: formData.fleetSize,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
      });

      if (!result.success) throw new Error(result.error || 'Erreur inconnue');

      // Client-side tracking events
      try {
        meta.event('Lead', { content_name: 'Car Agencies LP' });
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
  const CTA = ({ className = '', text = "Automatiser mon agence (Démo gratuite)" }) => (
    <a 
      href="#rdv" 
      onClick={goToForm} 
      className={`flex items-center justify-center gap-2 w-full bg-[#C2496B] hover:bg-[#a83c5c] text-white font-semibold text-sm tracking-wide px-6 py-4 rounded-2xl active:scale-[.98] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)] hover:shadow-[0_8px_32px_rgba(194,73,107,0.45)] ${className}`}
    >
      {text} <ArrowRight className="w-4 h-4" />
    </a>
  );

  return (
    <div className="bg-[#0A0A0B] text-[#F0EDE8] font-sans antialiased pb-28 md:pb-0">

      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3.5">
          <Link href="/"><img src="/assets/logo.png?v=2" alt="Logo" className="h-8 w-auto" /></Link>
          <a href="#rdv" onClick={goToForm} className="text-[11px] font-semibold tracking-widest uppercase text-[#C2496B] hover:text-white transition-colors">
            Audit Flotte Gratuit →
          </a>
        </div>
      </header>


      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-[92svh] flex flex-col justify-end px-6 pb-10 pt-28 max-w-lg mx-auto overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop" 
            alt="Car Rental Fleet" 
            className="w-full h-full object-cover opacity-25 grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]" />
        </div>

        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-[#C2496B]/12 border border-[#C2496B]/25 text-[#C2496B] text-[10px] tracking-[.18em] uppercase font-bold px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2496B] animate-pulse" /> Spécial Agences de Location Auto
          </span>

          <h1 className="text-[2.2rem] leading-[1.08] font-semibold tracking-tight">
            Vos véhicules sont prêts.<br />
            <span className="text-[#C2496B]">Votre gestion WhatsApp vous coûte des locations.</span>
          </h1>

          <p className="text-base text-white/55 font-light leading-relaxed">
            Ce matin, un client a demandé la disponibilité d'une voiture pour le week-end. Vous étiez en train de faire un état des lieux ou sur la route.
            Il a loué chez votre concurrent 5 minutes plus tard.
          </p>

          <CTA />
          <p className="text-center text-[11px] text-white/30 tracking-widest uppercase">15 min · Démo personnalisée · Aucun engagement</p>
        </div>
      </section>


      {/* ═══ 2. PAIN REALITY ═══ */}
      <section className="px-6 py-20 max-w-lg mx-auto">
        <p className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold mb-8">Pensez à votre routine quotidienne</p>

        <div className="space-y-10">
          <div className="space-y-1">
            <p className="text-xl font-medium text-white leading-snug">
              Combien de messages WhatsApp recevez-vous chaque jour pour juste demander : "Disponible ? Quel prix ?"
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              Vous passez des heures à envoyer des photos une par une, négocier les cautions et vérifier sur un cahier si la Clio ou le Range Rover rentre mardi.
            </p>
          </div>

          <div className="space-y-1 border-l-2 border-[#C2496B]/30 pl-5">
            <p className="text-xl font-medium text-white leading-snug">
              Et quand un client réserve verbalement sans acompte ni contrat immédiat, que se passe-t-il le jour J ?
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              No-show. Le client ne vient pas, le véhicule reste immobilisé sur votre parking, et vous avez refusé 3 autres clients pour rien.
            </p>
          </div>

          <div className="space-y-1 border-l-2 border-[#C2496B]/60 pl-5">
            <p className="text-xl font-medium text-white leading-snug">
              Si votre flotte passe de 10 à 30 véhicules sans système automatisé, qui va gérer les retours et les relances ?
            </p>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              Vous allez vous noyer sous les appels et les erreurs de planning. Le secret des grandes agences n'est pas le nombre d'employés — c'est leur système d'automatisation.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <CTA />
        </div>
      </section>


      {/* ═══ 3. BEFORE / AFTER ═══ */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <p className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold mb-3">Deux réalités, même flotte</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-8">Gestion manuelle vs. Système WebGo Automatisé</h2>

        <div className="space-y-4">
          {[
            { 
              scene: "Un client demande un devis", 
              left: "Vous répondez après 2h. Le client a déjà loué ailleurs.", 
              right: "Réponse WhatsApp instantanée avec photos, tarifs et lien de réservation direct." 
            },
            { 
              scene: "Le suivi de disponibilité", 
              left: "Cahier papier ou mémoire. Risque permanent de double-booking.", 
              right: "Planning interactif synchronisé. Le véhicule est bloqué dès la réservation." 
            },
            { 
              scene: "Le jour de la prise en charge", 
              left: "Le client arrive en retard ou oublie les documents nécessaires.", 
              right: "Rappel automatique WhatsApp 24h avant avec checklist (Permis, Caution, Heure exacte)." 
            },
            { 
              scene: "La restitution du véhicule", 
              left: "Relances manuelles stressantes pour récupérer le véhicule à l'heure.", 
              right: "Notification automatique 3h avant le terme du contrat avec localisation de l'agence." 
            },
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

          {/* Business Impact row */}
          <div className="rounded-2xl border border-[#C2496B]/20 overflow-hidden bg-[#C2496B]/[.06]">
            <div className="px-4 py-2.5 bg-[#C2496B]/[.08] border-b border-[#C2496B]/15">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[#C2496B]">Ce que vos clients pensent de votre agence</p>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-[#C2496B]/10">
                <p className="text-xs text-white/35 font-light leading-relaxed italic">"C'est long, ils manquent de professionnalisme."</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-white font-medium leading-relaxed italic">"Service 5 étoiles, réponse en 10 secondes. Je relouerai ici !"</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 4. THE GAP BANNER ═══ */}
      <section className="relative mx-5 max-w-lg md:mx-auto rounded-3xl overflow-hidden my-8">
        <img 
          src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop" 
          alt="Luxury Car Interior" 
          className="w-full h-56 object-cover grayscale opacity-25" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent" />
        <div className="absolute inset-0 bg-[#C2496B]/10 mix-blend-overlay" />
        <div className="relative p-7 -mt-28">
          <p className="text-base text-white/50 font-light leading-relaxed mb-4">
            La différence entre une agence qui stagne et une agence qui remplit sa flotte 30 jours sur 30 ?
          </p>
          <p className="text-[1.7rem] font-bold tracking-tight text-white leading-tight mb-2">
            Un système de réservation WhatsApp automatisé.
          </p>
          <p className="text-white/40 font-light mb-6">Et nous l'installons pour vous clé en main.</p>
          <CTA text="Réserver mon audit gratuit" />
        </div>
      </section>


      {/* ═══ 5. HOW IT WORKS ═══ */}
      <section className="px-6 py-16 max-w-lg mx-auto space-y-8">
        <div>
          <span className="text-[10px] tracking-[.2em] uppercase text-[#C2496B] font-bold">Fonctionnalités Clés</span>
          <h2 className="text-2xl font-semibold text-white mt-1">Conçu exclusivement pour les loueurs de voitures</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: Car,
              title: "Catalogue Flotte Instantané sur WhatsApp",
              desc: "Le client choisit sa catégorie (Économique, SUV, Luxe), voit les disponibilités et reçoit immédiatement les tarifs avec photos professionnelles."
            },
            {
              icon: Zap,
              title: "Validation & Confirmation Automatiques",
              desc: "Collecte automatique de la photo du permis et du passeport, génération du contrat et confirmation par message WhatsApp officiel."
            },
            {
              icon: Clock,
              title: "Élimination totale des No-Shows",
              desc: "Rappels automatiques programmés 24h et 3h avant la prise en charge, avec itinéraire GPS de votre agence."
            },
            {
              icon: Key,
              title: "Gestion des Cautions & Prolongations",
              desc: "Notification automatique la veille du retour pour proposer une prolongation de contrat ou confirmer l'état des lieux de retour."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white/[.02] border border-white/[.06] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C2496B]/10 border border-[#C2496B]/20 text-[#C2496B] flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ═══ 6. FORM CARD ═══ */}
      <section id="rdv" className="mx-4 mb-16 max-w-lg md:mx-auto rounded-3xl overflow-hidden border border-white/[.08] bg-[#111112] shadow-[0_16px_60px_rgba(0,0,0,0.5)]">
        <div className="relative h-36 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop" 
            alt="Car keys handover" 
            className="w-full h-full object-cover grayscale opacity-25" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#C2496B]/20 to-[#111112]" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-xl font-semibold text-white tracking-tight">Réservez votre Démo Gratuite</p>
            <p className="text-xs text-white/40 mt-0.5">15 min · Découverte en direct · Aucun engagement</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* trust tags */}
          <div className="flex gap-2 flex-wrap">
            {[
              { i: Shield, t: "100% gratuit" }, 
              { i: Zap, t: "Mise en place en 48h" }, 
              { i: CheckCircle2, t: "Sans engagement" }
            ].map(({ i: I, t }) => (
              <span key={t} className="inline-flex items-center gap-1.5 bg-white/[.04] border border-white/[.07] rounded-full px-3 py-1">
                <I className="w-3 h-3 text-[#C2496B]" /><span className="text-[10px] text-white/60 font-medium">{t}</span>
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Votre Nom complet</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => set('name', e.target.value)} 
                placeholder="Ex: Youssef El Mansouri"
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Numéro WhatsApp</label>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={e => set('phone', e.target.value)} 
                placeholder="06 12 34 56 78 ou +212 6..."
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Nom de l'Agence de Location</label>
              <input 
                required 
                type="text" 
                value={formData.businessName} 
                onChange={e => set('businessName', e.target.value)} 
                placeholder="Ex: Atlas Cars Marrakech"
                className="w-full bg-white/[.03] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Taille de votre flotte</label>
              <select 
                value={formData.fleetSize} 
                onChange={e => set('fleetSize', e.target.value)}
                className="w-full bg-[#1A1A1C] border border-white/[.08] focus:border-[#C2496B] focus:ring-2 focus:ring-[#C2496B]/15 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all cursor-pointer"
              >
                <option value="1–5 véhicules">1 à 5 véhicules</option>
                <option value="6–15 véhicules">6 à 15 véhicules</option>
                <option value="16–30 véhicules">16 à 30 véhicules</option>
                <option value="30+ véhicules">Plus de 30 véhicules</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[.15em] font-semibold text-white/35 mb-1">Date souhaitée pour l'appel</label>
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
              className="w-full mt-2 bg-[#C2496B] hover:bg-[#a83c5c] disabled:opacity-50 text-white font-semibold text-sm tracking-wide py-4 rounded-2xl active:scale-[.99] transition-all shadow-[0_6px_24px_rgba(194,73,107,0.3)]"
            >
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Confirmation en cours...
                </span>
              ) : 'Bloquer mon créneau de démo →'}
            </button>
          </form>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <FAQ />

      {/* ═══ STICKY BOTTOM MOBILE CTA ═══ */}
      <div className={`fixed bottom-0 inset-x-0 px-4 pb-4 pt-2 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/[.05] z-50 transition-transform duration-500 md:hidden ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <a href="#rdv" onClick={goToForm} className="flex items-center justify-center gap-2 w-full bg-[#C2496B] text-white font-semibold text-sm py-3.5 rounded-2xl shadow-lg">
          Réserver mon audit gratuit <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
