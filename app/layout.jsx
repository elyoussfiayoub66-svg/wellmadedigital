import './globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import TrackingProvider from '@/components/tracking/TrackingProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })

export const metadata = {
  title: 'Wellmade Digital | Custom CRMs & Automation Systems',
  description: 'Wellmade Digital engineers custom CRM systems, automations, and workflows for service businesses to save time, reduce costs, and completely eliminate operational chaos.',
  themeColor: '#0E0E0F',
  icons: {
    icon: '/assets/favicon.png?v=2',
  },
}

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wellmade Digital',
    description: 'Engineering custom CRM systems, automations, and workflows for service businesses to save time, reduce costs, and eliminate operational chaos.',
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <TrackingProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A1A1B',
                  color: '#F7F5F0',
                  border: '1px solid #2A2A2B',
                  borderRadius: '8px',
                },
              }}
            />
            {children}
          </TrackingProvider>
        </Suspense>
      </body>
    </html>
  )
}
