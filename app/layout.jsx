import './globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import TrackingProvider from '@/components/tracking/TrackingProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })

export const metadata = {
  title: 'Studio Noir | Digital Studio',
  description: 'We design and build the digital systems businesses need to operate better, automate repetitive work, and grow.',
  themeColor: '#0E0E0F',
  icons: {
    icon: '/assets/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
