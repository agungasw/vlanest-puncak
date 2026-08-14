import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VillaCatalogClient from './VillaCatalogClient';
import { db } from '@/lib/db';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Star,
  HelpCircle,
  ChevronDown,
  Percent,
  Check,
  Flame,
  Tv,
  Wifi,
  Waves,
  Bus,
  CloudSun,
  Navigation,
  HeartHandshake,
  Users,
  PartyPopper,
  Briefcase,
} from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    area?: string;
    amenity?: string;
    guests?: string;
    category?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const areaFilter = params.area || '';
  const amenityFilter = params.amenity || '';
  const guestsFilter = params.guests ? parseInt(params.guests, 10) : 0;
  const categoryFilter = params.category || '';

  // Query villas from DB
  const villas = await db.villa.findMany({
    where: {
      ...(areaFilter ? { location_area: { contains: areaFilter } } : {}),
      ...(guestsFilter > 0 ? { max_guests: { gte: guestsFilter } } : {}),
      ...(amenityFilter
        ? {
            amenities: {
              some: {
                amenity_name: { contains: amenityFilter },
              },
            },
          }
        : {}),
    },
    include: {
      photos: true,
      amenities: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const areas = ['Cisarua', 'Cipanas', 'Megamendung', 'Ciawi'];
  const quickAmenities = [
    { name: 'Private Pool', icon: Waves },
    { name: 'Akses Bus Besar', icon: Bus },
    { name: 'View Gunung', icon: Sparkles },
    { name: 'Karaoke', icon: Tv },
    { name: 'BBQ', icon: Flame },
    { name: 'Water Heater', icon: Wifi },
  ];

  const eventCategories = [
    { name: 'Family Gathering', icon: Users, desc: 'Kapasitas 15-30 Pax + Kolam & Halaman' },
    { name: 'Outing Perusahaan', icon: Briefcase, desc: 'Akses Bus Besar 59 Seat + Lapangan' },
    { name: 'Private Party / BBQ', icon: PartyPopper, desc: 'Karaoke HD + Sound System & Set BBQ' },
    { name: 'Honeymoon / Relax', icon: HeartHandshake, desc: 'Suasana Hening Sejuk + View Gunung' },
  ];

  const testimonials = [
    {
      name: 'Bpk. Hendra Kusuma',
      role: 'Acara Family Gathering (25 Orang)',
      villa: 'Villa High Pines Cisarua',
      rating: 5,
      comment:
        'Sangat puas! Akses bus 59 seat langsung sampai ke carport vila. Kolam renang bersih sejuk dan karaoke suaranya mantap. Proses booking transparan tanpa biaya tersembunyi.',
    },
    {
      name: 'Ibu Ratna Dewi',
      role: 'Reuni Alumni Universitas',
      villa: 'Villa Panoramic Sky Cipanas',
      rating: 5,
      comment:
        'View Gunung Pangrango dari balkon luar biasa indah saat pagi hari. Penjaga vila sangat ramah dan sigap bantu siapkan alat BBQ. Deposit dikembalikan cepat di hari H.',
    },
    {
      name: 'Rian Pratama',
      role: 'Acara Outbound Kantor',
      villa: 'Villa Royal Crown Megamendung',
      rating: 5,
      comment:
        'Fasilitas biliar dan lapangan rumputnya luas banget. Cocok untuk acara team building perusahaan. Kalender ketersediaannya akurat sekali di web.',
    },
  ];

  const faqs = [
    {
      q: 'Apakah harga yang tertera di web sudah termasuk seluruh fasilitas vila?',
      a: 'Ya, harga yang tertera di web sudah mencakup akses penuh seluruh fasilitas vila (Private Pool, Wifi, Karaoke, BBQ set, Water Heater) tanpa biaya tambahan tersembunyi.',
    },
    {
      q: 'Bagaimana prosedur dan jangka waktu pengembalian Security Deposit?',
      a: 'Security Deposit disimpan sebagai jaminan perawatan properti dan akan dikembalikan 100% via transfer bank langsung saat check-out setelah tim butler melakukan inspeksi vila.',
    },
    {
      q: 'Apakah lokasi vila dapat diakses oleh Bus Besar pariwisata?',
      a: 'Beberapa vila favorit kami (seperti Villa High Pines Cisarua) memiliki akses jalan lebar dan carport khusus yang dapat menampung Bus Pariwisata 59 Seat.',
    },
    {
      q: 'Berapa persen DP yang wajib dibayarkan saat melakukan booking?',
      a: 'Anda bebas memilih skema pembayaran DP 30%, DP 50%, atau Pelunasan 100%. Sisa pelunasan dapat dibayarkan saat rombongan tiba di lokasi vila saat check-in.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0b132b] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors select-none">
        <div className="max-w-7xl mx-auto space-y-8 text-center">
          {/* Real-time Weather & Traffic Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-amber-400 text-xs font-bold border border-emerald-300/50 dark:border-amber-400/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Platform Reservasi Vila Resort Puncak Terpercaya #1</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-semibold border border-sky-300/40">
              <CloudSun className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>Cuaca Puncak Hari Ini: 21°C Sejuk & Cerah</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300/40">
              <Navigation className="w-4 h-4 text-amber-500" />
              <span>Jagorawi Puncak: Normal Lancar</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Temukan Vila Private Eksklusif untuk <br className="hidden sm:inline" />
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Liburan Rombongan Puncak</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Sewa vila private di Cisarua, Cipanas, & Megamendung. Kolam renang hangat, pemandangan gunung, karaoke, dan carport bus besar.
            </p>
          </div>

          {/* Luxury Floating Capsule Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 rounded-full p-2.5 shadow-2xl backdrop-blur-xl">
            <form action="/" method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-left">
              {/* Location Input */}
              <div className="px-6 py-2 border-r border-slate-200 dark:border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-amber-400/80 tracking-wider block">
                  Area Kawasan
                </label>
                <select
                  name="area"
                  defaultValue={areaFilter}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-900">Semua Area Puncak</option>
                  {areas.map((a) => (
                    <option key={a} value={a} className="bg-white dark:bg-slate-900">
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Capacity Input */}
              <div className="px-6 py-2 border-r border-slate-200 dark:border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-amber-400/80 tracking-wider block">
                  Kapasitas Tamu
                </label>
                <select
                  name="guests"
                  defaultValue={guestsFilter ? guestsFilter.toString() : ''}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-900">Berapa saja</option>
                  <option value="10" className="bg-white dark:bg-slate-900">Min. 10 Orang</option>
                  <option value="15" className="bg-white dark:bg-slate-900">Min. 15 Orang</option>
                  <option value="20" className="bg-white dark:bg-slate-900">Min. 20 Orang</option>
                  <option value="25" className="bg-white dark:bg-slate-900">Min. 25 Orang+</option>
                </select>
              </div>

              {/* Amenity Select */}
              <div className="px-6 py-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-amber-400/80 tracking-wider block">
                  Fasilitas
                </label>
                <select
                  name="amenity"
                  defaultValue={amenityFilter}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-900">Semua Fasilitas</option>
                  {quickAmenities.map((am) => (
                    <option key={am.name} value={am.name} className="bg-white dark:bg-slate-900">
                      {am.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button Circle */}
              <div className="p-1 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-sm shadow-md border border-emerald-400/30 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>Cari Vila</span>
                </button>
              </div>
            </form>
          </div>

          {/* Event Category Quick Selection Grid */}
          <div className="pt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-3">
              Cari Berdasarkan Tipe Acara Rombongan:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {eventCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-amber-400 transition-all flex flex-col items-center text-center space-y-1 group shadow-sm hover:scale-[1.02]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-400">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {areaFilter ? `Katalog Vila ${areaFilter}` : 'Vila Puncak Pilihan Terpopuler'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
              Menampilkan <strong className="text-slate-900 dark:text-white">{villas.length}</strong> vila siap huni
            </p>
          </div>
        </div>

        {/* Villa Catalog Client Component */}
        {villas.length > 0 ? (
          <VillaCatalogClient villas={villas} />
        ) : (
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tidak Ada Vila Sesuai Filter</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Coba reset filter lokasi atau fasilitas untuk menemukan ketersediaan vila lainnya.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-full bg-emerald-700 dark:bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-800 transition-all"
            >
              Reset Filter
            </Link>
          </div>
        )}
      </section>

      {/* Direct Booking OTA Advantage Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="max-w-2xl space-y-2">
            <span className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Percent className="w-4 h-4" /> Direct Booking Advantage
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              Mengapa Reservasi Langsung di VlaNest Lebih Hemat dari Aplikasi OTA?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                0%
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Bebas Biaya Komisi OTA (15-20%)</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Harga murni direct dari pengelola resort tanpa mark-up komisi pihak ketiga.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pilihan Fleksibel DP 30% / 50%</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Tidak wajib lunas 100% di awal. Bayar DP dulu dan pelunasan saat check-in di lokasi.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                360°
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pratinjau Virtual Tour 360° VR</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Pratinjau 3D seluruh kamar dan kolam renang secara transparan sebelum bertransaksi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Guest Reviews */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            Ulasan Tamu Verifikasi
          </span>
          <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Pengalaman Menginap Rombongan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 font-bold" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h5>
                <span className="text-[11px] text-emerald-700 dark:text-amber-400 font-bold block">{t.role}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.villa}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> FAQ & Informasi
          </span>
          <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Pertanyaan Sering Diajukan
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left text-sm text-slate-700 dark:text-slate-300 transition-all [&[open]]:border-emerald-600 shadow-sm"
            >
              <summary className="font-bold text-slate-900 dark:text-white cursor-pointer flex items-center justify-between gap-4 list-none">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-amber-400 transition-transform group-[&[open]]:rotate-180 shrink-0" />
              </summary>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
