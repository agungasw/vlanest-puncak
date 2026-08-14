'use client';

import { useState } from 'react';
import VillaCard, { VillaCardProps } from '@/components/VillaCard';
import VillaComparisonModal from '@/components/VillaComparisonModal';
import { Scale, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function VillaCatalogClient({
  villas,
}: {
  villas: VillaCardProps[];
}) {
  const [comparedVillas, setComparedVillas] = useState<VillaCardProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleCompare = (villa: VillaCardProps) => {
    const exists = comparedVillas.some((v) => v.id === villa.id);
    if (exists) {
      setComparedVillas(comparedVillas.filter((v) => v.id !== villa.id));
    } else {
      if (comparedVillas.length >= 3) {
        alert('Maksimal 3 vila dapat dibandingkan secara bersamaan.');
        return;
      }
      setComparedVillas([...comparedVillas, villa]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Villa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {villas.map((villa) => (
          <VillaCard
            key={villa.id}
            villa={villa}
            onToggleCompare={handleToggleCompare}
            isCompared={comparedVillas.some((v) => v.id === villa.id)}
          />
        ))}
      </div>

      {/* Floating Comparison Dock Bar */}
      {comparedVillas.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-full px-6 py-3 shadow-2xl shadow-emerald-950/80 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Membandingkan ({comparedVillas.length}/3 Vila)</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {comparedVillas.map((v) => (
              <span
                key={v.id}
                className="bg-slate-950 text-emerald-400 border border-slate-800 px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
              >
                {v.title}
                <X
                  className="w-3 h-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                  onClick={() => handleToggleCompare(v)}
                />
              </span>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Bandingkan Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {isModalOpen && (
        <VillaComparisonModal
          villas={comparedVillas}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
