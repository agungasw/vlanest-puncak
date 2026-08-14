import Link from 'next/link';
import LoginForm from './LoginForm';
import { isAdminAuthenticated } from '@/lib/authActions';
import { ShieldCheck } from 'lucide-react';

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-amber-400 font-bold text-2xl border border-amber-500/30 shadow-xl mb-1">
            VN
          </div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
            Akses Otentikasi Terkunci
          </span>
          <h1 className="font-serif text-2xl font-bold text-white">
            Login Admin VlaNest Puncak
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Masukkan kata sandi pengelola resort untuk mengakses data transaksi, master kalender, dan properti.
          </p>

          {authenticated && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sesi Anda aktif. Masukkan password lagi untuk konfirmasi atau ke <Link href="/admin" className="underline font-bold text-white">Dashboard</Link>.</span>
            </div>
          )}
        </div>

        {/* Client Login Form */}
        <LoginForm />

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
            ← Kembali ke Website Tamu
          </Link>
        </div>
      </div>
    </div>
  );
}
