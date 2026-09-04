import CommercialPage from '@/components/shared/CommercialPage';

export const metadata = {
  title: 'CRM & Sales Automation | Wellmade Digital',
  description: 'Custom CRM systems and workflow automations to stop lead leakage and close more deals for service businesses.',
};

export default function CRMAutomationPage() {
  const content = {
    title: "Custom CRMs & Automation.",
    subtitle: "Eliminate operational chaos. We engineer custom CRM systems and workflows that save your business time, reduce costs, and organize your data.",
    definition: "A Custom CRM (Customer Relationship Management) system is the central nervous system of your business operations. Paired with intelligent workflow automation, it tracks every interaction, automatically triggers operational sequences, and ensures your team is always aligned and efficient.",
    problem: "Most service businesses are drowning in operational chaos. You are likely wasting hours every week on manual data entry, scattered spreadsheets, disconnected software tools, and repetitive administrative tasks. This chaos not only exhausts your team but actively burns money and creates a terrible customer experience.",
    mechanism: "We build bespoke CRM architectures mapped to your exact sales process. We then connect API integrations to automate data flow between your website, your CRM, and your communication channels.",
    deliverables: [
      {
        title: "Bespoke CRM Architecture",
        description: "We configure the perfect CRM environment tailored to your specific stages, completely eliminating bloated, confusing interfaces."
      },
      {
        title: "Speed-to-Lead Automation",
        description: "Instant SMS and email responses triggered the exact second a lead is captured, drastically increasing engagement rates."
      },
      {
        title: "Workflow Integrations",
        description: "Seamless connections between your website forms, calendar booking systems, payment processors, and sales dashboards."
      }
    ],
    outcomes: [
      {
        title: "Zero Lead Leakage",
        description: "Every single inquiry is mathematically tracked, assigned, and nurtured. Nothing falls through the cracks."
      },
      {
        title: "Higher Close Rates",
        description: "By engaging prospects within 5 minutes of inquiry through automation, your probability of closing the deal skyrockets."
      },
      {
        title: "Recovered Time",
        description: "Eliminate hundreds of hours of manual data entry. Your sales team spends time actually talking to clients, not doing admin."
      },
      {
        title: "Actionable Analytics",
        description: "Know exactly how many leads are in each stage of your pipeline and accurately forecast your monthly revenue."
      }
    ],
    process: [
      {
        title: "Process Mapping",
        description: "We document your entire customer journey from first click to closed deal, identifying bottlenecks and manual tasks."
      },
      {
        title: "CRM Configuration",
        description: "We build the custom pipelines, custom fields, and user roles required to support your specific sales motion."
      },
      {
        title: "Automation Engineering",
        description: "We write the logic and connect the webhooks that power instant notifications, automated emails, and data syncing."
      },
      {
        title: "Team Onboarding",
        description: "We train your team on how to use the system efficiently, ensuring total adoption and immediate ROI."
      }
    ],
    faqs: [
      {
        question: "Do you build custom CRM software from scratch?",
        answer: "Typically, no. Building a secure CRM from scratch is incredibly expensive and unnecessary for most businesses. Instead, we architect bespoke solutions on top of world-class infrastructure (like HubSpot, GoHighLevel, or customized Supabase/Next.js dashboards), saving you tens of thousands in development costs while delivering exactly what you need."
      },
      {
        question: "How fast should we be responding to leads?",
        answer: "Industry data proves that responding to a lead within 5 minutes increases the odds of qualifying that lead by 21 times compared to responding after 30 minutes. Automation guarantees a 0-minute response time."
      },
      {
        question: "Can you integrate the CRM with our existing website?",
        answer: "Yes. Whether your site is built on Next.js, WordPress, Shopify, or Webflow, we can use APIs and webhooks to ensure seamless, real-time data transfer into your new CRM."
      },
      {
        question: "Is automation going to make our brand sound like a robot?",
        answer: "No. Good automation feels deeply personal. We craft the messaging so that an automated introductory SMS or email sounds exactly like a helpful human assistant reaching out immediately."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "CRM and Sales Automation",
            "provider": {
              "@type": "Organization",
              "name": "Wellmade Digital"
            },
            "description": content.definition
          })
        }}
      />
      <CommercialPage content={content} />
    </>
  );
}
