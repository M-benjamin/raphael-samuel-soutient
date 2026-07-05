import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'MediCall AI - AI Voice Receptionist for Healthcare Practices',
    template: '%s | MediCall AI',
  },
  description: 'AI-powered voice receptionist platform for healthcare practices and clinics. Book appointments, answer patient questions, and capture leads 24/7.',
  keywords: ['AI receptionist', 'healthcare', 'medical practice', 'voice AI', 'appointment booking', 'clinic'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
