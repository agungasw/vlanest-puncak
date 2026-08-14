'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  User,
  Phone,
  CreditCard,
  Building,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  UtensilsCrossed,
  Plus,
  Minus,
  MessageSquareText,
  Ticket,
  QrCode,
  Zap,
} from 'lucide-react';
import { formatRupiah, PriceCalculationResult } from '@/lib/pricing';
import { createBookingAction } from '@/lib/actions';
import { validatePromoCode } from '@/lib/settingsActions';
import { CATERING_PACKAGES } from '@/lib/catering';

export interface CheckoutFormProps {
  villa: {
    id: string;
    title: string;
    slug: string;
    location_area: string;
    security_deposit: number;
    max_guests: number;
  };
  checkInStr: string;
  checkOutStr: string;
  priceResult: PriceCalculationResult;
  resortSettings?: {
    bca_account_number: string;
    bca_account_holder: string;
    mandiri_number: string;
    mandiri_holder: string;
    cs_whatsapp: string;
  };
}

export default function CheckoutForm({
  villa,
  checkInStr,
  checkOutStr,
  priceResult,
  resortSettings = {
    bca_account_number: '8830-1928-331',
    bca_account_holder: 'PT VLANEST PUNCAK RESORT',
    mandiri_number: '133-00-9821-4431',
    mandiri_holder: 'PT VLANEST PUNCAK RESORT',
    cs_whatsapp: '6281298765432',
  },
}: CheckoutFormProps) {
  const router = useRouter();

  // Payment Method Category: 'MANUAL_BANK' | 'INSTANT_QRIS' | 'VIRTUAL_ACCOUNT'
  const [paymentGateway, setPaymentGateway] = useState<
    'MANUAL_BANK' | 'INSTANT_QRIS' | 'VIRTUAL_ACCOUNT'
  >('INSTANT_QRIS');

  const [paymentType, setPaymentType] = useState<'FULL' | 'DP_30' | 'DP_50'>('DP_50');
  const [guestName, setGuestName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBank, setCopiedBank] = useState<'BCA' | 'MANDIRI' | 'VA' | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Catering Package Selection State
  const [selectedCateringId, setSelectedCateringId] = useState<string>('NONE');
  const [cateringPax, setCateringPax] = useState<number>(Math.min(20, villa.max_guests));

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  const selectedCatering = CATERING_PACKAGES.find((c) => c.id === selectedCateringId);

  const getCateringTotal = () => {
    if (!selectedCatering || selectedCateringId === 'NONE') return 0;
    return selectedCatering.pricePerPax * cateringPax;
  };

  const cateringTotal = getCateringTotal();
  const rawGrandTotal = priceResult.grandTotal + cateringTotal;
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalGrandTotal = Math.max(0, rawGrandTotal - discountAmount);

  const copyToClipboard = (text: string, type: 'BCA' | 'MANDIRI' | 'VA') => {
    navigator.clipboard.writeText(text);
    setCopiedBank(type);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoError('');

    const res = await validatePromoCode(promoInput, rawGrandTotal);
    setIsValidatingPromo(false);

    if (res.isValid && res.discountAmount) {
      setAppliedPromo({
        code: res.code!,
        discountAmount: res.discountAmount,
      });
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError(res.error || 'Kode promo tidak dapat digunakan.');
    }
  };

  const getPaidAmount = () => {
    if (paymentType === 'DP_30') return Math.round(finalGrandTotal * 0.3);
    if (paymentType === 'DP_50') return Math.round(finalGrandTotal * 0.5);
    return finalGrandTotal;
  };

  const getRemainingAmount = () => {
    return finalGrandTotal - getPaidAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      setErrorMessage('Anda wajib menyetujui aturan vila & deposit jaminan untuk melanjutkan.');
      return;
    }

    if (!guestName.trim() || !whatsappNumber.trim()) {
      setErrorMessage('Mohon lengkapi Nama dan Nomor WhatsApp aktif.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('villa_id', villa.id);
    formData.append('guest_name', guestName);
    formData.append('whatsapp_number', whatsappNumber);
    formData.append('check_in_date', checkInStr);
    formData.append('check_out_date', checkOutStr);
    formData.append('payment_type', paymentType);
    formData.append(
      'proof_of_payment_url',
      paymentGateway === 'INSTANT_QRIS'
        ? 'QRIS_INSTANT_PAID'
        : paymentGateway === 'VIRTUAL_ACCOUNT'
        ? 'VA_INSTANT_PAID'
        : proofUrl
    );
    formData.append('special_requests', specialRequests);

    if (selectedCatering && selectedCateringId !== 'NONE') {
      formData.append(
        'catering_package_name',
        `${selectedCatering.name} (${cateringPax} Pax)`
      );
      formData.append('catering_amount', cateringTotal.toString());
    }

    const res = await createBookingAction(formData);

    setIsSubmitting(false);

    if (res.success && res.bookingCode) {
      router.push(`/booking-success/${res.bookingCode}`);
    } else {
      setErrorMessage(res.error || 'Gagal memproses pemesanan. Coba lagi.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Form & Payment Gateway Options */}
      <div className="lg:col-span-2 space-y-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Guest Identity Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Informasi Pemesan Utama
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Nama Lengkap Pemesan:
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Nomor WhatsApp (Aktif):
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081298765432"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600 font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                E-Voucher resmi & rute Google Maps vila akan dikirimkan ke nomor WA ini.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              Catatan Khusus untuk Tim Butler Vila (Opsional):
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Contoh: Tolong siapkan alat panggangan BBQ pukul 18.30 WIB, rombongan datang naik 1 Bus 59 seat."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600 font-light"
            />
          </div>
        </div>

        {/* Promo Code Coupon Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Mempunyai Kode Promo Voucher?
          </h3>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Masukkan kode (e.g. PUNCAKCERIA)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={isValidatingPromo}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 cursor-pointer"
            >
              {isValidatingPromo ? 'Mengecek...' : 'Gunakan Kode'}
            </button>
          </div>

          {appliedPromo && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span>Promo {appliedPromo.code} Berhasil Dipakai!</span>
              <span className="text-amber-600 dark:text-amber-400 font-sans">- {formatRupiah(appliedPromo.discountAmount)}</span>
            </div>
          )}

          {promoError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold">
              {promoError}
            </div>
          )}
        </div>

        {/* Catering Package Selection Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              Paket Katering Puncak (Opsional)
            </h3>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-500/30">
              Chef & Pelayan Resort
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedCateringId('NONE')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedCateringId === 'NONE'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">Tanpa Paket Katering</span>
                {selectedCateringId === 'NONE' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                )}
              </div>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                Tamu membawa atau memasak makanan sendiri di dapur vila.
              </p>
            </div>

            {CATERING_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedCateringId(pkg.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  selectedCateringId === pkg.id
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{pkg.name}</span>
                  {selectedCateringId === pkg.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] font-light text-slate-600 dark:text-slate-300 line-clamp-2">
                  {pkg.description}
                </p>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Harga:</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-amber-400 font-sans">
                    {formatRupiah(pkg.pricePerPax)} /pax
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedCateringId !== 'NONE' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Jumlah Porsi Rombongan:
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Bisa disesuaikan dengan total kapasitas {villa.max_guests} orang
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCateringPax((p) => Math.max(10, p - 5))}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400 w-12 text-center">
                  {cateringPax} Pax
                </span>
                <button
                  type="button"
                  onClick={() => setCateringPax((p) => Math.min(60, p + 5))}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Scheme & Gateway Mode Choice Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Metode Pembayaran Instant & Transfer
          </h3>

          {/* Payment Method Category Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setPaymentGateway('INSTANT_QRIS')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                paymentGateway === 'INSTANT_QRIS'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-emerald-700 dark:text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Instant QRIS
                </span>
                {paymentGateway === 'INSTANT_QRIS' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                )}
              </div>
              <span className="text-xs font-bold block">Gopay / OVO / ShopeePay</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Scan Barcode Verifikasi Otomatis</span>
            </div>

            <div
              onClick={() => setPaymentGateway('VIRTUAL_ACCOUNT')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                paymentGateway === 'VIRTUAL_ACCOUNT'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Virtual Account</span>
                {paymentGateway === 'VIRTUAL_ACCOUNT' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                )}
              </div>
              <span className="text-xs font-bold block">BCA / Mandiri VA</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">16 Digit Nomor VA Otomatis</span>
            </div>

            <div
              onClick={() => setPaymentGateway('MANUAL_BANK')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                paymentGateway === 'MANUAL_BANK'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Transfer Manual</span>
                {paymentGateway === 'MANUAL_BANK' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                )}
              </div>
              <span className="text-xs font-bold block">BCA / Mandiri Manual</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Upload Bukti Transfer</span>
            </div>
          </div>

          {/* Payment Type Ratio Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div
              onClick={() => setPaymentType('DP_50')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1 ${
                paymentType === 'DP_50'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-amber-400 block">DP 50%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Sisa 50% Pelunasan di Vila</span>
            </div>

            <div
              onClick={() => setPaymentType('DP_30')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1 ${
                paymentType === 'DP_30'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">DP 30%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Sisa 70% Pelunasan di Vila</span>
            </div>

            <div
              onClick={() => setPaymentType('FULL')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1 ${
                paymentType === 'FULL'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-slate-900 dark:text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lunas 100%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Langsung Bebas Ribet</span>
            </div>
          </div>

          {/* Conditional Gateway Render */}
          {paymentGateway === 'INSTANT_QRIS' && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <QrCode className="w-4 h-4" /> QRIS Instant Gateway Verifikasi Otomatis
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Scan kode QRIS di bawah menggunakan aplikasi E-Wallet (GoPay, OVO, ShopeePay, Dana, LinkAja, BCA Mobile, atau Mobile Banking apa saja).
              </p>

              {/* Simulated QR Code Barcode */}
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl border border-slate-300 shadow-md flex flex-col items-center justify-center space-y-2">
                <div className="w-full h-full border-4 border-slate-900 rounded-lg p-2 flex flex-col items-center justify-center bg-slate-900 text-white font-mono text-[10px] tracking-widest text-center">
                  <QrCode className="w-24 h-24 text-amber-400" />
                  <span>QRIS VLANEST</span>
                </div>
              </div>

              <div className="text-xs font-bold text-emerald-700 dark:text-amber-400">
                Nominal Bayar: {formatRupiah(getPaidAmount())}
              </div>
            </div>
          )}

          {paymentGateway === 'VIRTUAL_ACCOUNT' && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">BCA Virtual Account (Otomatis)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('883019283318921', 'VA')}
                  className="hover:text-amber-500 text-xs flex items-center gap-1 font-bold text-slate-500"
                >
                  {copiedBank === 'VA' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin No. VA</span>
                </button>
              </div>
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-widest">
                8830 1928 3318 921
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sistem akan memverifikasi pembayaran Virtual Account Anda secara instan dalam 30 detik.
              </p>
            </div>
          )}

          {paymentGateway === 'MANUAL_BANK' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Rekening Transfer Resmi Resort:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">BCA Transfer</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resortSettings.bca_account_number, 'BCA')}
                      className="hover:text-amber-500 text-[10px] flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400"
                    >
                      {copiedBank === 'BCA' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Tersalin!
                        </span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin No. Rek
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider">
                    {resortSettings.bca_account_number}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">a.n {resortSettings.bca_account_holder}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">Mandiri Transfer</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resortSettings.mandiri_number, 'MANDIRI')}
                      className="hover:text-amber-500 text-[10px] flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400"
                    >
                      {copiedBank === 'MANDIRI' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Tersalin!
                        </span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin No. Rek
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider">
                    {resortSettings.mandiri_number}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">a.n {resortSettings.mandiri_holder}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms Agreement Checkbox Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-light">
              Saya menyetujui <span className="font-bold text-slate-900 dark:text-white">Aturan Rumah Vila</span> (Jam tenang 22.00 WIB, dilarang narkoba/sajam) & memahami bahwa <span className="font-bold text-emerald-700 dark:text-emerald-400">Security Deposit Rp {villa.security_deposit.toLocaleString('id-ID')}</span> dikembalikan 100% saat check-out setelah inspeksi bersama butler.
            </span>
          </label>
        </div>
      </div>

      {/* Right Column: Billing Summary & CTA */}
      <div className="space-y-6">
        <div className="sticky top-28 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Ringkasan Biaya</span>
            <p className="font-serif text-xl font-bold text-slate-900 dark:text-white">{villa.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {format(checkIn, 'dd MMM yyyy', { locale: id })} - {format(checkOut, 'dd MMM yyyy', { locale: id })} ({priceResult.totalNights} Malam)
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Sewa Vila ({priceResult.totalNights} Malam):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(priceResult.totalBasePrice)}</span>
            </div>

            {cateringTotal > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>Paket Katering ({cateringPax} Pax):</span>
                <span>+{formatRupiah(cateringTotal)}</span>
              </div>
            )}

            {appliedPromo && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                <span>Potongan Promo ({appliedPromo.code}):</span>
                <span>-{formatRupiah(appliedPromo.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Security Deposit (Refund H+0):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(priceResult.securityDeposit)}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-emerald-700 dark:text-amber-400 font-sans">{formatRupiah(finalGrandTotal)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
              <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Wajib Diprof/Transfer Sekarang:</span>
                <span className="font-sans text-sm">{formatRupiah(getPaidAmount())}</span>
              </div>
              {getRemainingAmount() > 0 && (
                <div className="flex justify-between text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                  <span>Sisa Pelunasan di Lokasi:</span>
                  <span>{formatRupiah(getRemainingAmount())}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg border border-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Memproses E-Voucher...' : 'Konfirmasi & Dapatkan E-Voucher'}</span>
            <ArrowRight className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </div>
    </form>
  );
}
