'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Nous utilisons déjà un logiciel médical standard. Pourquoi changer ?",
    answer: "Les outils standards sont génériques. Nous construisons des systèmes sur-mesure conçus spécifiquement pour le flux de travail de votre clinique. Cela signifie moins de clics, des intégrations parfaites et une expérience de marque unique."
  },
  {
    question: "Combien de temps faut-il pour déployer notre système ?",
    answer: "Grâce à notre architecture puissante, nous pouvons généralement livrer votre système entièrement personnalisé en quelques semaines seulement, et non en plusieurs mois."
  },
  {
    question: "Sera-t-il difficile pour mon secrétariat de s'y habituer ?",
    answer: "Pas du tout. Nous privilégions une interface claire et intuitive. Nous supprimons le superflu présent dans les logiciels traditionnels pour que votre équipe puisse le maîtriser dès le premier jour."
  },
  {
    question: "Peut-on l'intégrer avec nos outils WhatsApp ou SMS actuels ?",
    answer: "Oui ! Notre plateforme inclut un constructeur de workflows qui peut déclencher automatiquement des messages WhatsApp, des e-mails et des SMS lors de la prise de rendez-vous."
  },
  {
    question: "Et si nous avons besoin d'une nouvelle fonctionnalité plus tard ?",
    answer: "C'est l'avantage du sur-mesure. À mesure que votre clinique se développe, nous pouvons facilement ajouter de nouveaux modules ou des rapports personnalisés que les logiciels prêts à l'emploi ne permettraient jamais."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-[#0E0E0F] border-t border-white/[.05]">
      <div className="max-w-[800px] mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-[#888888] text-lg font-light">
            Tout ce que vous devez savoir sur la mise à niveau de votre système.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${isOpen ? 'bg-[#18181B] border-[#27272A]' : 'bg-transparent border-white/5 hover:border-white/10'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium text-lg pr-8">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-[#A1A1AA] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
