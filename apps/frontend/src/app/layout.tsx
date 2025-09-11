import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mothership Leads - AI-Powered SMB Discovery',
  description: 'Professional lead generation platform for discovering and qualifying SMB opportunities with AI-powered insights',
  keywords: 'lead generation, SMB, AI, sales intelligence, B2B, outreach',
  authors: [{ name: 'Mothership' }],
  openGraph: {
    title: 'Mothership Leads',
    description: 'AI-Powered SMB Discovery & Outreach Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="mothership-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}