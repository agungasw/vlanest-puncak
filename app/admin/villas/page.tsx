import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import VillasClientManager from './VillasClientManager';
import { db } from '@/lib/db';

export default async function AdminVillasPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const villas = await db.villa.findMany({
    include: {
      photos: true,
      amenities: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <VillasClientManager villas={villas} />
      </main>
    </div>
  );
}
