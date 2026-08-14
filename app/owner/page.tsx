import { redirect } from 'next/navigation';
import { isOwnerAuthenticated, getOwnerVillasAndData } from '@/lib/ownerAuthActions';
import OwnerDashboardClient from './OwnerDashboardClient';

export default async function OwnerDashboardPage() {
  const session = await isOwnerAuthenticated();

  if (!session) {
    redirect('/owner/login');
  }

  const ownerData = await getOwnerVillasAndData();

  if (!ownerData || ownerData.villas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 p-4">
        <div className="max-w-md bg-white dark:bg-[#0f172a] p-8 rounded-3xl border text-center space-y-4 shadow-xl">
          <h2 className="font-serif text-xl font-bold">Vila Belum Dialokasikan</h2>
          <p className="text-xs text-slate-500">
            Akun Anda ({ownerData?.name || session.phone}) belum terhubung dengan vila mana pun. Hubungi Admin Manajemen VlaNest.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors">
      <OwnerDashboardClient
        ownerName={ownerData.name}
        phone={ownerData.phone_number}
        villas={ownerData.villas as any}
      />
    </div>
  );
}
