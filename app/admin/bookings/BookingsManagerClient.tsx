'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatRupiah } from '@/lib/pricing';
import { updateBookingStatusAction, createManualBookingAction } from '@/lib/actions';
import { generateAdminSendVoucherUrl } from '@/lib/whatsapp';
import {
  Search,
  Eye,
  MessageSquare,
  Printer,
  UtensilsCrossed,
  Download,
  Plus,
  MessageSquareText,
  X,
  Sparkles,
} from 'lucide-react';

export interface BookingAdminRecord {
  id: string;
  booking_code: string;
  guest_name: string;
  whatsapp_number: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  total_nights: number;
  total_base_price: number;
  security_deposit_amount: number;
  catering_package?: string | null;
  catering_amount?: number | null;
  special_requests?: string | null;
  grand_total: number;
  payment_type: string;
  paid_amount: number;
  remaining_amount: number;
  payment_status: string;
  proof_of_payment_url?: string | null;
  deposit_refunded: boolean;
  created_at: Date | string;
  villa: {
    id: string;
    title: string;
    location_area: string;
    google_maps_url?: string | null;
  };
}

export default function BookingsManagerClient({
  initialBookings,
  villasList = [],
}: {
  initialBookings: BookingAdminRecord[];
  villasList?: { id: string; title: string }[];
}) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<BookingAdminRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual booking form state
  const [manualVillaId, setManualVillaId] = useState(villasList[0]?.id || '');
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualWhatsapp, setManualWhatsapp] = useState('');
  const [manualCheckIn, setManualCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualCheckOut, setManualCheckOut] = useState(
    format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')
  );
  const [manualPaymentType, setManualPaymentType] = useState('DP_50');
  const [manualPaidAmount, setManualPaidAmount] = useState<number>(1000000);
  const [manualSpecialRequests, setManualSpecialRequests] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const filteredBookings = initialBookings.filter((bk) => {
    const matchesStatus = statusFilter === 'ALL' || bk.payment_status === statusFilter;
    const matchesQuery =
      bk.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.whatsapp_number.includes(searchQuery) ||
      bk.villa.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await updateBookingStatusAction(bookingId, newStatus);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Kode Booking',
      'Nama Tamu',
      'WhatsApp',
      'Vila Dipesan',
      'Check-in',
      'Check-out',
      'Malam',
      'Total Sewa',
      'Paket Katering',
      'Catatan Khusus',
      'Grand Total',
      'Jumlah Terbayar',
      'Sisa Pelunasan',
      'Status Pembayaran',
      'Status Deposit',
    ];

    const rows = filteredBookings.map((b) => [
      b.booking_code,
      `"${b.guest_name}"`,
      `"${b.whatsapp_number}"`,
      `"${b.villa.title}"`,
      format(new Date(b.check_in_date), 'yyyy-MM-dd'),
      format(new Date(b.check_out_date), 'yyyy-MM-dd'),
      b.total_nights,
      b.total_base_price,
      `"${b.catering_package || '-'}"`,
      `"${b.special_requests || '-'}"`,
      b.grand_total,
      b.paid_amount,
      b.remaining_amount,
      b.payment_status,
      b.deposit_refunded ? 'Dikembalikan' : 'Ditahan',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Pemesanan_VlaNest_${format(new Date(), 'dd_MMM_yyyy')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Booking Submit
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVillaId) return;

    setIsSubmittingManual(true);
    const res = await createManualBookingAction({
      villa_id: manualVillaId,
      guest_name: manualGuestName,
      whatsapp_number: manualWhatsapp,
      check_in_date: manualCheckIn,
      check_out_date: manualCheckOut,
      payment_type: manualPaymentType,
      paid_amount: Number(manualPaidAmount),
      payment_status: 'PAID_DP',
      special_requests: manualSpecialRequests || 'Pemesanan Manual Admin / WA Direct',
    });

    setIsSubmittingManual(false);
    if (res.success) {
      setIsManualModalOpen(false);
      setManualGuestName('');
      setManualWhatsapp('');
      setManualSpecialRequests('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PENDING', 'PAID_DP', 'PAID_FULL', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white shadow-md border border-amber-400'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'Semua Transaksi'
                : st === 'PENDING'
                ? 'Pending'
                : st === 'PAID_DP'
                ? 'Terbayar DP'
                : st === 'PAID_FULL'
                ? 'Lunas 100%'
                : 'Batal'}
            </button>
          ))}
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Cari nama, kode VLA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Unduh Rekap Laporan Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
              <span>Export CSV</span>
            </button>

            {villasList.length > 0 && (
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Booking Manual</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Kode Booking</th>
                <th className="p-3">Tamu / WhatsApp</th>
                <th className="p-3">Vila & Katering Dipesan</th>
                <th className="p-3">Catatan Khusus</th>
                <th className="p-3">Check-in / Out</th>
                <th className="p-3">Skema / Terbayar</th>
                <th className="p-3">Bukti Transfer</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Otomatisasi WA / E-Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.map((bk) => {
                const waVoucherUrl = generateAdminSendVoucherUrl({
                  whatsappNumber: bk.whatsapp_number,
                  bookingCode: bk.booking_code,
                  villaTitle: bk.villa.title,
                  guestName: bk.guest_name,
                  checkIn: bk.check_in_date,
                  checkOut: bk.check_out_date,
                  googleMapsUrl: bk.villa.google_maps_url,
                  paymentStatus: bk.payment_status,
                });

                return (
                  <tr key={bk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-amber-400">{bk.booking_code}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">{bk.guest_name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{bk.whatsapp_number}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-900 dark:text-white font-medium block">{bk.villa.title}</span>
                      {bk.catering_package ? (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                          <UtensilsCrossed className="w-3 h-3" /> {bk.catering_package} (+{formatRupiah(bk.catering_amount || 0)})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tanpa Katering</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs">
                      {bk.special_requests ? (
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 italic block line-clamp-2">
                          "{bk.special_requests}"
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">-</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {format(new Date(bk.check_in_date), 'dd MMM')} -{' '}
                      {format(new Date(bk.check_out_date), 'dd MMM yyyy')}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-700 dark:text-amber-400 font-sans block">
                        {formatRupiah(bk.paid_amount)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {bk.payment_type} (Grand: {formatRupiah(bk.grand_total)})
                      </span>
                    </td>
                    <td className="p-3">
                      {bk.proof_of_payment_url ? (
                        <button
                          onClick={() => setSelectedProofUrl(bk.proof_of_payment_url!)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum Upload</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={bk.payment_status}
                        onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${
                          bk.payment_status === 'PAID_FULL'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                            : bk.payment_status === 'PAID_DP'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                            : bk.payment_status === 'PENDING'
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <option value="PENDING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PENDING</option>
                        <option value="PAID_DP" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PAID_DP</option>
                        <option value="PAID_FULL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PAID_FULL</option>
                        <option value="CANCELLED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={waVoucherUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-md flex items-center gap-1.5"
                          title="1-Klik Kirim E-Voucher & Titik Maps ke WA Tamu"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Kirim WA
                        </a>
                        <button
                          onClick={() => setSelectedVoucher(bk)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-amber-400 font-bold text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> E-Voucher
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                Tambah Pemesanan Manual (Offline / WA Direct)
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih Vila Dipesan:</label>
                <select
                  value={manualVillaId}
                  onChange={(e) => setManualVillaId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {villasList.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Pemesan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={manualGuestName}
                    onChange={(e) => setManualGuestName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">WhatsApp Pemesan:</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081298765432"
                    value={manualWhatsapp}
                    onChange={(e) => setManualWhatsapp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Check-in:</label>
                  <input
                    type="date"
                    required
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Check-out:</label>
                  <input
                    type="date"
                    required
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nominal DP Diterima (Rp):</label>
                <input
                  type="number"
                  required
                  value={manualPaidAmount}
                  onChange={(e) => setManualPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan Khusus Admin:</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: DP diterima tunai di kantor atau via WA direct"
                  value={manualSpecialRequests}
                  onChange={(e) => setManualSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  {isSubmittingManual ? 'Menyimpan...' : 'Simpan Transaksi Manual'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {selectedProofUrl && (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 text-center shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Bukti Transfer Tamu</h3>
            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <img src={selectedProofUrl} alt="Bukti Transfer" className="w-full object-contain" />
            </div>
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
            >
              Tutup Modal
            </button>
          </div>
        </div>
      )}

      {/* Printable E-Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-emerald-600 dark:border-emerald-700/60 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-1">
              <span className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest block">
                Official E-Voucher
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{selectedVoucher.booking_code}</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Vila Dipesan:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">{selectedVoucher.villa.title}</span>
              </div>
              {selectedVoucher.catering_package && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Pesanan Katering:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs block">{selectedVoucher.catering_package}</span>
                </div>
              )}
              {selectedVoucher.special_requests && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Catatan Khusus:</span>
                  <span className="italic text-slate-700 dark:text-slate-300 text-xs block">"{selectedVoucher.special_requests}"</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Nama Tamu:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">{selectedVoucher.guest_name}</span>
                <span className="text-slate-500 dark:text-slate-400">{selectedVoucher.whatsapp_number}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Check-in:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {format(new Date(selectedVoucher.check_in_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Check-out:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {format(new Date(selectedVoucher.check_out_date), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Total Bayar:</span>
                <span className="font-bold text-emerald-700 dark:text-amber-400 font-sans text-sm">
                  {formatRupiah(selectedVoucher.paid_amount)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
