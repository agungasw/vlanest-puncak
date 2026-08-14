'use client';

import { X, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/pricing';

export interface VillaCompareItem {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  base_price_weekday: number;
  base_price_weekend: number;
  security_deposit: number;
  photos: { photo_url: string; is_primary: boolean }[];
  amenities: { amenity_name: string }[];
}

export interface VillaComparisonModalProps {
  villas: VillaCompareItem[];
  onClose: () => void;
}

export default function VillaComparisonModal({
  villas,
  onClose,
}: VillaComparisonModalProps) {
  if (villas.length === 0) return null;

  const allAmenities = [
    'Private Pool',
    'Akses Bus Besar',
    'View Gunung',
    'Karaoke',
    'BBQ',
    'Water Heater',
    'Billiard',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-700/50 rounded-3xl p-6 sm:p-8 max-w-5xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-xl font-bold text-white">
              Bandingkan Spesifikasi Vila (Fitur ala Traveloka & Agoda)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 w-1/4 text-slate-400 font-bold uppercase text-[10px]">Perbandingan</th>
                {villas.map((v) => {
                  const primaryPhoto = v.photos.find((p) => p.is_primary)?.photo_url || v.photos[0]?.photo_url;
                  return (
                    <th key={v.id} className="p-3 w-1/4 text-center">
                      <div className="space-y-2">
                        <img
                          src={primaryPhoto}
                          alt={v.title}
                          className="w-full h-24 object-cover rounded-xl border border-slate-800"
                        />
                        <span className="font-serif font-bold text-white text-sm block">{v.title}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{v.location_area}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* Capacity */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Kapasitas Maksimal</td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">
                    {v.max_guests} Orang
                  </td>
                ))}
              </tr>

              {/* Bedrooms / Bathrooms */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Kamar Tidur / Mandi</td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center text-slate-200">
                    {v.bedrooms} KT / {v.bathrooms} KM
                  </td>
                ))}
              </tr>

              {/* Weekday Price */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Harga Weekday / Malam</td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-amber-400 font-sans">
                    {formatRupiah(v.base_price_weekday)}
                  </td>
                ))}
              </tr>

              {/* Weekend Price */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Harga Weekend / Malam</td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-amber-400 font-sans">
                    {formatRupiah(v.base_price_weekend)}
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Security Deposit</td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center text-slate-300">
                    {formatRupiah(v.security_deposit)}
                  </td>
                ))}
              </tr>

              {/* Amenities Breakdown */}
              {allAmenities.map((am) => (
                <tr key={am}>
                  <td className="p-3 font-semibold text-slate-400">{am}</td>
                  {villas.map((v) => {
                    const hasAmenity = v.amenities.some((a) => a.amenity_name.toLowerCase().includes(am.toLowerCase()));
                    return (
                      <td key={v.id} className="p-3 text-center">
                        {hasAmenity ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* CTA Action Links */}
              <tr>
                <td className="p-3"></td>
                {villas.map((v) => (
                  <td key={v.id} className="p-3 text-center">
                    <Link
                      href={`/villa/${v.slug}`}
                      className="inline-flex items-center justify-center gap-1 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                    >
                      <span>Pilih Vila Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Garansi Harga Direct Booking Paling Hemat (Bebas Biaya Komisi OTA 15-20%)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            Tutup Perbandingan
          </button>
        </div>
      </div>
    </div>
  );
}
