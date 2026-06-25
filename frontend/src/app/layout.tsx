import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SDLMS — Smart Digital Learning Management System',
  description: 'A powerful multi-university learning management system for modern education.',
  keywords: ['LMS', 'Learning Management System', 'University', 'Education', 'Courses'],
  authors: [{ name: 'SDLMS Team' }],
  openGraph: {
    title: 'SDLMS — Smart Digital Learning Management System',
    description: 'A powerful multi-university learning management system for modern education.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* AppRouterCacheProvider is the official MUI fix for Next.js App Router SSR hydration */}
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
