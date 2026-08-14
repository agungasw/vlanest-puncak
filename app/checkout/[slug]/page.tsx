import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutForm from './CheckoutForm';
import { db } from '@/lib/db';
import { calculateBookingPrice } from '@/lib/pricing';
import { getResortSettings } from '@/lib/settingsActions';

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
  }>;
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { slug } = await params;
  const { checkIn: checkInStr, checkOut: checkOutStr } = await searchParams;

  if (!checkInStr || !checkOutStr) {
    redirect(`/villa/${slug}`);
  }

  const villa = await db.villa.findUnique({
    where: { slug },
    include: {
      photos: true,
      special_rates: true,
      blocked_dates: true,
      bookings: true,
    },
  });

  if (!villa) {
    notFound();
  }

  const settings = await getResortSettings();

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  const priceResult = calculateBookingPrice(
    {
      base_price_weekday: villa.base_price_weekday,
      base_price_weekend: villa.base_price_weekend,
      security_deposit: villa.security_deposit,
      min_stay_default: villa.min_stay_default,
      special_rates: villa.special_rates,
      blocked_dates: villa.blocked_dates,
      bookings: villa.bookings,
    },
    checkIn,
    checkOut
  );

  if (!priceResult.isValid) {
    redirect(`/villa/${slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex-1 space-y-8">
        <div>
          <span className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest block">
            Langkah Terakhir Pemesanan
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            Formulir Data Tamu & Pembayaran
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Pemesanan Vila: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{villa.title}</span> ({villa.location_area}, Puncak)
          </p>
        </div>

        <CheckoutForm
          villa={villa}
          checkInStr={checkInStr}
          checkOutStr={checkOutStr}
          priceResult={priceResult}
          resortSettings={settings}
        />
      </main>

      <Footer />
    </div>
  );
}
