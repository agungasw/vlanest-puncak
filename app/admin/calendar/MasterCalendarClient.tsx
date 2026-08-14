'use client';

import { useState } from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  startOfDay,
  isAfter,
  isBefore,
} from 'date-fns';
import { id } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  DollarSign,
  Calendar as CalendarIcon,
  X,
  CheckCircle,
  AlertTriangle,
  Tag,
  Trash2,
} from 'lucide-react';
import { formatRupiah } from '@/lib/pricing';
import {
  blockDateAction,
  unblockDateAction,
  setSpecialRateAction,
  deleteSpecialRateAction,
} from '@/lib/actions';

export interface AdminVillaData {
  id: string;
  title: string;
  slug: string;
  base_price_weekday: number;
  base_price_weekend: number;
  min_stay_default: number;
  special_rates: {
    id: string;
    event_name: string;
    start_date: Date | string;
    end_date: Date | string;
    custom_price_per_night: number;
    min_stay_override?: number | null;
  }[];
  blocked_dates: {
    id: string;
    blocked_date: Date | string;
    reason?: string | null;
  }[];
  bookings: {
    id: string;
    booking_code: string;
    guest_name: string;
    check_in_date: Date | string;
    check_out_date: Date | string;
    payment_status: string;
  }[];
}

export default function MasterCalendarClient({
  villas,
}: {
  villas: AdminVillaData[];
}) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedVillaId, setSelectedVillaId] = useState<string>(villas[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'BLOCK' | 'SPECIAL_RATE'>('BLOCK');

  // Form Inputs
  const [blockReason, setBlockReason] = useState('Booking Telepon / Offline');
  const [eventName, setEventName] = useState('High Season / Libur Nasional');
  const [customPrice, setCustomPrice] = useState('5000000');
  const [minStayOverride, setMinStayOverride] = useState('2');
  const [endDateStr, setEndDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVilla = villas.find((v) => v.id === selectedVillaId) || villas[0];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar Matrix
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleCellClick = (dateItem: Date) => {
    setSelectedDate(startOfDay(dateItem));
    setEndDateStr(format(dateItem, 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedVilla) return;
    setIsSubmitting(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await blockDateAction(selectedVilla.id, dateStr, blockReason);
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleSpecialRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedVilla) return;
    setIsSubmitting(true);
    const startDateStr = format(selectedDate, 'yyyy-MM-dd');
    await setSpecialRateAction(
      selectedVilla.id,
      eventName,
      startDateStr,
      endDateStr || startDateStr,
      parseInt(customPrice, 10),
      parseInt(minStayOverride, 10)
    );
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Villa Selector & Month Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            Pilih Vila:
          </label>
          <select
            value={selectedVillaId}
            onChange={(e) => setSelectedVillaId(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {villas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold text-xl text-white w-48 text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid View */}
      {selectedVilla && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Active Special Rates & Blocked Date Summary for Villa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4" /> Daftar Event / Price Override Aktif ({selectedVilla.special_rates.length})
              </span>
              {selectedVilla.special_rates.length > 0 ? (
                <div className="space-y-1.5 divide-y divide-slate-800/60">
                  {selectedVilla.special_rates.map((sr) => (
                    <div key={sr.id} className="pt-1.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{sr.event_name}</span>
                        <span className="text-slate-400">
                          {format(new Date(sr.start_date), 'dd MMM')} - {format(new Date(sr.end_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-400 font-sans">
                          {formatRupiah(sr.custom_price_per_night)}
                        </span>
                        <button
                          onClick={() => deleteSpecialRateAction(sr.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Belum ada harga khusus event yang diset.</p>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Daftar Tanggal Diblokir Manual ({selectedVilla.blocked_dates.length})
              </span>
              {selectedVilla.blocked_dates.length > 0 ? (
                <div className="space-y-1.5 divide-y divide-slate-800/60">
                  {selectedVilla.blocked_dates.map((bd) => (
                    <div key={bd.id} className="pt-1.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">
                          {format(new Date(bd.blocked_date), 'dd MMMM yyyy', { locale: id })}
                        </span>
                        <span className="text-slate-400">{bd.reason || 'Offline Booking'}</span>
                      </div>
                      <button
                        onClick={() => unblockDateAction(bd.id)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Belum ada tanggal yang diblokir.</p>
              )}
            </div>
          </div>

          {/* Grid Labels */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 uppercase tracking-wider py-2">
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span className="text-amber-400">Sabtu</span>
            <span className="text-amber-400">Minggu</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((dateItem, idx) => {
              const dateNormalized = startOfDay(dateItem);
              const isCurrentMonth = isSameMonth(dateItem, currentMonth);

              // Blocked Check
              const blockedObj = selectedVilla.blocked_dates.find((b) =>
                isSameDay(new Date(b.blocked_date), dateNormalized)
              );

              // Booked Check
              const bookingObj = selectedVilla.bookings.find((bk) => {
                if (bk.payment_status === 'CANCELLED') return false;
                const bkStart = startOfDay(new Date(bk.check_in_date));
                const bkEnd = startOfDay(new Date(bk.check_out_date));
                return (
                  (isSameDay(dateNormalized, bkStart) || isAfter(dateNormalized, bkStart)) &&
                  isBefore(dateNormalized, bkEnd)
                );
              });

              // Special Rate Check
              const specialRateObj = selectedVilla.special_rates.find((sr) => {
                const srStart = startOfDay(new Date(sr.start_date));
                const srEnd = startOfDay(new Date(sr.end_date));
                return (
                  (isSameDay(dateNormalized, srStart) || isAfter(dateNormalized, srStart)) &&
                  (isSameDay(dateNormalized, srEnd) || isBefore(dateNormalized, srEnd))
                );
              });

              let cellStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';
              if (!isCurrentMonth) cellStyle = 'bg-slate-950/40 text-slate-600 border-slate-900';
              if (blockedObj) cellStyle = 'bg-rose-950/60 border-rose-900 text-rose-300';
              if (bookingObj) cellStyle = 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
              if (specialRateObj && !blockedObj && !bookingObj)
                cellStyle = 'bg-amber-950/50 border-amber-800 text-amber-300';

              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(dateItem)}
                  className={`min-h-[85px] p-2.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all duration-150 ${cellStyle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{format(dateItem, 'd')}</span>
                    <Plus className="w-3 h-3 text-slate-500 hover:text-white" />
                  </div>

                  <div className="text-[10px] space-y-0.5">
                    {bookingObj && (
                      <span className="block font-bold text-emerald-400 line-clamp-1">
                        ✓ {bookingObj.guest_name}
                      </span>
                    )}
                    {blockedObj && (
                      <span className="block font-bold text-rose-400 line-clamp-1">
                        🔒 {blockedObj.reason || 'Blocked'}
                      </span>
                    )}
                    {specialRateObj && !blockedObj && !bookingObj && (
                      <span className="block font-bold text-amber-400 font-sans line-clamp-1">
                        ★ {formatRupiah(specialRateObj.custom_price_per_night)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Action Modal */}
      {isModalOpen && selectedDate && selectedVilla && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400">Atur Ketersediaan</span>
                <h3 className="font-serif text-xl font-bold text-white">
                  {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setModalMode('BLOCK')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  modalMode === 'BLOCK' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Blokir Tanggal
              </button>
              <button
                onClick={() => setModalMode('SPECIAL_RATE')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  modalMode === 'SPECIAL_RATE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Harga Event Special
              </button>
            </div>

            {/* Block Form */}
            {modalMode === 'BLOCK' && (
              <form onSubmit={handleBlockSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Alasan Pemblokiran Tanggal:
                  </label>
                  <input
                    type="text"
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Contoh: Pemesanan Offline Telepon"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Blokir Tanggal'}
                </button>
              </form>
            )}

            {/* Special Rate Form */}
            {modalMode === 'SPECIAL_RATE' && (
              <form onSubmit={handleSpecialRateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nama Event / Liburan:
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Contoh: Tahun Baru / High Season"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hingga Tanggal (End Date):
                  </label>
                  <input
                    type="date"
                    required
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Harga Per Malam (Rp):
                    </label>
                    <input
                      type="number"
                      required
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Min. Stay (Malam):
                    </label>
                    <input
                      type="number"
                      required
                      value={minStayOverride}
                      onChange={(e) => setMinStayOverride(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Harga Event'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
