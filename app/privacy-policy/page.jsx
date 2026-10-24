import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';

export const metadata = {
  title: 'Privacy Policy | Wellmade Digital',
  description:
    'Learn how Wellmade Digital collects, uses, and protects personal data, and the rights you have under Moroccan Law 09-08 and applicable data protection laws.',
};

const COMPANY = {
  name: 'Wellmade Digital',
  owner: 'Elyoussfi Ayoub',
  location: 'Boumia / Meknes, Morocco',
  email: 'hello@wellmade.com',
};

const EFFECTIVE_DATE = 'October 24, 2026';

const policySections = [
  {
    title: 'Who We Are and Our Role',
    content:
      'Wellmade Digital, operated by Elyoussfi Ayoub in Boumia / Meknes, Morocco, helps businesses organize their work and reduce paperwork through custom digital systems such as CRMs, workflows, and automation. Our role depends on the situation:',
    items: [
      'As a data controller: for information we collect about visitors to this website, people who contact us, and prospective or existing clients. This policy covers that data.',
      'As a data processor: when we build or operate a system for a client business, the client decides what customer data goes into it and why. We process that data only on the client\u2019s documented instructions and under our agreement with them. If you are a customer of one of our clients, please contact that business first about your data.',
    ],
  },
  {
    title: 'Information We Collect',
    content: 'We may collect the following categories of information:',
    items: [
      'Information you give us: name, email address, phone number or WhatsApp number, company name, role, and anything you write in forms, emails, or messages.',
      'Project information: details about your business, workflows, and requirements that you share so we can scope and deliver our services.',
      'Technical data: browser type, device information, IP address, approximate location, pages visited, visit duration, and referral source, collected through cookies and similar technologies.',
    ],
    footer:
      'We do not intentionally collect sensitive data (such as health, biometric, or religious information) through this website. Please do not send it to us unless it is strictly necessary for a project we have agreed on.',
  },
  {
    title: 'How and Why We Use Information',
    content: 'We process personal data for the following purposes and on the following bases:',
    items: [
      'To respond to your inquiries and prepare proposals (consent, or steps taken at your request before entering a contract).',
      'To provide, support, and improve our services and perform our contracts (contract performance).',
      'To communicate about projects, invoices, and support (contract performance and legitimate interest).',
      'To analyze website performance and measure our marketing (consent where required, otherwise legitimate interest).',
      'To keep our website secure, prevent fraud and misuse (legitimate interest).',
      'To meet legal, tax, and accounting obligations (legal obligation).',
    ],
  },
  {
    title: 'Cookies, Analytics, and Tracking',
    content:
      'We may use cookies and similar technologies, including analytics and advertising tools, to understand how visitors use our website and to measure our campaigns. Where required by law, we ask for your consent before using non-essential cookies. You can manage or delete cookies at any time in your browser settings, and blocking some cookies may affect how the site works.',
  },
  {
    title: 'Sharing Your Information',
    content:
      'We do not sell your personal information. We share it only when needed:',
    items: [
      'With trusted service providers that help us run our website and services, such as hosting, analytics, email, messaging, scheduling, and CRM platforms. They may only use the data to provide services to us and must protect it appropriately.',
      'With professional advisers (accountants, lawyers) where necessary.',
      'With authorities when we are legally required to, or to protect our rights, users, or the public.',
      'In connection with a business restructuring or sale, in which case we will make sure your data stays protected.',
    ],
  },
  {
    title: 'International Transfers',
    content:
      'Some of our providers (for example hosting or analytics platforms) may store or process data outside Morocco. When personal data is transferred abroad, we take steps to ensure it remains protected, including using reputable providers with appropriate contractual safeguards and, where required by Moroccan law, complying with CNDP rules on cross-border transfers.',
  },
  {
    title: 'Data Retention',
    content:
      'We keep personal data only as long as necessary for the purposes described in this policy. As a general guide, inquiry and contact data is kept while we are in discussion with you and for a reasonable period afterward; client and contract records are kept for the period required by Moroccan accounting, tax, and commercial law. When data is no longer needed, we delete or anonymize it. Data we process for clients is retained or deleted according to our agreement with that client.',
  },
  {
    title: 'Security',
    content:
      'We use reasonable administrative, technical, and organizational measures to protect personal data, including access controls, encrypted connections (HTTPS), and limiting access to people who need it. No system is completely secure, so we cannot guarantee absolute security. If a breach affecting your data occurs, we will take steps to contain it and notify you and the relevant authorities where required.',
  },
  {
    title: 'Your Rights',
    content:
      'Under Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data, and other laws that may apply to you (such as the GDPR if you are in the European Economic Area), you may have the right to:',
    items: [
      'Be informed about how your data is used (this policy).',
      'Access the personal data we hold about you.',
      'Correct inaccurate or incomplete data.',
      'Request deletion of your data, where applicable.',
      'Object to processing for legitimate reasons, and object at no cost to your data being used for marketing and prospecting.',
      'Withdraw consent at any time, without affecting processing done before withdrawal.',
      'Request restriction or portability of your data, where applicable law provides for it.',
    ],
    footer:
      'To exercise these rights, email us using the contact details below. We may need to verify your identity first, and we will respond within a reasonable time. You also have the right to lodge a complaint with the Commission Nationale de contr\u00F4le de la protection des Donn\u00E9es \u00E0 caract\u00E8re Personnel (CNDP) in Morocco or with your local data protection authority.',
  },
  {
    title: 'Marketing Communications',
    content:
      'We may send you emails or messages about our services if you have asked for them or where the law allows. You can unsubscribe at any time using the link in our emails or by replying to tell us to stop.',
  },
  {
    title: 'Children\u2019s Privacy',
    content:
      'Our website and services are intended for businesses and are not directed at children under 18. We do not knowingly collect personal data from children. If you believe a child has provided us with data, please contact us and we will delete it.',
  },
  {
    title: 'External Links',
    content:
      'Our website may contain links to third-party websites or services. We do not control them and are not responsible for their privacy practices. We encourage you to read their policies before sharing personal information.',
  },
  {
    title: 'Updates to This Policy',
    content:
      'We may update this Privacy Policy from time to time to reflect changes in our practices or the law. The latest version will always be posted on this page with its effective date. If we make significant changes, we will take reasonable steps to let you know.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />

      <header className="pt-44 pb-20 px-6 md:px-12 border-b border-[#F7F5F0]/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-6">Legal</div>
          <h1 className="text-5xl md:text-7xl font-medium leading-[1.05] mb-6">Privacy Policy</h1>
          <p className="text-[#F7F5F0]/60 text-lg">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </header>

      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl leading-relaxed text-[#F7F5F0]/75 mb-16">
            {COMPANY.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This policy explains how we
            collect, use, share, and protect personal data when you visit our website, contact us, or work with us, and
            what rights you have. We process personal data in line with Moroccan Law No. 09-08 and other applicable
            data protection laws.
          </p>

          <div className="space-y-14">
            {policySections.map((section, index) => (
              <section key={section.title}>
                <h2 className="text-2xl md:text-3xl font-medium mb-5">
                  <span className="text-[#C8A464] mr-3 text-xl md:text-2xl">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                <p className="text-base md:text-lg leading-8 text-[#F7F5F0]/65">{section.content}</p>

                {section.items && (
                  <ul className="mt-5 space-y-3 text-base md:text-lg leading-8 text-[#F7F5F0]/65">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8A464]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="mt-5 text-base md:text-lg leading-8 text-[#F7F5F0]/65">{section.footer}</p>
                )}
              </section>
            ))}

            <section>
              <h2 className="text-2xl md:text-3xl font-medium mb-5">
                <span className="text-[#C8A464] mr-3 text-xl md:text-2xl">
                  {String(policySections.length + 1).padStart(2, '0')}
                </span>
                Contact Us
              </h2>
              <p className="text-base md:text-lg leading-8 text-[#F7F5F0]/65">
                Questions about this Privacy Policy, or requests to exercise your rights, can be sent to{' '}
                <a
                  className="text-[#C8A464] hover:text-[#F7F5F0] transition-colors"
                  href={`mailto:${COMPANY.email}`}
                >
                  {COMPANY.email}
                </a>
                .
              </p>
              <address className="mt-5 not-italic text-base md:text-lg leading-8 text-[#F7F5F0]/65">
                {COMPANY.name}, operated by {COMPANY.owner}
                <br />
                {COMPANY.location}
              </address>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}