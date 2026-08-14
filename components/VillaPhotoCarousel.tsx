'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X, Eye } from 'lucide-react';

export interface PhotoItem {
  id: string;
  photo_url: string;
  virtual_tour_url?: string | null;
  is_primary?: boolean;
}

export default function VillaPhotoCarousel({
  photos,
  villaTitle,
  onOpenVR,
}: {
  photos: PhotoItem[];
  villaTitle: string;
  onOpenVR?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
        Tidak ada foto vila
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const primaryVRUrl = photos.find((p) => p.virtual_tour_url)?.virtual_tour_url;

  return (
    <div className="space-y-3 select-none">
      {/* Main Touch-Swipe Carousel Frame */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[360px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-200/50 dark:border-slate-800 group"
      >
        <Image
          src={photos[currentIndex].photo_url}
          alt={`${villaTitle} Foto ${currentIndex + 1}`}
          fill
          unoptimized
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-lg z-10"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-lg z-10"
              title="Foto Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Top Badges & VR Tour Trigger */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-950/70 text-white backdrop-blur-md border border-white/20 text-xs font-mono font-bold shadow-md">
            {currentIndex + 1} / {photos.length}
          </span>

          <div className="flex items-center gap-2">
            {primaryVRUrl && onOpenVR && (
              <button
                onClick={onOpenVR}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs shadow-lg border border-amber-300/40 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <Eye className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Virtual Tour 360°</span>
              </button>
            )}

            <button
              onClick={() => setIsLightboxOpen(true)}
              className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              title="Perbesar Layar Penuh HD"
            >
              <Maximize2 className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Layar Penuh HD</span>
            </button>
          </div>
        </div>

        {/* Bottom Title & Dots Indicator */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
          <div className="text-white drop-shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
              Galeri Foto Resmi
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold line-clamp-1">{villaTitle}</span>
          </div>

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails Row */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                currentIndex === idx
                  ? 'border-emerald-600 dark:border-amber-400 scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={photo.photo_url} alt="Thumbnail" fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen HD Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white">
              <span className="font-serif text-lg font-bold block">{villaTitle}</span>
              <span className="text-xs text-slate-400 font-mono">
                Foto {currentIndex + 1} dari {photos.length} (Kualitas HD High-Res)
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main HD Image Container */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={photos[currentIndex].photo_url}
                alt="HD Fullscreen"
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 shadow-xl cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 shadow-xl cursor-pointer"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Thumbnails */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {photos.map((p, idx) => (
              <div
                key={p.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                  currentIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-40'
                }`}
              >
                <Image src={p.photo_url} alt="Thumb" fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
