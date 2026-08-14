import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import OwnersClientManager from './OwnersClientManager';
import { getVillaOwnersWithVillas } from '@/lib/ownerManagementActions';
import { db } from '@/lib/db';

export default async function AdminOwnersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const owners = await getVillaOwnersWithVillas();
  const villas = await db.villa.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Manajemen Partner Resort
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Direktori Pemilik Vila & Broadcast WA
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Daftarkan nomor WhatsApp pemilik vila, alokasikan kepemilikan unit, dan kirim pesan broadcast pengingat update kalender.
          </p>
        </div>

        <OwnersClientManager initialOwners={owners} availableVillas={villas} />
      </main>
    </div>
  );
}
