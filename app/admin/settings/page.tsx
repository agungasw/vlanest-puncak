import { redirect } from 'next/navigation';
import { isAdminAuthenticated, getAdminAuditLogs } from '@/lib/authActions';
import AdminSidebar from '@/components/AdminSidebar';
import SettingsClientManager from './SettingsClientManager';
import { getResortSettings } from '@/lib/settingsActions';

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const settings = await getResortSettings();
  const auditLogs = await getAdminAuditLogs();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
            Pengaturan Resort & Keamanan
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Ubah Kata Sandi, Rekening & Audit Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ubah kata sandi admin, nomor rekening transfer BCA/Mandiri, nomor WhatsApp CS, serta pantau riwayat keamanan sistem.
          </p>
        </div>

        <SettingsClientManager initialSettings={settings} auditLogs={auditLogs} />
      </main>
    </div>
  );
}
