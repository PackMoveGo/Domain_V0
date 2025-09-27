import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutNext from '../src/component/layout/LayoutNext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PackMoveGo - Professional Moving & Packing Services',
  description: 'Professional moving and packing services for residential and commercial moves. Trusted by thousands of customers.',
  keywords: 'moving services, packing services, relocation, moving company',
  authors: [{ name: 'PackMoveGo Team' }],
  creator: 'PackMoveGo',
  publisher: 'PackMoveGo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://packmovego.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PackMoveGo - Professional Moving & Packing Services',
    description: 'Professional moving and packing services for residential and commercial moves.',
    url: 'https://packmovego.com',
    siteName: 'PackMoveGo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PackMoveGo Moving Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PackMoveGo - Professional Moving & Packing Services',
    description: 'Professional moving and packing services for residential and commercial moves.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <LayoutNext>
          {children}
        </LayoutNext>
      </body>
    </html>
  );
}
