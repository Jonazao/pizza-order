import '../styles/globals.css';
import { ReactNode } from 'react';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Fresh & Healthy Artisanal Pizza Builder',
  description: 'Craft custom sourdough, cauliflower, and organic pizzas with farm-fresh ingredients.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="bg-stone-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

