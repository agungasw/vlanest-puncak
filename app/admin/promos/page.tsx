import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import PromosClientManager from './PromosClientManager';
import { getPromoCodes } from '@/lib/settingsActions';

export default async function AdminPromosPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const promos = await getPromoCodes();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Pemasaran & Diskon
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Manajemen Kode Promo Voucher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Buat kode kupon diskon (potongan nominal Rp atau persentase %), atur batas minimal transaksi, dan non-aktifkan promo kapan saja.
          </p>
        </div>

        <PromosClientManager initialPromos={promos} />
      </main>
    </div>
  );
}
