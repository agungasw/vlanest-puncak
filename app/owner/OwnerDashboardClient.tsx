'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, setMonth, setYear } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Building,
  Calendar as CalendarIcon,
  Lock,
  Unlock,
  LogOut,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Sparkles,
  PhoneCall,
  X,
  FileText,
  Search,
} from 'lucide-react';
import { toggleOwnerBlockedDateAction, logoutOwnerAction } from '@/lib/ownerAuthActions';
import { formatRupiah } from '@/lib/pricing';

export interface OwnerVillaData {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  base_price_weekday: number;
  base_price_weekend: number;
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
    grand_total: number;
    payment_status: string;
  }[];
}

export default function OwnerDashboardClient({
  ownerName,
  phone,
  villas,
}: {
  ownerName: string;
  phone: string;
  villas: OwnerVillaData[];
}) {
  const [selectedVillaId, setSelectedVillaId] = useState<string>(villas[0]?.id || '');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [jumpDateInput, setJumpDateInput] = useState<string>('');

  // Modals for Month & Year Pop-up Picker
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  // Reason Modal State
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('Acara Pribadi Pemilik');
  const [customReasonText, setCustomReasonText] = useState<string>('');

  const [notification, setNotification] = useState<{
    message: string;
    waUrl?: string;
  } | null>(null);

  const selectedVilla = villas.find((v) => v.id === selectedVillaId) || villas[0];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthsList = [
    { value: 0, label: 'Januari' },
    { value: 1, label: 'Februari' },
    { value: 2, label: 'Maret' },
    { value: 3, label: 'April' },
    { value: 4, label: 'Mei' },
    { value: 5, label: 'Juni' },
    { value: 6, label: 'Juli' },
    { value: 7, label: 'Agustus' },
    { value: 8, label: 'September' },
    { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' },
    { value: 11, label: 'Desember' },
  ];

  const yearsList = [2025, 2026, 2027, 2028, 2029, 2030];

  const handleSelectMonth = (mIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, mIndex));
    setIsMonthModalOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
    setIsYearModalOpen(false);
  };

  const handleJumpDate = (isoDateStr: string) => {
    if (!isoDateStr) return;
    setJumpDateInput(isoDateStr);
    const target = new Date(isoDateStr);
    if (!isNaN(target.getTime())) {
      setCurrentMonth(target);

      // Check if date is guest booked or blocked
      target.setHours(0, 0, 0, 0);
      const guestBooking = selectedVilla?.bookings.find((booking) => {
        const checkIn = new Date(booking.check_in_date);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(booking.check_out_date);
        checkOut.setHours(0, 0, 0, 0);

        return target >= checkIn && target < checkOut;
      });

      const blockedRecord = selectedVilla?.blocked_dates.find((b) =>
        isSameDay(new Date(b.blocked_date), target)
      );

      handleDateClick(target, Boolean(guestBooking), Boolean(blockedRecord));
    }
  };

  const handleDateClick = (day: Date, isGuestBooked: boolean, isOwnerBlocked: boolean) => {
    setErrorMessage('');
    if (isGuestBooked) {
      setErrorMessage('Tanggal ini sudah dipesan oleh Tamu Umum (Tersewa). Tidak dapat ditimpa atau diubah!');
      return;
    }

    if (isOwnerBlocked) {
      // Unblock directly
      executeToggleDate(day, '');
    } else {
      // Open Reason Modal
      setPendingDate(day);
    }
  };

  const executeToggleDate = async (day: Date, customReason: string) => {
    if (!selectedVilla) return;

    setIsUpdating(true);
    setNotification(null);
    setErrorMessage('');

    const isoStr = format(day, 'yyyy-MM-dd');
    const finalReason = customReason || reasonInput === 'Lainnya' ? customReasonText : reasonInput;

    const res = await toggleOwnerBlockedDateAction(selectedVilla.id, isoStr, finalReason);

    setIsUpdating(false);
    setPendingDate(null);

    if (res.success) {
      const dayFormatted = format(day, 'dd MMMM yyyy', { locale: id });
      if (res.action === 'BLOCKED') {
        const waMsg = `Halo Admin VlaNest,%0A%0ASaya *${ownerName}* baru saja menandai tanggal terisi untuk *${selectedVilla.title}* pada tanggal *${dayFormatted}* dengan keterangan: "${finalReason}".%0A%0AMohon dipastikan tanggal tersebut sudah tertutup di sistem ya. Terima kasih!`;
        const waUrl = `https://wa.me/6281298765432?text=${waMsg}`;

        setNotification({
          message: `Tanggal ${dayFormatted} berhasil ditandai TERISI (${finalReason})!`,
          waUrl,
        });
      } else {
        setNotification({
          message: `Tanggal ${dayFormatted} berhasil dibuka kembali (KOSONG)!`,
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Gagal memproses perubahan tanggal.');
    }
  };

  const handleLogout = async () => {
    await logoutOwnerAction();
    window.location.href = '/owner/login';
  };

  // Performance calculations
  const totalBookingsCount = selectedVilla?.bookings.length || 0;
  const totalRevenue = selectedVilla?.bookings.reduce((acc, b) => acc + b.grand_total, 0) || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30 inline-block">
              Portal Resmi Pemilik Vila
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Selamat Datang, Bpk/Ibu {ownerName}</h1>
            <p className="text-emerald-200 text-xs font-mono">{phone}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4 text-amber-300" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      {/* Villa Selector if multiple */}
      {villas.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {villas.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVillaId(v.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                selectedVillaId === v.id
                  ? 'bg-emerald-700 text-white border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>

          {notification.waUrl && (
            <a
              href={notification.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Kirim Notifikasi WA ke Admin</span>
            </a>
          )}
        </div>
      )}

      {/* Main Synchronized Calendar with Guest Lock & Interactive Month/Year Pop-ups */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        {/* Header & Direct Date Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 tracking-wider">
              Sinkronisasi Kalender Ketersediaan
            </span>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {selectedVilla?.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Klik nama Bulan atau Tahun untuk membuka pilihan pop-up interaktif tanpa ketik manual.
            </p>
          </div>

          {/* Touch-Friendly Date Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-emerald-300/60 dark:border-slate-800 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Pilih Tanggal:</span>
            <input
              type="date"
              value={jumpDateInput}
              onChange={(e) => handleJumpDate(e.target.value)}
              className="bg-transparent text-emerald-800 dark:text-amber-400 font-extrabold text-xs focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Interactive Month & Year Pop-up Triggers Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-sm"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pop-up Trigger Button for Month */}
            <button
              onClick={() => setIsMonthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:border-emerald-600 dark:hover:border-amber-400 transition-colors"
              title="Klik untuk memilih Bulan"
            >
              <span>{format(currentMonth, 'MMMM', { locale: id })}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
            </button>

            {/* Pop-up Trigger Button for Year */}
            <button
              onClick={() => setIsYearModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:border-emerald-600 dark:hover:border-amber-400 transition-colors"
              title="Klik untuk memilih Tahun"
            >
              <span>{format(currentMonth, 'yyyy')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
            </button>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-sm"
              title="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-serif text-sm font-bold text-emerald-700 dark:text-amber-400 px-4 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </span>
        </div>

        {/* Synchronized Legend Indicator */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600" />
            <span className="text-slate-600 dark:text-slate-400">Tersedia (Kosong)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-600 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-slate-600 dark:text-slate-400">Tersewa Tamu (Dikunci)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600" />
            <span className="text-slate-600 dark:text-slate-400">Terisi Pemilik / Maintenance</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
            <div key={d} className="font-bold text-slate-400 uppercase text-[10px] py-1">
              {d}
            </div>
          ))}

          {daysInMonth.map((day) => {
            day.setHours(0, 0, 0, 0);

            // 1. Check Guest Booking (LOCKED)
            const guestBooking = selectedVilla?.bookings.find((booking) => {
              const checkIn = new Date(booking.check_in_date);
              checkIn.setHours(0, 0, 0, 0);
              const checkOut = new Date(booking.check_out_date);
              checkOut.setHours(0, 0, 0, 0);

              return day >= checkIn && day < checkOut;
            });

            // 2. Check Owner/Admin Blocked Date
            const blockedRecord = selectedVilla?.blocked_dates.find((b) =>
              isSameDay(new Date(b.blocked_date), day)
            );

            const isGuestBooked = Boolean(guestBooking);
            const isOwnerBlocked = Boolean(blockedRecord);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day, isGuestBooked, isOwnerBlocked)}
                disabled={isUpdating || isGuestBooked}
                className={`h-16 sm:h-20 rounded-2xl border p-1.5 flex flex-col justify-between items-center transition-all ${
                  isGuestBooked
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-800 dark:text-amber-300 font-bold cursor-not-allowed opacity-90'
                    : isOwnerBlocked
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300 font-bold cursor-pointer hover:scale-105'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold cursor-pointer hover:scale-105'
                }`}
                title={
                  isGuestBooked
                    ? `Tersewa Tamu (${guestBooking?.guest_name}) - Tidak dapat ditimpa`
                    : blockedRecord?.reason || 'Klik untuk ubah status'
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">{format(day, 'd')}</span>
                  {isGuestBooked && <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </div>

                {isGuestBooked ? (
                  <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 uppercase leading-tight line-clamp-2">
                    TERSEWA TAMU
                  </span>
                ) : isOwnerBlocked ? (
                  <div className="text-center">
                    <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 uppercase block">
                      TERISI
                    </span>
                    <span className="text-[8px] font-normal text-slate-500 dark:text-slate-400 line-clamp-1 block">
                      {blockedRecord?.reason || 'Pemilik'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">KOSONG</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* POP-UP MODAL GRID 12 BULAN */}
      {isMonthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Pilih Bulan
              </h3>
              <button
                onClick={() => setIsMonthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 py-2">
              {monthsList.map((m) => {
                const isSelected = currentMonth.getMonth() === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => handleSelectMonth(m.value)}
                    className={`py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-md border border-amber-400 font-extrabold scale-105'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL GRID TAHUN */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Pilih Tahun
              </h3>
              <button
                onClick={() => setIsYearModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              {yearsList.map((y) => {
                const isSelected = currentMonth.getFullYear() === y;
                return (
                  <button
                    key={y}
                    onClick={() => handleSelectYear(y)}
                    className={`py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-md border border-amber-400 font-extrabold scale-105'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Tahun {y}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal when Owner blocks date */}
      {pendingDate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Keterangan Blokir Tanggal
              </h3>
              <button
                onClick={() => setPendingDate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Anda menandai tanggal{' '}
                <span className="font-bold text-emerald-700 dark:text-amber-400 font-mono">
                  {format(pendingDate, 'dd MMMM yyyy', { locale: id })}
                </span>{' '}
                sebagai TERISI untuk <span className="font-bold text-slate-900 dark:text-white">{selectedVilla?.title}</span>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Keterangan / Alasan:
                </label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Acara Pribadi Pemilik">Acara Pribadi Pemilik / Keluarga</option>
                  <option value="Booking Direct WA Owner">Booking Direct WA Pemilik</option>
                  <option value="Perawatan & Maintenance Vila">Perawatan & Maintenance Vila</option>
                  <option value="Lainnya">Lainnya (Tulis Sendiri)</option>
                </select>
              </div>

              {reasonInput === 'Lainnya' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tulis Keterangan Kustom:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Reuni Alumni SMA Hendra"
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => executeToggleDate(pendingDate, '')}
                  disabled={isUpdating}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {isUpdating ? 'Menyimpan...' : 'Konfirmasi Blokir Tanggal'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDate(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Financial / Rental Summary */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              Laporan Ringkasan Keterisian Vila (Transparan)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparansi performa penyewaan vila Anda melalui Manajemen VlaNest Puncak.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Transaksi Sewa:</span>
            <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{totalBookingsCount} Pemesanan</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Perkiraan Gross Nilai Sewa:</span>
            <p className="font-serif text-2xl font-bold text-emerald-700 dark:text-amber-400 font-sans">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Recent Guest Bookings Table */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Riwayat Pemesanan Tamu Terbaru:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Pemesan</th>
                  <th className="p-3">Check-in / Out</th>
                  <th className="p-3">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedVilla?.bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-amber-400">{b.booking_code}</td>
                    <td className="p-3 font-semibold">{b.guest_name}</td>
                    <td className="p-3 text-[11px]">
                      {format(new Date(b.check_in_date), 'dd MMM')} - {format(new Date(b.check_out_date), 'dd MMM yyyy')}
                    </td>
                    <td className="p-3 font-bold font-sans">{formatRupiah(b.grand_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
