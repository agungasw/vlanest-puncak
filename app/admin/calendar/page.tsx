import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import MasterCalendarClient from './MasterCalendarClient';
import { db } from '@/lib/db';

export default async function AdminCalendarPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const villas = await db.villa.findMany({
    include: {
      special_rates: true,
      blocked_dates: true,
      bookings: true,
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
            Master Control Center
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Master Calendar & Dynamic Pricing View
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Atur ketersediaan, blokir booking offline, serta tentukan Event Rate & Minimum Stay untuk seluruh vila Puncak dalam satu layar.
          </p>
        </div>

        <MasterCalendarClient villas={villas} />
      </main>
    </div>
  );
}
