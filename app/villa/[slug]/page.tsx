import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VirtualTourModal from '@/components/VirtualTourModal';
import VillaPhotoCarousel from '@/components/VillaPhotoCarousel';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { db } from '@/lib/db';
import { formatRupiah } from '@/lib/pricing';
import {
  Users,
  Bed,
  Bath,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  FileText,
  Clock,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';

interface VillaDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VillaDetailPage({ params }: VillaDetailPageProps) {
  const { slug } = await params;

  const villa = await db.villa.findUnique({
    where: { slug },
    include: {
      photos: true,
      amenities: true,
      special_rates: true,
      blocked_dates: true,
      bookings: true,
    },
  });

  if (!villa) {
    notFound();
  }

  const csWhatsappNumber = '6281298765432';
  const waInquiryMsg = `Halo CS VlaNest Resort Puncak,%0A%0ASaya tertarik untuk reservasi vila berikut:%0A🏡 *Vila*: ${encodeURIComponent(villa.title)}%0A📍 *Lokasi*: ${encodeURIComponent(villa.location_area)}, Puncak%0A💰 *Tarif*: ${encodeURIComponent(formatRupiah(villa.base_price_weekday))}/malam%0A%0AApakah vila ini masih tersedia untuk rencana tanggal menginap saya? Mohon informasinya. Terima kasih!`;
  const waInquiryUrl = `https://wa.me/${csWhatsappNumber}?text=${waInquiryMsg}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors relative select-none">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <a href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400">Home</a>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <a href={`/?area=${villa.location_area}`} className="hover:text-emerald-700 dark:hover:text-emerald-400">{villa.location_area}</a>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold truncate">{villa.title}</span>
        </div>
      </div>

      {/* Hero Header & Quick Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                {villa.location_area}, Puncak
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
                Luxury Resort Villa
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {villa.title}
            </h1>
          </div>

          <div className="flex items-center gap-6 text-sm bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{villa.max_guests} Orang</span>
                <span className="text-[10px] text-slate-400">Kapasitas Maks</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{villa.bedrooms} Kamar</span>
                <span className="text-[10px] text-slate-400">Tidur Private</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{villa.bathrooms} KM</span>
                <span className="text-[10px] text-slate-400">Kamar Mandi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Carousel & Touch Lightbox Component */}
        <VillaPhotoCarousel
          photos={villa.photos}
          villaTitle={villa.title}
        />

        {/* Virtual Tour Modal Container */}
        <VirtualTourModal
          virtualTourUrl={villa.photos[0]?.virtual_tour_url}
          photos={villa.photos}
        />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-6">
          {/* Left Column: Details & Amenities */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Deskripsi & Keunggulan Vila</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-light">
                {villa.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Fasilitas Lengkap Vila
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {villa.amenities.map((am) => (
                  <div
                    key={am.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{am.amenity_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in & Check-out Schedules Box */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Jadwal Check-in & Check-out Resmi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-sm">Waktu Check-in:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold block text-base">Pukul 14.00 WIB</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Penyambutan & inspeksi bersama butler villa</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-500/30 space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block text-sm">Waktu Check-out:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold block text-base">Pukul 12.00 WIB</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Pengembalian Security Deposit 100% di lokasi</span>
                </div>
              </div>
            </div>

            {/* Real-time Interactive Availability Calendar */}
            <AvailabilityCalendar
              villaSlug={villa.slug}
              villaPricing={{
                base_price_weekday: villa.base_price_weekday,
                base_price_weekend: villa.base_price_weekend,
                security_deposit: villa.security_deposit,
                min_stay_default: villa.min_stay_default,
                special_rates: villa.special_rates,
                blocked_dates: villa.blocked_dates,
                bookings: villa.bookings,
              }}
            />

            {/* House Rules & Security Deposit */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Aturan Rumah (House Rules) & Deposit
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Tata Tertib Pengunjung:</h4>
                  <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">
                    {villa.rules_text}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-emerald-700 dark:text-amber-400 text-sm">Ketentuan Security Deposit:</h4>
                  <div className="space-y-2 text-slate-700 dark:text-slate-300">
                    <p>
                      • Nominal Security Deposit:{' '}
                      <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(villa.security_deposit)}</span>
                    </p>
                    <p>
                      • Deposit dikumpulkan bersama total pembayaran untuk menjamin keselamatan fasilitas vila.
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      • Dikembalikan 100% via transfer bank setelah inspeksi H+0 saat check-out.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Summary & WA Inquiry Card */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  Tarif Dasar Per Malam
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-700 dark:text-amber-400 font-sans">
                    {formatRupiah(villa.base_price_weekday)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/Weekday</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>Weekend (Jum & Sab):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(villa.base_price_weekend)}</span>
                </div>
              </div>

              {/* Special Event Rates Banner */}
              {villa.special_rates.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 space-y-2 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Harga Event / Peak Season Aktif:
                  </span>
                  {villa.special_rates.map((sr) => (
                    <div key={sr.id} className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                      <span>{sr.event_name}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 font-sans">
                        {formatRupiah(sr.custom_price_per_night)}/malam
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 1-CLICK DIRECT WHATSAPP INQUIRY BUTTON */}
              <div className="space-y-2">
                <a
                  href={waInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs shadow-lg border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                  <span>Tanya CS via WA Direct (Respon Cepat)</span>
                </a>
                <span className="text-[10px] text-slate-400 block text-center">
                  Otomatis terisi format reservasi vila ini ke WA CS
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Garansi Tanpa Biaya Tersembunyi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                  <span>Pilihan DP 30%, 50%, atau Lunas 100%</span>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Gunakan <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Kalender Ketersediaan</span> di bagian kiri halaman untuk memilih tanggal dan lanjut ke pembayaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Mobile WhatsApp CS Badge */}
      <a
        href={waInquiryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-3.5 rounded-full bg-emerald-600 text-white shadow-2xl border-2 border-amber-300/80 flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer"
        title="Tanya CS via WA Direct"
      >
        <MessageSquare className="w-5 h-5 text-amber-300 animate-bounce" />
        <span className="text-xs font-bold hidden sm:inline pr-1">Tanya CS WA</span>
      </a>

      {/* Floating Mobile Booking Bar Capsule */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 lg:hidden shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tarif Mulai</span>
          <span className="font-bold text-emerald-700 dark:text-amber-400 font-sans text-base">
            {formatRupiah(villa.base_price_weekday)}
          </span>
          <span className="text-[10px] text-slate-500">/malam</span>
        </div>
        <a
          href="#kalender"
          className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
        >
          Pilih Tanggal & Pesan
        </a>
      </div>

      <Footer />
    </div>
  );
}
