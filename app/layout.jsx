import './globals.css'
import { DM_Sans } from 'next/font/google'
import { Suspense } from 'react'
import TrackingProvider from '@/components/tracking/TrackingProvider'
import { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata = {
  title: 'Wellmade Digital | High-End B2B Technology Solutions',
  description: 'We design and build the digital systems businesses need to operate better, automate repetitive work, and grow.',
  icons: {
    icon: '/assets/logo.png',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Suspense fallback={null}>
          <TrackingProvider>
            <Toaster position="top-right" />
            {children}
          </TrackingProvider>
        </Suspense>
      </body>
    </html>
  )
}
