import { z } from 'zod';

export const bookingInputSchema = z.object({
  villa_id: z.string().min(1, 'Vila wajib dipilih'),
  guest_name: z
    .string()
    .trim()
    .min(3, 'Nama tamu minimal 3 karakter')
    .max(100, 'Nama tamu maksimal 100 karakter'),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      /^(08|628|\+628)[0-9]{8,11}$/,
      'Nomor WhatsApp harus berformat nomor Indonesia aktif (contoh: 081298765432)'
    ),
  check_in_date: z.string().min(1, 'Tanggal Check-in wajib diisi'),
  check_out_date: z.string().min(1, 'Tanggal Check-out wajib diisi'),
  payment_type: z.enum(['FULL', 'DP_30', 'DP_50']),
  proof_of_payment_url: z.string().url('URL bukti transfer tidak valid').optional().nullable(),
  special_requests: z.string().trim().max(500, 'Catatan khusus maksimal 500 karakter').optional().nullable(),
});

export const villaInputSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(3, 'Nama vila minimal 3 karakter')
    .max(150, 'Nama vila maksimal 150 karakter'),
  location_area: z.string().min(1, 'Kawasan area wajib dipilih'),
  description: z
    .string()
    .trim()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(3000, 'Deskripsi maksimal 3000 karakter'),
  max_guests: z.number().min(1, 'Kapasitas minimal 1 orang').max(200, 'Kapasitas maksimal 200 orang'),
  bedrooms: z.number().min(1, 'Jumlah kamar tidur minimal 1').max(50, 'Jumlah kamar tidur maksimal 50'),
  bathrooms: z.number().min(1, 'Jumlah kamar mandi minimal 1').max(50, 'Jumlah kamar mandi maksimal 50'),
  base_price_weekday: z.number().min(100000, 'Harga weekday minimal Rp 100.000'),
  base_price_weekend: z.number().min(100000, 'Harga weekend minimal Rp 100.000'),
  security_deposit: z.number().min(0, 'Deposit jaminan tidak boleh negatif'),
  min_stay_default: z.number().min(1, 'Minimum menginap minimal 1 malam').max(30),
  rules_text: z.string().max(2000, 'Aturan rumah maksimal 2000 karakter'),
  google_maps_url: z.string().url('URL Google Maps tidak valid').optional().nullable(),
  virtual_tour_url: z.string().url('URL Virtual Tour tidak valid').optional().nullable(),
  photos: z.array(z.string().url('URL Foto tidak valid')).min(1, 'Minimal 1 foto vila wajib diisi'),
  amenities: z.array(z.string()),
});
