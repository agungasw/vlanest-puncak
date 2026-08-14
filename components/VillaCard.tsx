'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Bed,
  Bath,
  MapPin,
  CheckCircle2,
  Heart,
  Share2,
  Scale,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatRupiah } from '@/lib/pricing';

export interface VillaCardProps {
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

export default function VillaCard({
  villa,
  onToggleCompare,
  isCompared,
}: {
  villa: VillaCardProps;
  onToggleCompare?: (villa: VillaCardProps) => void;
  isCompared?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const photosList = villa.photos && villa.photos.length > 0
    ? villa.photos.map((p) => p.photo_url)
    : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'];

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === photosList.length - 1 ? 0 : prev + 1));
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? photosList.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        setCurrentPhotoIndex((prev) => (prev === photosList.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentPhotoIndex((prev) => (prev === 0 ? photosList.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const topAmenities = villa.amenities.slice(0, 3);

  const handleShareWA = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = encodeURIComponent(
      `Yuk lihat villa bagus di Puncak ini untuk acara kita: ${villa.title} (${villa.location_area})\nhttp://localhost:3000/villa/${villa.slug}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="group bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative select-none">
      {/* Slideable Image Banner */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-950 p-2.5"
      >
        <div className="w-full h-full rounded-2xl overflow-hidden relative group/img">
          <img
            src={photosList[currentPhotoIndex]}
            alt={`${villa.title} Foto ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
          />

          {/* Navigation Arrows for Card Image Slide */}
          {photosList.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer shadow-md z-10"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer shadow-md z-10"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-10">
                {photosList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentPhotoIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentPhotoIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Location Badge */}
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md z-10">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{villa.location_area}, Puncak</span>
          </div>

          {/* Wishlist Heart & Share Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                isFavorite
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-white/50 dark:border-slate-700 hover:text-rose-500'
              }`}
              title="Simpan ke Favorit"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={handleShareWA}
              className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-white/50 dark:border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
              title="Bagikan ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {villa.title}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-amber-400 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-300/40">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.95</span>
            </div>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> {villa.max_guests} Tamu
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-slate-400" /> {villa.bedrooms} KT
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" /> {villa.bathrooms} KM
            </span>
          </div>

          {/* Key Amenities Pills */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            {topAmenities.map((a, i) => (
              <span
                key={i}
                className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {a.amenity_name}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-700 dark:text-amber-400 font-sans">
                {formatRupiah(villa.base_price_weekday)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/malam</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Weekend: {formatRupiah(villa.base_price_weekend)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(villa)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="Bandingkan Spesifikasi Vila"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
            )}
            <Link
              href={`/villa/${villa.slug}`}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-xs shadow-md border border-emerald-400/30 transition-all hover:scale-[1.03]"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
