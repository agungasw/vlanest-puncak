'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Lock, Building, ShieldCheck } from 'lucide-react';
import { loginOwnerAction } from '@/lib/ownerAuthActions';

export default function OwnerLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setErrorMessage('Masukkan nomor WhatsApp terdaftar Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('phone', phone);

    const res = await loginOwnerAction(formData);

    setIsSubmitting(false);

    if (res.success) {
      window.location.href = '/owner';
    } else {
      setErrorMessage(res.error || 'Gagal masuk. Cek nomor WhatsApp Anda.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold text-center">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Nomor WhatsApp Terdaftar:
        </label>
        <div className="relative">
          <input
            type="tel"
            required
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors text-sm font-bold"
          />
          <Phone className="w-4 h-4 text-emerald-600 dark:text-amber-400 absolute left-3.5 top-4" />
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
          Gunakan nomor WhatsApp yang didaftarkan ke Manajemen VlaNest.
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white font-bold text-sm shadow-xl border border-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{isSubmitting ? 'Memverifikasi Nomor...' : 'Masuk Portal Pememilik'}</span>
        <ArrowRight className="w-4 h-4 text-amber-300" />
      </button>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Sistem otentikasi otomatis mengenali nomor telepon terdaftar secara aman.</span>
      </div>
    </form>
  );
}
