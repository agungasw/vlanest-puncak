import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmailReceiptModal from './EmailReceiptModal';
import { db } from '@/lib/db';
import { formatRupiah } from '@/lib/pricing';
import { generateGuestWhatsAppUrl } from '@/lib/whatsapp';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  CheckCircle2,
  MapPin,
  MessageSquare,
  Printer,
  ArrowLeft,
  PhoneCall,
  Navigation,
  MessageSquareText,
  Zap,
} from 'lucide-react';

interface SuccessPageProps {
  params: Promise<{
    bookingCode: string;
  }>;
}

export default async function BookingSuccessPage({ params }: SuccessPageProps) {
  const { bookingCode } = await params;

  const booking = await db.booking.findUnique({
    where: { booking_code: bookingCode },
    include: {
      villa: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const waUrl = generateGuestWhatsAppUrl({
    whatsappNumber: booking.whatsapp_number,
    bookingCode: booking.booking_code,
    villaTitle: booking.villa.title,
    guestName: booking.guest_name,
    checkIn: booking.check_in_date,
    checkOut: booking.check_out_date,
    grandTotal: booking.grand_total,
    paymentType: booking.payment_type,
    paidAmount: booking.paid_amount,
    remainingAmount: booking.remaining_amount,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex-1 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-sm mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 text-xs uppercase font-bold tracking-widest block">
            Pemesanan Berhasil Dibuat
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            E-Voucher Pemesanan Vila
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
            Simpan E-Voucher ini dan kirimkan konfirmasi langsung ke Customer Service WhatsApp resort.
          </p>
        </div>

        {/* E-Voucher Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Decorative Corner Badge */}
          <div className="absolute top-0 right-0 bg-emerald-700 dark:bg-amber-400 text-white dark:text-slate-950 px-4 py-1 rounded-bl-2xl text-[11px] font-extrabold uppercase tracking-widest">
            OFFICIAL VOUCHER
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Kode Pemesanan Unik</span>
            <span className="font-mono text-3xl font-bold text-emerald-700 dark:text-amber-400 block mt-1">
              {booking.booking_code}
            </span>
          </div>

          {/* Villa Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Vila Dipesan:</span>
              <p className="font-serif text-base font-bold text-slate-900 dark:text-white">{booking.villa.title}</p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                {booking.villa.location_area}, Puncak
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pemesan Utama:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{booking.guest_name}</p>
              <p className="text-slate-600 dark:text-slate-400">{booking.whatsapp_number}</p>
            </div>
          </div>

          {/* Special Requests if present */}
          {booking.special_requests && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                <MessageSquareText className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" /> Catatan Khusus Tamu:
              </span>
              <p className="text-slate-600 dark:text-slate-300 italic">{booking.special_requests}</p>
            </div>
          )}

          {/* Instant Payment Verification Badge */}
          {booking.proof_of_payment_url === 'QRIS_INSTANT_PAID' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              <span>Pembayaran QRIS Instant Berhasil Terverifikasi Otomatis!</span>
            </div>
          )}

          {/* Stay Dates */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Check-in</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                {format(new Date(booking.check_in_date), 'dd MMMM yyyy', { locale: id })}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Mulai 14.00 WIB</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Check-out</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                {format(new Date(booking.check_out_date), 'dd MMMM yyyy', { locale: id })}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Maks 12.00 WIB</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 pb-2">
              <span>Total Biaya Menginap ({booking.total_nights} Malam):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(booking.total_base_price)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 py-2">
              <span>Security Deposit (Dikembalikan saat check-out):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(booking.security_deposit_amount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm py-2">
              <span>Grand Total:</span>
              <span className="text-emerald-700 dark:text-amber-400 font-sans">{formatRupiah(booking.grand_total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold py-2">
              <span>Status Pembayaran:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-[11px]">
                {booking.payment_status === 'PAID_FULL'
                  ? 'LUNAS (100%)'
                  : booking.payment_status === 'PAID_DP'
                  ? 'DP DITERIMA'
                  : 'MENUNGGU VERIFIKASI'}
              </span>
            </div>
            {booking.remaining_amount > 0 && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 pt-2 font-semibold">
                <span>Sisa Pelunasan di Lokasi Vila:</span>
                <span>{formatRupiah(booking.remaining_amount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps Route Navigation & Butler Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={booking.villa.google_maps_url || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all text-left flex items-center gap-3 shadow-sm group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-xs block">Rute Google Maps Vila</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">1-Klik Panduan Navigasi GPS</span>
            </div>
          </a>

          <a
            href="https://wa.me/6281298765432?text=Halo%20Butler%20VlaNest,%20saya%20pemesan%20"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all text-left flex items-center gap-3 shadow-sm group"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-xs block">Kontak Butler Penjaga Vila</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Bantuan Lapangan & Sambutan</span>
            </div>
          </a>
        </div>

        {/* Automated Email Receipt & WhatsApp Confirmation CTA */}
        <div className="space-y-4 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-base shadow-lg border border-emerald-400/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Kirim Konfirmasi via WhatsApp</span>
          </a>

          <EmailReceiptModal
            bookingCode={booking.booking_code}
            guestName={booking.guest_name}
            villaTitle={booking.villa.title}
          />

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <button
              onClick={() => window.print()}
              className="hover:text-emerald-700 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak E-Voucher PDF
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
