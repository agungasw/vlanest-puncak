'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdminAction } from '@/lib/authActions';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  Home,
  Calendar,
  CreditCard,
  CheckSquare,
  BarChart3,
  LogOut,
  Ticket,
  Settings,
  Users,
  PieChart,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Master Vila', href: '/admin/villas', icon: Home },
    { label: 'Pemesanan & Voucher', href: '/admin/bookings', icon: CreditCard },
    { label: 'Kalender & Tarif Event', href: '/admin/calendar', icon: Calendar },
    { label: 'Pemilik Vila', href: '/admin/owners', icon: Users },
    { label: 'Laporan Bagi Hasil', href: '/admin/revenue-sharing', icon: PieChart },
    { label: 'Log Kebersihan & Deposit', href: '/admin/housekeeping', icon: CheckSquare },
    { label: 'Riset & Analytics', href: '/admin/research', icon: BarChart3 },
    { label: 'Kode Promo Voucher', href: '/admin/promos', icon: Ticket },
    { label: 'Pengaturan Rekening & CS', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 min-h-screen shrink-0 transition-colors">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-amber-300 font-extrabold text-sm shadow-md">
              V
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                VlaNest
              </span>
              <span className="text-[9px] uppercase tracking-widest text-emerald-700 dark:text-amber-400 font-semibold block">
                Puncak Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tema Tampilan</span>
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar Sesi Admin
        </button>
      </div>
    </aside>
  );
}
