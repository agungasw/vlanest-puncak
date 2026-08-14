import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import HousekeepingClient from './HousekeepingClient';
import { db } from '@/lib/db';

export default async function AdminHousekeepingPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const bookings = await db.booking.findMany({
    include: {
      villa: true,
    },
    orderBy: {
      check_in_date: 'asc',
    },
  });

  const villas = await db.villa.findMany({
    select: { id: true, title: true },
  });

  const maintenanceLogs = await db.villaMaintenanceLog.findMany({
    include: {
      villa: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Operasional Lapangan & Kebersihan
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Jadwal Operasional, Deposit & Log Maintenance Vila
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Dashboard harian tim lapangan, inspeksi deposit, serta pencatatan biaya perbaikan / kerusakan vila.
          </p>
        </div>

        <HousekeepingClient
          bookings={bookings}
          villasList={villas}
          maintenanceLogs={maintenanceLogs}
        />
      </main>
    </div>
  );
}
