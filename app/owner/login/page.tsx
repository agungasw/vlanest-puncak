import Link from 'next/link';
import { Building, ShieldCheck, PhoneCall } from 'lucide-react';
import OwnerLoginForm from './LoginForm';

export default function OwnerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060b17] text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-400 to-teal-900" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 font-extrabold text-xl shadow-md border border-amber-400/40 mx-auto">
            VN
          </div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300/40 uppercase inline-block">
            Portal Pemilik Vila
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            VlaNest Owner Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Masukan nomor WhatsApp terdaftar Anda untuk mengelola ketersediaan tanggal & memantau penyewaan vila.
          </p>
        </div>

        <OwnerLoginForm />

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
            Kembali ke Website Tamu
          </Link>
        </div>
      </div>
    </div>
  );
}
