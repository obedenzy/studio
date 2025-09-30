import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Inter({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Review Router',
  description: 'Manage your customer reviews seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen font-body antialiased',
          fontInter.variable,
          fontHeadline.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
