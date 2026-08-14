'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  TrendingUp,
  Percent,
  Download,
  Printer,
  Wrench,
  Building,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  Sparkles,
  X,
} from 'lucide-react';
import { formatRupiah } from '@/lib/pricing';

export interface RevenueSharingVilla {
  id: string;
  title: string;
  location_area: string;
  owner?: {
    id: string;
    name: string;
    phone_number: string;
  } | null;
  bookings: {
    id: string;
    booking_code: string;
    guest_name: string;
    check_in_date: Date | string;
    check_out_date: Date | string;
    total_nights: number;
    grand_total: number;
    paid_amount: number;
    created_at: Date | string;
  }[];
  maintenance_logs: {
    id: string;
    item_name: string;
    description?: string | null;
    estimated_cost: number;
    status: string;
    created_at: Date | string;
  }[];
}

export default function RevenueSharingClient({
  villasData,
}: {
  villasData: RevenueSharingVilla[];
}) {
  const [selectedVillaId, setSelectedVillaId] = useState<string>(villasData[0]?.id || '');
  const [commissionRate, setCommissionRate] = useState<number>(15); // Default 15% Admin commission
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08'); // YYYY-MM
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const selectedVilla = villasData.find((v) => v.id === selectedVillaId) || villasData[0];

  // Filter bookings for selected month
  const monthBookings = selectedVilla?.bookings.filter((b) => {
    const bookingMonth = format(new Date(b.check_in_date), 'yyyy-MM');
    return bookingMonth === selectedMonth || !selectedMonth;
  }) || [];

  // Filter maintenance costs for selected month
  const monthMaintenance = selectedVilla?.maintenance_logs.filter((m) => {
    const logMonth = format(new Date(m.created_at), 'yyyy-MM');
    return logMonth === selectedMonth || !selectedMonth;
  }) || [];

  const totalNights = monthBookings.reduce((acc, b) => acc + b.total_nights, 0);
  const totalGrossRevenue = monthBookings.reduce((acc, b) => acc + b.grand_total, 0);
  const adminCommissionAmount = Math.round((totalGrossRevenue * commissionRate) / 100);
  const totalMaintenanceCost = monthMaintenance.reduce((acc, m) => acc + m.estimated_cost, 0);
  const ownerNetPayout = Math.max(0, totalGrossRevenue - adminCommissionAmount - totalMaintenanceCost);

  const handleExportCSV = () => {
    if (!selectedVilla) return;

    const headers = ['Jenis', 'Kode / Item', 'Nama Tamu / Deskripsi', 'Tanggal', 'Gross Revenue (Rp)', 'Potongan Admin', 'Biaya Maint (Rp)', 'Net Hak Pemilik (Rp)'];

    const bookingRows = monthBookings.map((b) => {
      const gross = b.grand_total;
      const comm = Math.round((gross * commissionRate) / 100);
      const net = gross - comm;
      return [
        'Pemesanan Tamu',
        b.booking_code,
        `"${b.guest_name}"`,
        format(new Date(b.check_in_date), 'yyyy-MM-dd'),
        gross,
        comm,
        0,
        net,
      ];
    });

    const maintenanceRows = monthMaintenance.map((m) => [
      'Biaya Pemeliharaan',
      'MAINT',
      `"${m.item_name}"`,
      format(new Date(m.created_at), 'yyyy-MM-dd'),
      0,
      0,
      m.estimated_cost,
      -m.estimated_cost,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `SLIP BAGI HASIL RESMI VLANEST RESORT PUNCAK`,
        `Vila: "${selectedVilla.title}"`,
        `Pemilik: "${selectedVilla.owner?.name || 'Belum Terhubung'}"`,
        `Periode: "${selectedMonth}"`,
        `Skema Komisi Admin: "${commissionRate}%"`,
        `Total Bersih Hak Pemilik: "${ownerNetPayout}"`,
        '',
        headers.join(','),
        ...bookingRows.map((r) => r.join(',')),
        ...maintenanceRows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Slip_Bagi_Hasil_${selectedVilla.title.replace(/\s+/g, '_')}_${selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300/40">
            Internal Admin Portal Only
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Laporan Slip Bagi Hasil Bulanan (Revenue Sharing)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rangkum otomatis nilai bagi hasil komisi rental & potongan perbaikan vila untuk dikirimkan ke Pemilik Vila.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => setIsPDFModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md border border-emerald-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Slip PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Villa Select */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Pilih Unit Vila:</label>
          <select
            value={selectedVillaId}
            onChange={(e) => setSelectedVillaId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs"
          >
            {villasData.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.owner?.name || 'Tanpa Pemilik'})
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Periode Bulan:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs"
          />
        </div>

        {/* Commission Slider */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-500 dark:text-slate-400">Komisi Admin / Pengelola:</label>
            <span className="font-bold text-emerald-700 dark:text-amber-400">{commissionRate}% Admin</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>5%</span>
            <span>15% (Default)</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Gross Pendapatan Sewa</span>
          <p className="font-serif text-2xl font-bold text-slate-900 dark:text-white font-sans">{formatRupiah(totalGrossRevenue)}</p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">{monthBookings.length} Pemesanan ({totalNights} Malam)</span>
        </div>

        {/* Admin Commission */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Komisi Pengelola ({commissionRate}%)</span>
          <p className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400 font-sans">{formatRupiah(adminCommissionAmount)}</p>
          <span className="text-[10px] text-slate-400 block">Jasa Operasional Management</span>
        </div>

        {/* Maintenance Cost */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Potongan Perbaikan / Maintenance</span>
          <p className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400 font-sans">{formatRupiah(totalMaintenanceCost)}</p>
          <span className="text-[10px] text-slate-400 block">{monthMaintenance.length} Item Laporan Perbaikan</span>
        </div>

        {/* Net Payout to Owner */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-3xl shadow-lg space-y-1 border border-amber-400/40">
          <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider block">BERSIH HAK PEMILIK VILA</span>
          <p className="font-serif text-2xl font-bold text-amber-300 font-sans">{formatRupiah(ownerNetPayout)}</p>
          <span className="text-[10px] text-emerald-100 block">Siap Ditransfer ke Rekening Pemilik</span>
        </div>
      </div>

      {/* Bookings & Maintenance Rincian Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Rincian Transaksi & Potongan ({selectedVilla?.title})
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Pemilik: <strong className="text-slate-900 dark:text-white">{selectedVilla?.owner?.name || 'Belum Ditentukan'}</strong> ({selectedVilla?.owner?.phone_number || '-'})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Kategori</th>
                <th className="p-3">Kode / Item</th>
                <th className="p-3">Deskripsi</th>
                <th className="p-3">Gross Rental</th>
                <th className="p-3">Komisi Admin ({commissionRate}%)</th>
                <th className="p-3">Potongan Maint</th>
                <th className="p-3 text-right">Net Hak Pemilik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthBookings.map((b) => {
                const gross = b.grand_total;
                const comm = Math.round((gross * commissionRate) / 100);
                const net = gross - comm;
                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        Pemesanan Tamu
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-amber-400">{b.booking_code}</td>
                    <td className="p-3 font-semibold">{b.guest_name} ({b.total_nights} Malam)</td>
                    <td className="p-3 font-sans font-bold">{formatRupiah(gross)}</td>
                    <td className="p-3 font-sans text-amber-600 dark:text-amber-400">-{formatRupiah(comm)}</td>
                    <td className="p-3 text-slate-400">Rp 0</td>
                    <td className="p-3 font-sans font-extrabold text-emerald-700 dark:text-emerald-400 text-right">
                      {formatRupiah(net)}
                    </td>
                  </tr>
                );
              })}

              {monthMaintenance.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-rose-50/30 dark:bg-rose-950/20">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                      Perbaikan Vila
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-600">MAINT</td>
                  <td className="p-3 font-semibold text-rose-800 dark:text-rose-300">{m.item_name}</td>
                  <td className="p-3 text-slate-400">Rp 0</td>
                  <td className="p-3 text-slate-400">Rp 0</td>
                  <td className="p-3 font-sans font-bold text-rose-600">-{formatRupiah(m.estimated_cost)}</td>
                  <td className="p-3 font-sans font-extrabold text-rose-600 text-right">
                    -{formatRupiah(m.estimated_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable PDF Slip Modal */}
      {isPDFModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-emerald-600 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPDFModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-amber-400 block">
                Official Revenue Sharing Statement
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                SLIP LAPORAN BAGI HASIL PEMILIK VILA
              </h2>
              <p className="text-xs text-slate-500 font-mono">PT VLANEST PUNCAK LUXURY RESORT</p>
            </div>

            {/* Info Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Vila:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{selectedVilla?.title}</strong>
                <span className="text-slate-500 block">{selectedVilla?.location_area}, Puncak</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Pemilik Terdaftar:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{selectedVilla?.owner?.name || 'Belum Terdaftar'}</strong>
                <span className="text-slate-500 block">{selectedVilla?.owner?.phone_number || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Periode Laporan:</span>
                <strong className="text-emerald-700 dark:text-amber-400">{selectedMonth}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Skema Bagi Hasil:</span>
                <strong className="text-slate-900 dark:text-white">{100 - commissionRate}% Pemilik / {commissionRate}% Admin</strong>
              </div>
            </div>

            {/* Math Table Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Total Gross Pendapatan Sewa ({monthBookings.length} Pemesanan):</span>
                <span className="font-bold font-sans">{formatRupiah(totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Potongan Komisi Pengelola ({commissionRate}%):</span>
                <span className="font-bold font-sans text-amber-600">-{formatRupiah(adminCommissionAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Potongan Biaya Pemeliharaan Vila ({monthMaintenance.length} Item):</span>
                <span className="font-bold font-sans text-rose-600">-{formatRupiah(totalMaintenanceCost)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-emerald-600 text-sm font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">TOTAL NETT BERSIH DITRANSFER KE PEMILIK:</span>
                <span className="font-serif text-lg text-emerald-700 dark:text-amber-400">{formatRupiah(ownerNetPayout)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-300" /> Cetak / Simpan PDF Slip
              </button>
              <button
                onClick={() => setIsPDFModalOpen(false)}
                className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
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
