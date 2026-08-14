import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';

export interface VillaSpecialRateItem {
  id?: string;
  event_name: string;
  start_date: Date | string;
  end_date: Date | string;
  custom_price_per_night: number;
  min_stay_override?: number | null;
}

export interface CalendarBlockedDateItem {
  id?: string;
  blocked_date: Date | string;
  reason?: string | null;
}

export interface ExistingBookingItem {
  id?: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  payment_status: string;
}

export interface VillaPricingInput {
  base_price_weekday: number;
  base_price_weekend: number;
  security_deposit: number;
  min_stay_default: number;
  special_rates?: VillaSpecialRateItem[];
  blocked_dates?: CalendarBlockedDateItem[];
  bookings?: ExistingBookingItem[];
}

export interface NightCalculationDetail {
  date: Date;
  dateStr: string;
  dayType: 'WEEKDAY' | 'WEEKEND' | 'EVENT';
  price: number;
  eventName?: string;
}

export interface PriceCalculationResult {
  isValid: boolean;
  errorMessage?: string;
  totalNights: number;
  totalBasePrice: number;
  securityDeposit: number;
  grandTotal: number;
  dp30Amount: number;
  dp50Amount: number;
  fullAmount: number;
  nightlyDetails: NightCalculationDetail[];
  appliedMinStay: number;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBookingPrice(
  villa: VillaPricingInput,
  checkIn: Date | null,
  checkOut: Date | null
): PriceCalculationResult {
  if (!checkIn || !checkOut) {
    return {
      isValid: false,
      errorMessage: 'Pilih tanggal Check-in dan Check-out terlebih dahulu.',
      totalNights: 0,
      totalBasePrice: 0,
      securityDeposit: villa.security_deposit || 0,
      grandTotal: villa.security_deposit || 0,
      dp30Amount: 0,
      dp50Amount: 0,
      fullAmount: 0,
      nightlyDetails: [],
      appliedMinStay: villa.min_stay_default || 1,
    };
  }

  const start = startOfDay(new Date(checkIn));
  const end = startOfDay(new Date(checkOut));

  if (!isAfter(end, start)) {
    return {
      isValid: false,
      errorMessage: 'Tanggal Check-out harus setelah tanggal Check-in.',
      totalNights: 0,
      totalBasePrice: 0,
      securityDeposit: villa.security_deposit || 0,
      grandTotal: villa.security_deposit || 0,
      dp30Amount: 0,
      dp50Amount: 0,
      fullAmount: 0,
      nightlyDetails: [],
      appliedMinStay: villa.min_stay_default || 1,
    };
  }

  const totalNights = differenceInCalendarDays(end, start);
  const nightlyDetails: NightCalculationDetail[] = [];
  let totalBasePrice = 0;
  let maxMinStayRequired = villa.min_stay_default || 1;

  let current = new Date(start);
  while (isBefore(current, end)) {
    const currentDate = new Date(current);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // 1. Check if date is blocked manually
    const isBlocked = villa.blocked_dates?.some((b) =>
      isSameDay(new Date(b.blocked_date), currentDate)
    );
    if (isBlocked) {
      return {
        isValid: false,
        errorMessage: `Tanggal ${format(currentDate, 'dd MMM yyyy')} tidak tersedia (Telah diblokir/maintenance).`,
        totalNights: 0,
        totalBasePrice: 0,
        securityDeposit: villa.security_deposit || 0,
        grandTotal: 0,
        dp30Amount: 0,
        dp50Amount: 0,
        fullAmount: 0,
        nightlyDetails: [],
        appliedMinStay: maxMinStayRequired,
      };
    }

    // 2. Check if date collides with an existing active booking
    const isBooked = villa.bookings?.some((bk) => {
      if (bk.payment_status === 'CANCELLED') return false;
      const bkStart = startOfDay(new Date(bk.check_in_date));
      const bkEnd = startOfDay(new Date(bk.check_out_date));
      return (
        (isSameDay(currentDate, bkStart) || isAfter(currentDate, bkStart)) &&
        isBefore(currentDate, bkEnd)
      );
    });

    if (isBooked) {
      return {
        isValid: false,
        errorMessage: `Tanggal ${format(currentDate, 'dd MMM yyyy')} sudah terisi oleh pemesan lain.`,
        totalNights: 0,
        totalBasePrice: 0,
        securityDeposit: villa.security_deposit || 0,
        grandTotal: 0,
        dp30Amount: 0,
        dp50Amount: 0,
        fullAmount: 0,
        nightlyDetails: [],
        appliedMinStay: maxMinStayRequired,
      };
    }

    // 3. Check for Special Event Rate override
    const specialRate = villa.special_rates?.find((sr) => {
      const srStart = startOfDay(new Date(sr.start_date));
      const srEnd = startOfDay(new Date(sr.end_date));
      return (
        (isSameDay(currentDate, srStart) || isAfter(currentDate, srStart)) &&
        (isSameDay(currentDate, srEnd) || isBefore(currentDate, srEnd))
      );
    });

    let nightPrice = 0;
    let dayType: 'WEEKDAY' | 'WEEKEND' | 'EVENT' = 'WEEKDAY';
    let eventName: string | undefined;

    if (specialRate) {
      dayType = 'EVENT';
      nightPrice = specialRate.custom_price_per_night;
      eventName = specialRate.event_name;
      if (specialRate.min_stay_override && specialRate.min_stay_override > maxMinStayRequired) {
        maxMinStayRequired = specialRate.min_stay_override;
      }
    } else {
      // Friday (5) & Saturday (6) nights are weekend rates in Puncak resort area
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        dayType = 'WEEKEND';
        nightPrice = villa.base_price_weekend;
      } else {
        dayType = 'WEEKDAY';
        nightPrice = villa.base_price_weekday;
      }
    }

    totalBasePrice += nightPrice;
    nightlyDetails.push({
      date: currentDate,
      dateStr,
      dayType,
      price: nightPrice,
      eventName,
    });

    current = addDays(current, 1);
  }

  // 4. Validate Minimum Stay constraint
  if (totalNights < maxMinStayRequired) {
    return {
      isValid: false,
      errorMessage: `Minimum menginap untuk periode ini adalah ${maxMinStayRequired} malam (Anda memilih ${totalNights} malam).`,
      totalNights,
      totalBasePrice,
      securityDeposit: villa.security_deposit || 0,
      grandTotal: totalBasePrice + (villa.security_deposit || 0),
      dp30Amount: Math.round((totalBasePrice + (villa.security_deposit || 0)) * 0.3),
      dp50Amount: Math.round((totalBasePrice + (villa.security_deposit || 0)) * 0.5),
      fullAmount: totalBasePrice + (villa.security_deposit || 0),
      nightlyDetails,
      appliedMinStay: maxMinStayRequired,
    };
  }

  const securityDeposit = villa.security_deposit || 0;
  const grandTotal = totalBasePrice + securityDeposit;

  return {
    isValid: true,
    totalNights,
    totalBasePrice,
    securityDeposit,
    grandTotal,
    dp30Amount: Math.round(grandTotal * 0.3),
    dp50Amount: Math.round(grandTotal * 0.5),
    fullAmount: grandTotal,
    nightlyDetails,
    appliedMinStay: maxMinStayRequired,
  };
}
