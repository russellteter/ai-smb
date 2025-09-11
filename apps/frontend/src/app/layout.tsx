import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-provider';
import { Sidebar } from '@/components/layout/sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mothership Leads - SMB Lead Finder',
  description: 'SMB lead discovery and management tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-crm-bg" suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark" storageKey="mothership-theme">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-crm-bg">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}