import { getPricingData } from '@/lib/pricing-db';
import CalculatorClient from './CalculatorClient';

export const metadata = {
  title: 'Pricing Calculator | Wellmade Digital',
  description: 'Internal pricing calculator for client discovery',
};

export default async function PricingCalculatorPage() {
  const data = await getPricingData();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Project Pricing Calculator</h1>
        <p className="text-zinc-400">
          Internal tool for estimating project costs, generating quotes, and applying dependency discounts.
        </p>
      </div>

      <CalculatorClient initialData={data} />
    </div>
  );
}
