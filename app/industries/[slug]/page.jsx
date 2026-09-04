import CommercialPage from '@/components/shared/CommercialPage';
import { notFound } from 'next/navigation';

const industryData = {
  'dental-clinics': {
    title: "Dental Clinics.",
    subtitle: "Automate patient scheduling and eliminate operational chaos so your clinicians can focus on care.",
    definition: "Digital systems for dental clinics focus on streamlining the patient lifecycle—from automated appointment booking and intelligent SMS reminders to secure CRM data management.",
    problem: "Dental practices lose significant revenue to missed appointments, double bookings, and the administrative burden placed on front-desk staff. Manual data entry creates errors and distracts from patient care.",
    mechanism: "We implement custom CRMs and workflow automations that connect your clinical management software with patient-facing booking systems, ensuring seamless data flow.",
    deliverables: [
      { title: "Automated Scheduling", description: "Seamless patient booking workflows that sync instantly with your clinic's calendar." },
      { title: "CRM Integration", description: "Centralized patient data to track treatment plans and retention." },
      { title: "SMS Reminders", description: "Automated notifications that drastically reduce no-show rates." }
    ],
    outcomes: [
      { title: "Reduced Administrative Cost", description: "Save hundreds of hours at the front desk." },
      { title: "Lower No-Show Rates", description: "Automated reminders ensure maximum chair utilization." },
      { title: "Zero Double Booking", description: "Perfectly synced calendars eliminate scheduling chaos." },
      { title: "Enhanced Patient Experience", description: "A frictionless digital experience that builds trust." }
    ],
    process: [
      { title: "System Audit", description: "We analyze your current booking and management software." },
      { title: "Workflow Design", description: "We map the ideal automated patient journey." },
      { title: "Integration", description: "We securely connect your systems via APIs." },
      { title: "Launch", description: "We deploy the automation and train your staff." }
    ],
    faqs: [
      { question: "Is this secure?", answer: "Yes, we utilize enterprise-grade encryption and adhere to all relevant health data privacy regulations when designing your systems." },
      { question: "Can it integrate with our existing software?", answer: "We specialize in connecting modern web applications to legacy clinical software via secure APIs." }
    ]
  },
  'aesthetic-clinics': {
    title: "Aesthetic Clinics.",
    subtitle: "Manage luxury patient pipelines, consultation bookings, and automated follow-up sequences.",
    definition: "Digital architecture for aesthetic clinics focuses on high-end visual presentation combined with rigorous, HIPAA-compliant patient tracking and consultation management.",
    problem: "Aesthetic practices waste massive marketing budgets generating leads that fall through the cracks. Manual follow-ups fail, and high-ticket consultations are lost to slower response times.",
    mechanism: "We engineer highly visual, immersive landing environments connected to custom CRM pipelines that automatically capture, qualify, and follow up with premium leads.",
    deliverables: [
      { title: "Consultation Pipelines", description: "Automated routing of high-net-worth inquiries to your top consultants." },
      { title: "Visual Portfolio Systems", description: "Immersive before-and-after galleries that load instantly." },
      { title: "Automated Retention", description: "Post-procedure sequences that ensure recurring treatments." }
    ],
    outcomes: [
      { title: "Higher Conversion Rates", description: "Instant automated responses mean you close more premium consultations." },
      { title: "Elevated Brand Perception", description: "A digital experience that perfectly matches your physical clinic." },
      { title: "Reduced Administrative Cost", description: "Eliminate the need for staff to manually chase leads." },
      { title: "Maximized LTV", description: "Keep patients returning for recurring treatments automatically." }
    ],
    process: [
      { title: "Patient Journey Mapping", description: "We outline the entire flow from initial ad click to post-op care." },
      { title: "CRM Architecture", description: "We build the database to track every interaction securely." },
      { title: "Visual Design", description: "We craft the high-end digital aesthetics of your platform." },
      { title: "Deployment", description: "We launch the system and train your patient coordinators." }
    ],
    faqs: [
      { question: "Is the CRM HIPAA compliant?", answer: "Yes, our data architecture is designed with strict healthcare privacy standards in mind." },
      { question: "Can it integrate with our existing EMR?", answer: "We specialize in secure API integrations with modern Electronic Medical Record systems." }
    ]
  },
  'beauty-salons': {
    title: "Beauty Salons.",
    subtitle: "Automate your bookings and client retention so you can focus on your craft.",
    definition: "A digital ecosystem for salons that handles complex stylist schedules, inventory tracking, and intelligent client communication.",
    problem: "Salons often struggle with empty chairs due to last-minute cancellations and the chaotic management of multiple stylists' schedules. Relying on phone bookings wastes time and loses clients.",
    mechanism: "We engineer frictionless booking systems and connect them to automated CRM workflows that manage waitlists and retention campaigns.",
    deliverables: [
      { title: "Frictionless Booking", description: "Mobile-first booking systems tailored for complex services." },
      { title: "Automated Waitlists", description: "Intelligent systems that fill last-minute cancellations automatically." },
      { title: "Loyalty Integrations", description: "Automated CRM tagging for high-value VIP clients." }
    ],
    outcomes: [
      { title: "Zero Administrative Chaos", description: "No more answering the phone during services." },
      { title: "Maximized Chair Utilization", description: "Waitlist automations ensure you are always booked." },
      { title: "Higher Client Retention", description: "Automated follow-ups keep clients coming back." },
      { title: "Reduced Costs", description: "Eliminate the need for dedicated booking receptionists." }
    ],
    process: [
      { title: "Operations Audit", description: "We analyze your service menus and staff schedules." },
      { title: "System Engineering", description: "We build the custom booking and CRM integrations." },
      { title: "Deployment", description: "We launch the system and provide complete team training." },
      { title: "Optimization", description: "We monitor data to ensure the system is maximizing revenue." }
    ],
    faqs: [
      { question: "Can clients choose their stylist?", answer: "Yes, our systems map directly to individual staff calendars and service capabilities." },
      { question: "Do you handle payment integration?", answer: "Absolutely. We can enforce automated deposits to guarantee attendance." }
    ]
  },
  'travel-agencies': {
    title: "Travel Agencies.",
    subtitle: "Eliminate spreadsheet chaos with custom CRM dashboards for high-ticket itineraries.",
    definition: "Custom systems for travel agencies centralize complex itinerary building, client documents, and secure payment processing into a single automated dashboard.",
    problem: "Managing high-ticket bespoke travel involves tracking hundreds of moving parts across multiple time zones. Relying on email threads and spreadsheets inevitably leads to costly mistakes and a poor client experience.",
    mechanism: "We build bespoke CRM architectures that automate document generation, payment collection, and itinerary updates, keeping everything synchronized.",
    deliverables: [
      { title: "Custom CRM Dashboards", description: "A centralized hub for every client's travel preferences and history." },
      { title: "Document Automation", description: "Instant generation of complex itineraries and invoices." },
      { title: "Secure Payments", description: "Integrated gateways capable of handling high-ticket global transactions." }
    ],
    outcomes: [
      { title: "Error Elimination", description: "No more missed flights or wrong hotel bookings due to manual entry." },
      { title: "Massive Time Savings", description: "Automate the repetitive parts of itinerary building." },
      { title: "Premium Client Experience", description: "Clients receive beautiful, digital, real-time itineraries." },
      { title: "Scalability", description: "Manage twice the volume of clients with the same staff size." }
    ],
    process: [
      { title: "Workflow Mapping", description: "We document exactly how you currently build trips." },
      { title: "Dashboard Architecture", description: "We design a CRM perfectly suited for complex travel data." },
      { title: "Automation Build", description: "We script the generation of documents and reminders." },
      { title: "Team Onboarding", description: "We transition your agents onto the new centralized platform." }
    ],
    faqs: [
      { question: "Can we track supplier commissions?", answer: "Yes, our custom CRMs can be built to track internal margins and supplier payouts." },
      { question: "Is this for OTA (Online Travel Agencies) or bespoke agents?", answer: "Our custom CRMs are specifically designed for high-ticket, bespoke travel designers who require complex management." }
    ]
  },
  'hotels': {
    title: "Hotels.",
    subtitle: "Streamline operations and elevate the guest experience through rigorous systems automation.",
    definition: "Digital systems for hotels focus on bridging the gap between guest-facing booking interfaces and internal Property Management Systems (PMS), eliminating manual data transfer.",
    problem: "Hotels leak revenue to OTA commissions and waste immense administrative hours managing guest communications, check-ins, and fragmented systems that do not communicate with each other.",
    mechanism: "We engineer custom booking environments and connect them via secure APIs to your PMS, while automating pre-arrival and post-departure guest communications.",
    deliverables: [
      { title: "PMS Integration", description: "Seamless, real-time syncing of inventory and pricing." },
      { title: "Automated Guest Communication", description: "Triggered emails/SMS for check-in instructions and upsells." },
      { title: "Direct Booking Engines", description: "Frictionless digital experiences that bypass OTA fees." }
    ],
    outcomes: [
      { title: "Increased Direct Bookings", description: "Save significantly on third-party aggregator commissions." },
      { title: "Operational Efficiency", description: "Automated communications free up the front desk." },
      { title: "Higher Guest LTV", description: "Automated retention campaigns drive repeat visits." },
      { title: "Zero Manual Entry", description: "Reservations flow perfectly into your PMS without human touch." }
    ],
    process: [
      { title: "System Audit", description: "We evaluate your current PMS and operational workflows." },
      { title: "Integration Engineering", description: "We build the API bridges necessary for real-time data sync." },
      { title: "Experience Design", description: "We design the frictionless front-end booking interfaces." },
      { title: "Launch & Test", description: "Rigorous staging tests ensure zero impact on live operations." }
    ],
    faqs: [
      { question: "Do you integrate with legacy PMS systems?", answer: "If your PMS has an accessible API or modern webhooks, we can build the integration." },
      { question: "Can we automate room upgrades?", answer: "Yes, we can build automated pre-arrival workflows that offer dynamic upgrades to guests." }
    ]
  },
  'rental-car-agencies': {
    title: "Rental Car Agencies.",
    subtitle: "Automate fleet management and checkout flows to completely eliminate operational friction.",
    definition: "Systems engineering for rental agencies involves dynamic fleet inventory management, complex pricing algorithms, and frictionless checkout automations.",
    problem: "Managing a dynamic physical inventory like a car fleet across multiple locations creates massive operational chaos. Double bookings, pricing errors, and slow manual checkouts destroy margins.",
    mechanism: "We build centralized dashboards that sync perfectly with front-end booking flows, employing intelligent automation to handle pricing rules, availability, and document signing.",
    deliverables: [
      { title: "Dynamic Fleet Management", description: "Real-time tracking of vehicle status and location." },
      { title: "Automated Checkout", description: "Digital signature and document capture prior to arrival." },
      { title: "Algorithmic Pricing", description: "Automated rate adjustments based on supply and demand." }
    ],
    outcomes: [
      { title: "Zero Double Bookings", description: "Perfectly synced inventory prevents scheduling disasters." },
      { title: "Faster Turnaround", description: "Automated digital checkouts mean customers get keys instantly." },
      { title: "Maximized Yield", description: "Dynamic pricing ensures you get the highest possible rate." },
      { title: "Reduced Overhead", description: "Less manual processing means lower staffing requirements." }
    ],
    process: [
      { title: "Inventory Audit", description: "We analyze how you currently track and price your fleet." },
      { title: "System Architecture", description: "We build the central database and API connections." },
      { title: "Workflow Automation", description: "We automate the pre-rental document processing." },
      { title: "Deployment", description: "We launch the system across your physical locations." }
    ],
    faqs: [
      { question: "Can you handle complex insurance upsells?", answer: "Yes, our booking flows can dynamically offer and calculate insurance packages based on driver data." },
      { question: "Does the system work on mobile?", answer: "Our systems are built mobile-first, allowing agents in the lot to manage inventory via tablet or phone." }
    ]
  },
  'spas': {
    title: "Spas.",
    subtitle: "Automate booking pipelines and streamline your spa operations for maximum utilization.",
    definition: "Digital acquisition and operational management for spas centers on seamless digital booking, client retention CRM, and automated schedule optimization.",
    problem: "Spas often struggle with empty slots during off-peak hours and lack automated systems to re-engage past customers, leading to lost revenue and front-desk bottlenecks.",
    mechanism: "We build immersive, luxury-focused web platforms that integrate directly with your spa management software, coupled with intelligent automated retention workflows.",
    deliverables: [
      { title: "Frictionless Booking Engines", description: "Custom interfaces that make selecting treatments incredibly simple." },
      { title: "Retention Automation", description: "Triggered sequences that automatically rebook clients based on their visit history." },
      { title: "E-Commerce Integration", description: "Beautifully designed digital storefronts for product and gift card sales." }
    ],
    outcomes: [
      { title: "Maximized Utilization", description: "Keep treatment rooms full by capturing demand 24/7." },
      { title: "Increased Gift Card Revenue", description: "Capture lucrative holiday revenue through seamless digital sales." },
      { title: "Higher Customer Retention", description: "Automated CRM triggers remind clients when it's time for their next visit." },
      { title: "Premium Perception", description: "A beautifully designed digital experience justifies premium pricing." }
    ],
    process: [
      { title: "Integration Mapping", description: "We analyze your current spa software to map data flow." },
      { title: "UI/UX Design", description: "We design an interface that evokes a sense of calm and luxury." },
      { title: "Automation Setup", description: "We build email/SMS sequences to re-engage clients automatically." },
      { title: "Launch & Train", description: "We deploy the platform and train your front-desk staff." }
    ],
    faqs: [
      { question: "Can you integrate with software like Mindbody or Zenoti?", answer: "Yes, we specialize in building custom experiences that connect to the APIs of major spa platforms." },
      { question: "How do we fill off-peak hours?", answer: "We set up automated, segmented email campaigns offering yield-management incentives to your existing database." }
    ]
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = industryData[slug];
  
  if (!data) return { title: 'Industry Solutions | Wellmade Digital' };
  
  return {
    title: `Custom CRMs & Automation for ${data.title} | Wellmade Digital`,
    description: data.subtitle,
  };
}

export default async function DynamicIndustryPage({ params }) {
  const { slug } = await params;
  console.log("DYNAMIC ROUTE HIT. Slug:", slug);
  const data = industryData[slug];
  console.log("DYNAMIC ROUTE DATA:", data ? "Found" : "Not Found");

  if (!data) {
    console.log("TRIGGERING NOT FOUND FOR:", slug);
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Systems Engineering for ${data.title}`,
            "provider": {
              "@type": "Organization",
              "name": "Wellmade Digital"
            },
            "description": data.definition
          })
        }}
      />
      <CommercialPage content={data} />
    </>
  );
}
