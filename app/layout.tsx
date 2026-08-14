import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'VlaNest Puncak | Platform Pemesanan Vila Resort Luxury Puncak',
  description:
    'Sistem pemesanan sewa vila eksklusif di Puncak (Cisarua, Cipanas, Megamendung). Garansi ketersediaan real-time, fasilitas private pool, karaoke, & view gunung.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
