import './globals.css';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import { Navbar } from '@/components/layout/navbar';
import { ErrorBoundary } from '@/components/error-boundary';
import { ReduxProvider } from '@/components/providers/redux-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CourseMaster - EdTech Platform',
  description:
    'A comprehensive educational technology platform for course management, student enrollment, and learning progress tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <ReduxProvider>
            <ThemeProvider>
              <Navbar />
              {children}
            </ThemeProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
