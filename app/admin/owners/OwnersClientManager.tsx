'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  MessageSquare,
  Building,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  createVillaOwnerAction,
  deleteVillaOwnerAction,
  assignVillaToOwnerAction,
  generateOwnerWABroadcastUrl,
} from '@/lib/ownerManagementActions';

export interface OwnerRecord {
  id: string;
  name: string;
  phone_number: string;
  notes?: string | null;
  villas: {
    id: string;
    title: string;
    slug: string;
  }[];
}

export interface VillaOption {
  id: string;
  title: string;
}

export default function OwnersClientManager({
  initialOwners,
  availableVillas,
}: {
  initialOwners: OwnerRecord[];
  availableVillas: VillaOption[];
}) {
  const [owners, setOwners] = useState<OwnerRecord[]>(initialOwners);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedVillaId, setAssignedVillaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone_number', phone);
    formData.append('notes', notes);
    formData.append('assigned_villa_id', assignedVillaId);

    const res = await createVillaOwnerAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Pemilik vila baru berhasil didaftarkan!');
      setName('');
      setPhone('');
      setNotes('');
      setAssignedVillaId('');
      setTimeout(() => {
        setIsAddModalOpen(false);
        window.location.reload();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Gagal mendaftarkan pemilik vila.');
    }
  };

  const handleDeleteOwner = async (ownerId: string, ownerName: string) => {
    if (confirm(`Yakin ingin menghapus data pemilik ${ownerName}?`)) {
      const res = await deleteVillaOwnerAction(ownerId);
      if (res.success) {
        window.location.reload();
      }
    }
  };

  const handleOpenWABroadcast = async (ownerName: string, phoneNumber: string, villaTitles: string[]) => {
    const url = await generateOwnerWABroadcastUrl(ownerName, phoneNumber, villaTitles);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Direktori Pemilik Vila ({owners.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar pemilik vila terdaftar yang memiliki akses ke Portal Pemilik (`/owner`).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tambah Pemilik Vila Baru</span>
        </button>
      </div>

      {/* Owners Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Nama Pemilik</th>
                <th className="p-4">No. WhatsApp (Login Credential)</th>
                <th className="p-4">Vila Yang Dimiliki</th>
                <th className="p-4">Broadcast WA Reminder</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada data pemilik vila terdaftar. Klik "+ Tambah Pemilik Vila Baru".
                  </td>
                </tr>
              ) : (
                owners.map((owner) => {
                  const villaTitles = owner.villas.map((v) => v.title);

                  return (
                    <tr key={owner.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                        {owner.name}
                        {owner.notes && (
                          <span className="block text-[11px] text-slate-400 font-normal">{owner.notes}</span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-amber-400">
                        {owner.phone_number}
                      </td>

                      <td className="p-4">
                        {owner.villas.length === 0 ? (
                          <span className="text-rose-500 font-semibold italic text-[11px]">Belum Dialokasikan</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {owner.villas.map((v) => (
                              <span
                                key={v.id}
                                className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 text-[10px]"
                              >
                                {v.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleOpenWABroadcast(owner.name, owner.phone_number, villaTitles)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                          <span>1-Klik WA Broadcast</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteOwner(owner.id, owner.name)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                          title="Hapus Pemilik"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Owner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Tambah Pemilik Vila Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateOwner} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pemilik:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Hendra Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Pemilik (Credential Login):
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081298765432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Nomor ini akan dipakai pemilik untuk login di `/owner/login`.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alokasikan Vila Yang Dimiliki:
                </label>
                <select
                  value={assignedVillaId}
                  onChange={(e) => setAssignedVillaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="">-- Pilih Vila (Opsional) --</option>
                  {availableVillas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan:</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemilik utama unit High Pines Cisarua."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Simpan Data Pemilik'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
