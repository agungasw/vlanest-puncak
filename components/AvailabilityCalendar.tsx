'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import { id } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  calculateBookingPrice,
  formatRupiah,
  VillaPricingInput,
} from '@/lib/pricing';

export interface AvailabilityCalendarProps {
  villaSlug: string;
  villaPricing: VillaPricingInput;
}

export default function AvailabilityCalendar({
  villaSlug,
  villaPricing,
}: AvailabilityCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const today = startOfDay(new Date());

  const priceResult = calculateBookingPrice(villaPricing, checkIn, checkOut);

  const handleDateClick = (day: Date) => {
    const clicked = startOfDay(day);

    if (isBefore(clicked, today)) return; // disable past dates

    // If no check-in set, set check-in
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
      return;
    }

    // If click before existing check-in, reset check-in
    if (isBefore(clicked, checkIn)) {
      setCheckIn(clicked);
      setCheckOut(null);
      return;
    }

    // If same date, ignore
    if (isSameDay(clicked, checkIn)) {
      return;
    }

    // Otherwise set checkOut
    setCheckOut(clicked);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Build Calendar Matrix
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleProceedToCheckout = () => {
    if (!checkIn || !checkOut || !priceResult.isValid) return;
    const checkInStr = format(checkIn, 'yyyy-MM-dd');
    const checkOutStr = format(checkOut, 'yyyy-MM-dd');
    router.push(`/checkout/${villaSlug}?checkIn=${checkInStr}&checkOut=${checkOutStr}`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span>Kalender Ketersediaan Real-Time</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mt-1">
            Pilih Tanggal Menginap
          </h3>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg text-white w-40 text-center font-serif">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day Name Labels */}
        <div className="grid grid-cols-7 text-center font-semibold text-xs text-slate-400 uppercase tracking-wider py-2">
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span className="text-amber-400 font-bold">Sab</span>
          <span className="text-amber-400 font-bold">Min</span>
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((dateItem, idx) => {
            const dateNormalized = startOfDay(dateItem);
            const isCurrentMonth = isSameMonth(dateItem, currentMonth);
            const isPast = isBefore(dateNormalized, today);

            // Check if date is blocked manually
            const isBlocked = villaPricing.blocked_dates?.some((b) =>
              isSameDay(new Date(b.blocked_date), dateNormalized)
            );

            // Check if date is already booked
            const isBooked = villaPricing.bookings?.some((bk) => {
              if (bk.payment_status === 'CANCELLED') return false;
              const bkStart = startOfDay(new Date(bk.check_in_date));
              const bkEnd = startOfDay(new Date(bk.check_out_date));
              return (
                (isSameDay(dateNormalized, bkStart) || isAfter(dateNormalized, bkStart)) &&
                isBefore(dateNormalized, bkEnd)
              );
            });

            // Special Rate Check
            const specialRate = villaPricing.special_rates?.find((sr) => {
              const srStart = startOfDay(new Date(sr.start_date));
              const srEnd = startOfDay(new Date(sr.end_date));
              return (
                (isSameDay(dateNormalized, srStart) || isAfter(dateNormalized, srStart)) &&
                (isSameDay(dateNormalized, srEnd) || isBefore(dateNormalized, srEnd))
              );
            });

            const isSelectedCheckIn = checkIn && isSameDay(dateNormalized, checkIn);
            const isSelectedCheckOut = checkOut && isSameDay(dateNormalized, checkOut);
            const isInRange =
              checkIn &&
              checkOut &&
              isAfter(dateNormalized, checkIn) &&
              isBefore(dateNormalized, checkOut);

            const isUnavailable = isPast || isBlocked || isBooked;

            let cellBg = 'bg-slate-800/60 hover:bg-slate-700 text-slate-200 border-slate-700/60';
            if (!isCurrentMonth) cellBg = 'bg-slate-950/40 text-slate-600 border-slate-900';
            if (isUnavailable) cellBg = 'bg-rose-950/40 text-rose-400 border-rose-900/40 cursor-not-allowed opacity-60';
            if (isInRange) cellBg = 'bg-emerald-950/80 text-emerald-200 border-emerald-700/60';
            if (isSelectedCheckIn || isSelectedCheckOut)
              cellBg = 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold border-amber-400 ring-2 ring-amber-400/50 shadow-lg';

            return (
              <button
                key={idx}
                disabled={isUnavailable}
                onClick={() => handleDateClick(dateItem)}
                className={`relative min-h-[64px] p-2 rounded-xl border flex flex-col justify-between transition-all duration-200 text-left ${cellBg}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-semibold ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                    {format(dateItem, 'd')}
                  </span>
                  {specialRate && !isUnavailable && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" title={specialRate.event_name} />
                  )}
                </div>

                {/* Subtext info */}
                <div className="mt-1">
                  {isBlocked && (
                    <span className="text-[9px] text-rose-300 block font-medium line-clamp-1">Offline</span>
                  )}
                  {isBooked && (
                    <span className="text-[9px] text-rose-300 block font-medium line-clamp-1">Terisi</span>
                  )}
                  {!isUnavailable && specialRate && (
                    <span className="text-[9px] text-amber-300 block font-bold truncate">
                      {specialRate.event_name}
                    </span>
                  )}
                  {isSelectedCheckIn && (
                    <span className="text-[9px] text-amber-300 uppercase font-bold block">Check-in</span>
                  )}
                  {isSelectedCheckOut && (
                    <span className="text-[9px] text-amber-300 uppercase font-bold block">Check-out</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Guidance */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-600 border border-amber-400" />
          <span>Tanggal Dipilih</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-700" />
          <span>Rentang Menginap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-950 border border-rose-900" />
          <span>Tidak Tersedia / Terisi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-400" />
          <span>Event / Peak Season Rate</span>
        </div>
      </div>

      {/* Dynamic Price Calculation Summary */}
      {checkIn && checkOut && (
        <div className="bg-slate-950 border border-emerald-700/50 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
                Ringkasan Pemesanan Anda
              </span>
              <h4 className="font-serif text-xl font-bold text-white mt-0.5">
                {format(checkIn, 'dd MMM yyyy', { locale: id })} -{' '}
                {format(checkOut, 'dd MMM yyyy', { locale: id })} ({priceResult.totalNights} Malam)
              </h4>
            </div>
            {priceResult.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Tanggal Tersedia
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Perlu Penyesuaian
              </span>
            )}
          </div>

          {/* Validation Warning message */}
          {!priceResult.isValid && priceResult.errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{priceResult.errorMessage}</p>
                <p className="mt-1 text-slate-300">
                  Silakan sesuaikan tanggal check-in / check-out Anda untuk melanjutkan pemesanan.
                </p>
              </div>
            </div>
          )}

          {/* Nightly Details Breakdown Table */}
          {priceResult.nightlyDetails.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rincian Tarik Harga Per Malam:
              </h5>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden text-xs">
                {priceResult.nightlyDetails.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {format(item.date, 'EEEE, dd MMM yyyy', { locale: id })}
                      </span>
                      {item.dayType === 'EVENT' && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                          {item.eventName || 'Event Rate'}
                        </span>
                      )}
                      {item.dayType === 'WEEKEND' && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px]">
                          Weekend Rate
                        </span>
                      )}
                      {item.dayType === 'WEEKDAY' && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                          Weekday Base
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-amber-400 font-sans">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Totals */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Total Harga Menginap ({priceResult.totalNights} Malam):</span>
              <span className="font-semibold text-white">{formatRupiah(priceResult.totalBasePrice)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                Deposit Jaminan (Security Deposit)
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  Dikembalikan saat Check-out
                </span>
              </span>
              <span className="font-semibold text-white">{formatRupiah(priceResult.securityDeposit)}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
              <span className="font-bold text-white text-base">Grand Total:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400 font-sans block">
                  {formatRupiah(priceResult.grandTotal)}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Opsi DP 30%: {formatRupiah(priceResult.dp30Amount)} | DP 50%: {formatRupiah(priceResult.dp50Amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              disabled={!priceResult.isValid}
              onClick={handleProceedToCheckout}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl ${
                priceResult.isValid
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-emerald-950/60 border border-emerald-400/40 hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Lanjut ke Formulir Pemesanan & Pembayaran</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
