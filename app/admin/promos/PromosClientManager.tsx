'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatRupiah } from '@/lib/pricing';
import {
  savePromoCodeAction,
  togglePromoStatusAction,
  deletePromoCodeAction,
} from '@/lib/settingsActions';
import { Ticket, Plus, Trash2, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';

export interface PromoAdminRecord {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_spend: number;
  active: boolean;
  created_at: Date | string;
}

export default function PromosClientManager({
  initialPromos,
}: {
  initialPromos: PromoAdminRecord[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState<number>(200000);
  const [minSpend, setMinSpend] = useState<number>(1000000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await savePromoCodeAction({
      code: code.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_spend: Number(minSpend),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setCode('');
      setDiscountValue(200000);
      setMinSpend(1000000);
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan kode promo.');
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    await togglePromoStatusAction(id, !currentActive);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kode promo ini?')) {
      await deletePromoCodeAction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-amber-400 font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Kupon & Promo Aktif</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total {initialPromos.length} Kode Kupon Terdaftar</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>+ Buat Kode Promo Baru</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Kode Kupon</th>
                <th className="p-3">Jenis Diskon</th>
                <th className="p-3">Nilai Potongan</th>
                <th className="p-3">Minimal Transaksi</th>
                <th className="p-3">Status Promo</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialPromos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                      {p.code}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {p.discount_type === 'PERCENTAGE' ? 'Persentase (%)' : 'Potongan Tetap (Rp)'}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white font-sans text-sm">
                    {p.discount_type === 'PERCENTAGE' ? `${p.discount_value}%` : formatRupiah(p.discount_value)}
                  </td>
                  <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                    {formatRupiah(p.min_spend)}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(p.id, p.active)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer flex items-center gap-1.5 ${
                        p.active
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                      }`}
                    >
                      {p.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> AKTIF
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> NON-AKTIF
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
                      title="Hapus Promo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Buat Kode Promo Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Kode Kupon (Huruf Kapital & Angka):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PUNCAKCERIA"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jenis Diskon:</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="FIXED_AMOUNT">Potongan Nominal Tetap (Rp)</option>
                  <option value="PERCENTAGE">Potongan Persentase (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nilai Potongan ({discountType === 'PERCENTAGE' ? '%' : 'Rp'}):
                </label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Minimal Total Transaksi (Rp):</label>
                <input
                  type="number"
                  required
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kode Promo'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
