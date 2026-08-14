'use client';

import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatRupiah } from '@/lib/pricing';
import { toggleDepositRefundAction } from '@/lib/actions';
import { addMaintenanceLogAction, updateMaintenanceStatusAction } from '@/lib/revenueSharingActions';
import {
  Calendar,
  CheckSquare,
  Square,
  Wrench,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export interface HousekeepingBookingRecord {
  id: string;
  booking_code: string;
  guest_name: string;
  whatsapp_number: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  security_deposit_amount: number;
  payment_status: string;
  deposit_refunded: boolean;
  villa: {
    title: string;
    location_area: string;
  };
}

export interface MaintenanceRecord {
  id: string;
  villa_id: string;
  item_name: string;
  description?: string | null;
  estimated_cost: number;
  status: string;
  created_at: Date | string;
  villa: {
    title: string;
  };
}

export default function HousekeepingClient({
  bookings,
  villasList = [],
  maintenanceLogs = [],
}: {
  bookings: HousekeepingBookingRecord[];
  villasList?: { id: string; title: string }[];
  maintenanceLogs?: MaintenanceRecord[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkInsOnDate = bookings.filter((b) =>
    isSameDay(new Date(b.check_in_date), selectedDate)
  );

  const checkOutsOnDate = bookings.filter((b) =>
    isSameDay(new Date(b.check_out_date), selectedDate)
  );

  const handleDepositToggle = async (bookingId: string, currentRefunded: boolean) => {
    await toggleDepositRefundAction(bookingId, !currentRefunded);
  };

  const handleAddMaintenance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await addMaintenanceLogAction(formData);

    setIsSubmitting(false);
    if (res.success) {
      setIsMaintenanceModalOpen(false);
      window.location.reload();
    }
  };

  const handleUpdateStatus = async (logId: string, status: string) => {
    await updateMaintenanceStatusAction(logId, status);
    window.location.reload();
  };

  return (
    <div className="space-y-8 select-none">
      {/* Date Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400">Pilih Tanggal Jadwal</span>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
          {villasList.length > 0 && (
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Log Damage / Perbaikan</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Check-in & Check-out Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check-ins Today */}
        <div className="bg-white dark:bg-[#0f172a] border border-emerald-600/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jadwal Check-in ({checkInsOnDate.length})
            </h3>
            <span className="text-xs text-slate-400">Jam Standar: 14:00 WIB</span>
          </div>

          {checkInsOnDate.length > 0 ? (
            <div className="space-y-4">
              {checkInsOnDate.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{b.villa.title}</span>
                    <span className="font-mono text-emerald-700 dark:text-amber-400 font-bold">{b.booking_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Tamu: {b.guest_name}</span>
                    <span>WA: {b.whatsapp_number}</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px]">
                    Status: {b.payment_status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">Tidak ada kedatangan tamu di tanggal ini.</p>
          )}
        </div>

        {/* Check-outs Today */}
        <div className="bg-white dark:bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-serif text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jadwal Check-out ({checkOutsOnDate.length})
            </h3>
            <span className="text-xs text-slate-400">Maksimal: 12:00 WIB</span>
          </div>

          {checkOutsOnDate.length > 0 ? (
            <div className="space-y-4">
              {checkOutsOnDate.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{b.villa.title}</span>
                    <span className="font-mono text-emerald-700 dark:text-amber-400 font-bold">{b.booking_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Tamu: {b.guest_name}</span>
                    <span>Deposit: {formatRupiah(b.security_deposit_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">Tidak ada kepulangan tamu di tanggal ini.</p>
          )}
        </div>
      </div>

      {/* Villa Maintenance & Damage Logs Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              Log Kerusakan & Biaya Maintenance Vila
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Catatan biaya perbaikan yang akan dipotongkan secara transparan pada Slip Bagi Hasil Pemilik Vila.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Unit Vila</th>
                <th className="p-3">Item Perbaikan / Damage</th>
                <th className="p-3">Biaya Perkiraan</th>
                <th className="p-3">Status Pengerjaan</th>
                <th className="p-3 text-right">Aksi Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {maintenanceLogs.length > 0 ? (
                maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{log.villa.title}</td>
                    <td className="p-3">
                      <span className="font-bold block text-slate-900 dark:text-white">{log.item_name}</span>
                      {log.description && <span className="text-slate-400 text-[11px] block">{log.description}</span>}
                    </td>
                    <td className="p-3 font-sans font-bold text-rose-600 dark:text-rose-400">
                      {formatRupiah(log.estimated_cost)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          log.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                            : log.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300'
                        }`}
                      >
                        {log.status === 'COMPLETED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </>
                        ) : log.status === 'IN_PROGRESS' ? (
                          <>
                            <Clock className="w-3 h-3" /> Pengerjaan
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" /> Butuh Perbaikan
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={log.status}
                        onChange={(e) => handleUpdateStatus(log.id, e.target.value)}
                        className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        <option value="NEED_ATTENTION">Butuh Perbaikan</option>
                        <option value="IN_PROGRESS">Pengerjaan</option>
                        <option value="COMPLETED">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                    Belum ada laporan perbaikan vila yang dicatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Deposit Refund Log Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Log Pengembalian Security Deposit</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Tandai lis centang setelah vila selesai diinspeksi oleh penjaga lapangan dan deposit telah ditransfer kembali ke rekening tamu.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Kode / Tamu</th>
                <th className="p-3">Vila</th>
                <th className="p-3">Check-out</th>
                <th className="p-3">Nominal Deposit</th>
                <th className="p-3">Status Pengembalian</th>
                <th className="p-3 text-right">Aksi Konfirmasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-bold text-emerald-700 dark:text-amber-400 block">{b.booking_code}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{b.guest_name}</span>
                  </td>
                  <td className="p-3 text-slate-900 dark:text-white font-medium">{b.villa.title}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">
                    {format(new Date(b.check_out_date), 'dd MMM yyyy')}
                  </td>
                  <td className="p-3 font-bold text-amber-600 dark:text-amber-400 font-sans">
                    {formatRupiah(b.security_deposit_amount)}
                  </td>
                  <td className="p-3">
                    {b.deposit_refunded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Dikembalikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 text-[10px] font-bold">
                        Belum Transfer
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDepositToggle(b.id, b.deposit_refunded)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 justify-end ml-auto ${
                        b.deposit_refunded
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                      }`}
                    >
                      {b.deposit_refunded ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Batalkan Centang
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 text-amber-300" /> Tandai Lunas Refund
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Tambah Laporan Perbaikan / Maintenance
              </h3>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih Unit Vila:</label>
                <select
                  name="villa_id"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                >
                  {villasList.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Item Perbaikan / Damage:</label>
                <input
                  type="text"
                  name="item_name"
                  required
                  placeholder="Contoh: AC R. Utama Bocor Air / Kolam Kurang Kaporit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Estimasi Biaya Perbaikan (Rp):</label>
                <input
                  type="number"
                  name="estimated_cost"
                  required
                  defaultValue={150000}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan Tambahan:</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Contoh: Dipanggilkan teknisi AC Pak Agus Cisarua"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Maintenance'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
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
