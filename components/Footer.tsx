import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0b132b] text-slate-600 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 font-extrabold text-lg shadow-md border border-amber-400/40">
                VN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    VlaNest
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300/40 dark:border-amber-400/30 uppercase">
                    Resort Puncak
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Private Luxury Villa Collection</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              Platform sewa vila eksklusif semi-minimalist di Puncak (Cisarua, Cipanas, Megamendung). Transparansi harga, garansi kolam bersih, dan pelayanan 24 jam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Kawasan Puncak</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/?area=Cisarua" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  Vila Cisarua Puncak
                </Link>
              </li>
              <li>
                <Link href="/?area=Cipanas" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  Vila Cipanas & Perkebunan Teh
                </Link>
              </li>
              <li>
                <Link href="/?area=Megamendung" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  Vila Megamendung Private
                </Link>
              </li>
              <li>
                <Link href="/?area=Ciawi" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  Vila Ciawi Bebas Macet
                </Link>
              </li>
            </ul>
          </div>

          {/* Amenities Filter */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Fasilitas Favorit</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Kolam Renang Private Warm Water
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Akses Bus Besar 59 Seat
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Pemandangan Gunung Pangrango
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Ruang Karaoke Sound System Bose
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Kontak Management</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Jl. Raya Puncak Km 84, Cisarua, Bogor, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
                <span>+62 812-9876-5432 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
                <span>info@vlanest-puncak.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} VlaNest Puncak. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400 fill-emerald-600 dark:fill-amber-400" /> for Puncak Resort Tourism
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
