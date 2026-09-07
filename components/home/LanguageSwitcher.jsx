'use client';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Inject Google Translate script silently
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,fr,ar', autoDisplay: false },
          'google_translate_element'
        );
      };
    }

    // Read current lang from cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      setLang(match[1]);
    }
  }, []);

  const switchLanguage = (newLang) => {
    if (newLang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      document.cookie = `googtrans=/en/${newLang}; path=/;`;
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
    }
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 relative z-50">
      <div id="google_translate_element" className="hidden"></div>
      
      <select 
        value={lang} 
        onChange={(e) => switchLanguage(e.target.value)}
        className="bg-transparent border border-[#F7F5F0]/20 text-[#F7F5F0] text-[10px] uppercase tracking-widest font-bold px-2 py-1.5 rounded cursor-pointer hover:border-[#C2496B] transition-colors appearance-none outline-none"
      >
        <option value="en" className="bg-[#0E0E0F] text-[#F7F5F0]">EN</option>
        <option value="fr" className="bg-[#0E0E0F] text-[#F7F5F0]">FR</option>
        <option value="ar" className="bg-[#0E0E0F] text-[#F7F5F0]">AR</option>
      </select>

      {/* Hide the top banner Google Translate adds */}
      <style>{`
        body { top: 0 !important; }
        .skiptranslate iframe { display: none !important; }
      `}</style>
    </div>
  );
}
