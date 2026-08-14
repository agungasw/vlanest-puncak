import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import BookingsManagerClient from './BookingsManagerClient';
import { db } from '@/lib/db';

export default async function AdminBookingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const bookings = await db.booking.findMany({
    include: {
      villa: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const villas = await db.villa.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Manajemen Pemesanan
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Daftar Transaksi & E-Voucher WhatsApp
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Verifikasi bukti pembayaran transfer, ubah status transaksi, unduh laporan CSV, tambah booking manual, dan kirimkan E-Voucher WhatsApp.
          </p>
        </div>

        <BookingsManagerClient initialBookings={bookings} villasList={villas} />
      </main>
    </div>
  );
}
