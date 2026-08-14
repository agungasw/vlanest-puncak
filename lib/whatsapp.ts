import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatRupiah } from './pricing';

export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

export function generateGuestWhatsAppUrl(params: {
  whatsappNumber: string;
  bookingCode: string;
  villaTitle: string;
  guestName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  grandTotal: number;
  paymentType: string;
  paidAmount: number;
  remainingAmount: number;
}): string {
  const phone = formatWhatsAppPhone(params.whatsappNumber);

  const paymentText =
    params.paymentType === 'FULL'
      ? 'LUNAS (100%)'
      : `DP (${params.paymentType === 'DP_30' ? '30%' : '50%'})`;

  const message = `Halo Admin VlaNest Puncak 👋,

Saya ingin mengonfirmasi pemesanan vila:
📌 *Kode Booking:* ${params.bookingCode}
🏠 *Vila:* ${params.villaTitle}
👤 *Nama Tamu:* ${params.guestName}
📅 *Check-in:* ${format(new Date(params.checkIn), 'dd MMMM yyyy', { locale: id })}
📅 *Check-out:* ${format(new Date(params.checkOut), 'dd MMMM yyyy', { locale: id })}
💳 *Tipe Pembayaran:* ${paymentText}
💰 *Total Bayar:* ${formatRupiah(params.paidAmount)}
${params.remainingAmount > 0 ? `💵 *Sisa Pelunasan di Lokasi:* ${formatRupiah(params.remainingAmount)}\n` : ''}
Mohon konfirmasi verifikasi pembayaran dan pengiriman E-Voucher resmi. Terima kasih!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateAdminSendVoucherUrl(params: {
  whatsappNumber: string;
  bookingCode: string;
  villaTitle: string;
  guestName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  googleMapsUrl?: string | null;
  paymentStatus: string;
}): string {
  const phone = formatWhatsAppPhone(params.whatsappNumber);

  const mapsLink = params.googleMapsUrl || 'https://maps.google.com/?q=Puncak+Bogor';

  const checkInDateFormatted = format(new Date(params.checkIn), 'dd MMMM yyyy', { locale: id });
  const checkOutDateFormatted = format(new Date(params.checkOut), 'dd MMMM yyyy', { locale: id });

  const message = `Yth. Bpk/Ibu *${params.guestName}*,

Terima kasih telah memesan vila di *VlaNest Resort Puncak*. Berikut adalah E-Voucher & Informasi Pemesanan Anda:

🎫 *Kode E-Voucher:* ${params.bookingCode}
🏠 *Vila:* ${params.villaTitle}
📅 *Check-in:* ${checkInDateFormatted} (mulai 14:00 WIB)
📅 *Check-out:* ${checkOutDateFormatted} (maks 12:00 WIB)
Status Pembayaran: *${params.paymentStatus === 'PAID_FULL' ? 'LUNAS ✅' : 'DP DITERIMA ✅'}*

📍 *Titik Lokasi Google Maps Vila:*
${mapsLink}

Simpan pesan ini sebagai konfirmasi check-in di gerbang villa. Tim penjaga vila kami siap menyambut kedatangan Anda!

Salam hangat,
*Management VlaNest Puncak*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
