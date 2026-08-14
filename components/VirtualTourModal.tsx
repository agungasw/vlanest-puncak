'use client';

import { useState } from 'react';
import { Video, Eye, X, ExternalLink, Sparkles } from 'lucide-react';

export interface VirtualTourModalProps {
  virtualTourUrl?: string | null;
  photos: { photo_url: string; is_primary: boolean }[];
}

export default function VirtualTourModal({
  virtualTourUrl,
  photos,
}: VirtualTourModalProps) {
  const [activeTab, setActiveTab] = useState<'GALLERY' | 'VIRTUAL_360'>('GALLERY');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('GALLERY')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
            activeTab === 'GALLERY'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Galeri Foto Interaktif ({photos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VIRTUAL_360')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
            activeTab === 'VIRTUAL_360'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Video className="w-4 h-4 text-amber-400" />
          <span>Virtual Tour 360° & Video</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
            360° VR
          </span>
        </button>
      </div>

      {/* Gallery Tab View */}
      {activeTab === 'GALLERY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setSelectedPhoto(photo.photo_url)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer shadow-lg hover:border-emerald-500/50 transition-all"
            >
              <img
                src={photo.photo_url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Perbesar
                </span>
              </div>
              {photo.is_primary && (
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold tracking-wider uppercase shadow-md">
                  Utama
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 360 VR Tab View */}
      {activeTab === 'VIRTUAL_360' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-900/60 text-amber-400 border border-amber-400/30 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-serif text-2xl font-bold text-white">
              Simulasi Virtual Tour 360° VR Vila
            </h4>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2">
              Jelajahi seluruh sudut ruangan, area kolam renang, dan kamar tidur secara interaktif sebelum Anda memesan.
            </p>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-full h-full absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold inline-block">
                Interactive 3D Matterport Embed Active
              </span>
              <p className="text-xs text-slate-400 max-w-md">
                Tautan Tour 360°:{' '}
                <span className="text-amber-400 font-mono">
                  {virtualTourUrl || 'https://my.matterport.com/show/?m=sample-vlanest-puncak'}
                </span>
              </p>
              <a
                href={virtualTourUrl || 'https://my.matterport.com/show/?m=sample-vlanest-puncak'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
              >
                <span>Buka Virtual Tour 360° Layar Penuh</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPhoto} alt="Full preview" className="w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
