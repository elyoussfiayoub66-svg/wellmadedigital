import CommercialPage from '@/components/shared/CommercialPage';

export const metadata = {
  title: 'Workflow Automation & Process Engineering | Wellmade Digital',
  description: 'Eliminate manual data entry and operational bottlenecks with custom workflow automations.',
};

export default function WorkflowsPage() {
  const content = {
    title: "Workflow Automation.",
    subtitle: "Stop paying humans to do robotic work. We connect your software stack to eliminate manual data entry, reduce errors, and save your business thousands of hours.",
    definition: "Workflow Automation is the process of connecting disparate software systems via APIs so that data flows seamlessly between them without human intervention. Instead of an employee copying data from an email into a spreadsheet and then into a CRM, the system does it instantly and flawlessly.",
    problem: "As service businesses scale, they accumulate 'software bloat'—a collection of disjointed tools that don't talk to each other. This creates massive operational chaos. Your team wastes hours every day on repetitive, mind-numbing administrative tasks. Manual data entry inherently causes expensive errors, slows down service delivery, and fundamentally blocks your ability to scale profitably.",
    mechanism: "We map your entire operational lifecycle to identify bottlenecks. We then utilize enterprise-grade integration platforms (like Make or custom API scripts) to build invisible data bridges between your booking software, payment gateways, CRM, and communication tools.",
    deliverables: [
      {
        title: "Systems Integration",
        description: "Flawlessly connecting your existing tools (e.g., Mindbody to HubSpot, or Stripe to Slack) so data updates everywhere instantly."
      },
      {
        title: "Automated Communications",
        description: "Triggering highly personalized, context-aware emails and SMS messages based on specific customer actions or operational milestones."
      },
      {
        title: "Custom Dashboards",
        description: "Aggregating data from multiple sources into a single, clean interface so management has a real-time view of business health."
      }
    ],
    outcomes: [
      {
        title: "Massive Cost Reduction",
        description: "By automating administrative tasks, you eliminate the need to hire additional administrative staff as you scale."
      },
      {
        title: "Zero Data Errors",
        description: "Computers don't make typos. Automated data transfer completely eliminates the costly human errors associated with manual entry."
      },
      {
        title: "Recovered Time",
        description: "Give your team their time back so they can focus on high-value, revenue-generating activities like client service and strategy."
      },
      {
        title: "Instant Operations",
        description: "Tasks that used to take days of back-and-forth communication are now executed in milliseconds."
      }
    ],
    process: [
      {
        title: "Operational Audit",
        description: "We shadow your team or analyze your SOPs to identify the most time-consuming manual tasks in your business."
      },
      {
        title: "Logic Engineering",
        description: "We design the if/then logic required to automate the process, accounting for all possible edge cases and errors."
      },
      {
        title: "API Integration",
        description: "We build the actual connections, securely routing your data between platforms using enterprise-grade encryption."
      },
      {
        title: "Testing & Deployment",
        description: "We run the new workflow in a staging environment to ensure perfect execution before turning it on for your live business."
      }
    ],
    faqs: [
      {
        question: "Do we have to change all the software we currently use?",
        answer: "Usually, no. We specialize in connecting the tools you already rely on. As long as your software has a modern API, we can automate it."
      },
      {
        question: "What happens if a workflow breaks?",
        answer: "We build error-handling protocols into every automation. If a tool goes offline or an API changes, the system immediately alerts us and pauses the workflow to prevent data corruption."
      },
      {
        question: "Is this secure?",
        answer: "Absolutely. Data is transferred using secure, encrypted API endpoints. Automation actually increases security by removing the need for employees to manually handle sensitive data in unprotected spreadsheets."
      },
      {
        question: "How do we know what to automate first?",
        answer: "We focus on ROI. We look for tasks that happen frequently and take a lot of time. If a task takes 10 minutes but happens 50 times a day, automating it saves you over 40 hours a week. That's where we start."
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
            "name": "Workflow Automation",
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
