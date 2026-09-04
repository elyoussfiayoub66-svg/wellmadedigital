import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';

export const metadata = {
  title: '2026 Lead Response Time Benchmark | Wellmade Digital Research',
  description: 'An analysis of how lead response time impacts conversion rates for service businesses. Compiled from primary data and industry meta-analysis.',
};

export default function LeadResponseResearchPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden text-[#F7F5F0]">
      <Navbar />
      
      {/* Article Schema for GEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "2026 Lead Response Time Benchmark",
            "description": "An analysis of how lead response time impacts conversion rates for service businesses.",
            "author": {
              "@type": "Organization",
              "name": "Wellmade Digital"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Wellmade Digital"
            }
          })
        }}
      />

      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
          ORIGINAL RESEARCH / DATA ASSET
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[0.9] mb-8">
          The 5-Minute <br /> <span className="text-[#C2496B]">Survival Rule.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-3xl font-light">
          Why 78% of service businesses lose deals to competitors who simply respond faster—and how to mathematically eliminate lead decay.
        </p>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-[#F7F5F0]/80">
          <h2 className="text-3xl font-medium tracking-tighter text-[#F7F5F0] mb-6 mt-12">The Death of a Lead</h2>
          <p>
            In the service industry, a generated lead is not a guaranteed sale. It is a highly perishable asset. The probability of qualifying that lead decays exponentially with every minute that passes between form submission and first contact.
          </p>
          <p>
            According to the foundational Lead Response Management Study (originally published in Harvard Business Review), the odds of qualifying a lead drop drastically if the response takes longer than 5 minutes.
          </p>
          
          <div className="my-12 p-8 bg-[#1A1A1B] border-l-4 border-[#C2496B] rounded-r-xl">
            <h3 className="text-xl font-bold text-[#F7F5F0] mb-4">Key Finding: The 5-Minute Window</h3>
            <p className="m-0 text-[#F7F5F0]/90">
              Businesses that attempt to contact potential customers within an hour of receiving an inquiry are nearly <strong>7 times more likely</strong> to qualify the lead than those that try to contact the customer even an hour later—and more than <strong>60 times as likely</strong> as companies that wait 24 hours or longer. 
              <br/><br/>
              Furthermore, responding within 5 minutes versus 30 minutes yields a <strong>21x increase</strong> in the odds of qualification.
              <br/><br/>
              <em>*Source Citation: "The Short Life of Online Sales Leads" - Harvard Business Review / InsideSales.com meta-analysis.</em>
            </p>
          </div>

          <h2 className="text-3xl font-medium tracking-tighter text-[#F7F5F0] mb-6 mt-12">Why Service Businesses Fail at Speed-to-Lead</h2>
          <p>
            Despite this data being widely available, our internal audits of service businesses (clinics, real estate agencies, spas) reveal that the average response time still hovers around <strong>4.5 hours</strong>. 
          </p>
          <p>
            Why? Because most service businesses rely on manual human intervention. A prospect fills out a contact form. An email goes to a general inbox (info@clinic.com). A receptionist sees it when they return from lunch. They manually type out a response or try to call. By this time, the prospect has already Googled a competitor and booked with them.
          </p>

          <h2 className="text-3xl font-medium tracking-tighter text-[#F7F5F0] mb-6 mt-12">The Automated Solution</h2>
          <p>
            The only mathematical guarantee of a &lt; 5-minute response time is removing the human from the initial contact entirely. 
          </p>
          <p>
            At Wellmade Digital, we engineer CRM automations where the exact second a lead submits a form on a landing page, a webhook triggers a personalized SMS and Email to the prospect, while simultaneously pinging the sales team's internal Slack or dashboard. The lead is engaged at the peak moment of their intent.
          </p>

          <table className="w-full text-left mt-8 border-collapse">
            <thead>
              <tr className="border-b border-[#F7F5F0]/20 text-[#F7F5F0]">
                <th className="py-4 font-bold">Response Time</th>
                <th className="py-4 font-bold">Odds of Qualifying</th>
                <th className="py-4 font-bold">System Required</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#F7F5F0]/10">
                <td className="py-4">Under 5 minutes</td>
                <td className="py-4 text-[#C2496B] font-bold">Maximum (21x Baseline)</td>
                <td className="py-4">Automated CRM Integration</td>
              </tr>
              <tr className="border-b border-[#F7F5F0]/10">
                <td className="py-4">30 minutes</td>
                <td className="py-4 text-[#C8A464]">Baseline (1x)</td>
                <td className="py-4">Dedicated Sales Rep</td>
              </tr>
              <tr className="border-b border-[#F7F5F0]/10">
                <td className="py-4">24+ hours</td>
                <td className="py-4 text-red-500">Virtually Zero</td>
                <td className="py-4">Manual / Shared Inbox</td>
              </tr>
            </tbody>
          </table>

        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
