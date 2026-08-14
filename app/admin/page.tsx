import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import { db } from '@/lib/db';
import { formatRupiah } from '@/lib/pricing';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import {
  CreditCard,
  Calendar,
  Clock,
  ArrowUpRight,
  User,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const totalVillas = await db.villa.count();
  const bookings = await db.booking.findMany({
    include: { villa: true },
    orderBy: { created_at: 'desc' },
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce(
    (acc, bk) => (bk.payment_status !== 'CANCELLED' ? acc + bk.paid_amount : acc),
    0
  );
  const pendingCount = bookings.filter((b) => b.payment_status === 'PENDING').length;

  const today = new Date();
  const checkInsToday = bookings.filter((b) =>
    isSameDay(new Date(b.check_in_date), today)
  ).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
              Dashboard Management
            </span>
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Ringkasan Operasional Resort
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/villas"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
            >
              + Kelola Vila
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Omset Terbayar</span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white font-sans">
              {formatRupiah(totalRevenue)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Pemasukan DP & Pelunasan Resmi
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transaksi</span>
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {totalBookings} Pemesanan
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              {totalVillas} Vila Aktif di Sistem
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Verifikasi</span>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {pendingCount} Transaksi
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
              Butuh Verifikasi Bukti Transfer
            </span>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Check-in Hari Ini</span>
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                <User className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {checkInsToday} Tamu
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Persiapan Butler & Kebersihan
            </span>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">5 Pemesanan vila paling akhir</p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Lihat Semua Transaksi <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Kode Booking</th>
                  <th className="p-3">Nama Tamu</th>
                  <th className="p-3">Vila Dipesan</th>
                  <th className="p-3">Check-in / Out</th>
                  <th className="p-3">Total Biaya</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.slice(0, 5).map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-amber-400">{bk.booking_code}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{bk.guest_name}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{bk.villa.title}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {format(new Date(bk.check_in_date), 'dd MMM', { locale: id })} -{' '}
                      {format(new Date(bk.check_out_date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white font-sans">{formatRupiah(bk.grand_total)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bk.payment_status === 'PAID_FULL'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                            : bk.payment_status === 'PAID_DP'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        }`}
                      >
                        {bk.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
