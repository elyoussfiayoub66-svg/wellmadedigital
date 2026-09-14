import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: "Expérience de Réservation Fluide",
    subtitle: "Arrêtez de perdre des patients à cause de formulaires complexes.",
    description: "Notre portail patient simplifie la réservation. Ils peuvent choisir un service et un créneau 24h/24 et 7j/7 sans appeler votre secrétariat, faisant gagner des heures à votre équipe chaque jour.",
    image: "/assets/booking.png",
    bullets: ["Réservation autonome 24/7", "Réduit les appels de 60%", "Interface élégante et à votre image"],
    reverse: false
  },
  {
    title: "Gestion d'Agenda Intelligente",
    subtitle: "Votre planning complet en un coup d'œil.",
    description: "Fini les doubles réservations ou les agendas papier raturés. L'agenda intégré se synchronise automatiquement avec les réservations des patients en temps réel, offrant à vos praticiens une vue claire et sans stress de leur journée.",
    image: "/assets/calendar_ui.png",
    bullets: ["Synchronisation en temps réel", "Vues multi-praticiens", "Reprogrammation par glisser-déposer"],
    reverse: true
  },
  {
    title: "CRM Clinique Complet",
    subtitle: "Chaque détail patient, accessible instantanément.",
    description: "Gardez une trace des historiques de rendez-vous, des informations personnelles et des notes médicales dans un profil centralisé. Donnez à vos praticiens le contexte dont ils ont besoin en quelques secondes.",
    image: "/assets/patient.png",
    bullets: ["Historique complet des visites", "Accès rapide aux notes médicales", "Suivi automatisé des statuts"],
    reverse: false
  }
];

export default function FeaturesShowcase() {
  return (
    <section className="py-24 bg-[#09090B] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="text-center mb-24">
          <span className="inline-block py-1 px-3 rounded-full bg-[#C2496B]/10 text-[#C2496B] text-[10px] font-bold tracking-widest uppercase mb-4 border border-[#C2496B]/20">
            Gain de Temps
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
            Conçu pour la vitesse et la clarté.
          </h2>
          <p className="text-[#888888] text-lg max-w-2xl mx-auto font-light">
            Nous concevons des fonctionnalités qui résolvent réellement vos goulots d'étranglement opérationnels, afin que vous passiez moins de temps à cliquer et plus de temps à soigner vos patients.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feat, idx) => (
            <div key={idx} className={`flex flex-col ${feat.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
              
              {/* Text Content */}
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl md:text-3xl font-semibold text-white">{feat.title}</h3>
                <p className="text-xl text-[#C2496B] font-medium">{feat.subtitle}</p>
                <p className="text-[#A1A1AA] text-lg leading-relaxed font-light">
                  {feat.description}
                </p>
                
                <ul className="pt-4 space-y-3">
                  {feat.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-[#C2496B]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Container */}
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={feat.image} 
                    alt={feat.title}
                    className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
