import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import { db } from '@/lib/db';
import { formatRupiah } from '@/lib/pricing';
import {
  TrendingUp,
  PieChart,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export default async function AdminResearchPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const bookings = await db.booking.findMany({
    include: {
      villa: true,
    },
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.grand_total, 0);
  const totalNights = bookings.reduce((sum, b) => sum + b.total_nights, 0);
  const avgNights = totalBookings > 0 ? (totalNights / totalBookings).toFixed(1) : 0;

  // Catering stats
  const cateringBookings = bookings.filter((b) => b.catering_package);
  const cateringRevenue = bookings.reduce((sum, b) => sum + (b.catering_amount || 0), 0);
  const cateringConversionRate =
    totalBookings > 0 ? Math.round((cateringBookings.length / totalBookings) * 100) : 0;

  // Mock Market Intelligence Data for Puncak Resort Industry
  const guestOriginDemographics = [
    { city: 'Jakarta Selatan & Barat', percentage: 42, color: 'bg-emerald-500' },
    { city: 'Tangerang / BSD City', percentage: 26, color: 'bg-amber-500' },
    { city: 'Bekasi & Depok', percentage: 18, color: 'bg-teal-500' },
    { city: 'Bandung & Luar Kota', percentage: 14, color: 'bg-blue-500' },
  ];

  const amenityDemandIndex = [
    { name: 'Private Pool (Kolam Renang)', score: 98 },
    { name: 'Kapasitas 20+ Orang (Rombongan)', score: 92 },
    { name: 'Akses Bus Pariwisata 59 Seat', score: 88 },
    { name: 'Fasilitas Karaoke & Sound System', score: 84 },
    { name: 'View Gunung / Kebun Teh Direct', score: 79 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Market Intelligence & Riset Analytics
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Data Riset & Strategi Bisnis Resort
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analisis demografi asal wisatawan, indeks permintaan fasilitas vila Puncak, dan proyeksi omset katering resort.
          </p>
        </div>

        {/* High-Level Research Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rata-rata Durasi Menginap</span>
            <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">{avgNights} Malam</p>

            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Tamu Rombongan Cenderung Stay 2 Malam
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Konversi Tambahan Katering</span>
            <p className="font-serif text-3xl font-bold text-emerald-700 dark:text-amber-400">{cateringConversionRate}%</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              {cateringBookings.length} dari {totalBookings} Pemesanan Mengambil Katering
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Omset Tambahan Katering</span>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white font-sans">
              {formatRupiah(cateringRevenue)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Pendapatan Ekstra Chef Resort
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proyeksi Okupansi Weekend</span>
            <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">94%</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Musim Liburan Puncak Ramai
            </span>
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Demographics */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                  Demografi Asal Wisatawan Puncak
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Persentase wilayah domisili tamu pemesan vila</p>
              </div>
            </div>

            <div className="space-y-4">
              {guestOriginDemographics.map((demo) => (
                <div key={demo.city} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>{demo.city}</span>
                    <span className="font-bold text-emerald-700 dark:text-amber-400">{demo.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className={`h-full ${demo.color} rounded-full transition-all duration-500`}
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenity Demand Index */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Indeks Permintaan Fasilitas Vila (Demand Index)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fasilitas paling dicari pengunjung Puncak</p>
            </div>

            <div className="space-y-3">
              {amenityDemandIndex.map((item) => (
                <div
                  key={item.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                    Skor {item.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Business Recommendations */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Rekomendasi Strategi Penetapan Harga (Dynamic Pricing AI)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-amber-400 block text-sm">Long Weekend & High Season:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tingkatkan tarif khusus (*Special Event Rate*) sebesar +25% hingga +40% untuk libur Tahun Baru, Idul Fitri, dan Long Weekend.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-amber-400 block text-sm">Strategi Diskon Weekday:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Berikan diskon 15% untuk pemesanan Hari Senin - Kamis untuk meningkatkan okupansi hari biasa yang cenderung sepi.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-amber-400 block text-sm">Upselling Paket Katering:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tawarkan *Paket BBQ Night* secara otomatis saat tamu memilih vila kapasitas 20+ orang untuk melipatgandakan margin profit.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
