'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { updateResortSettingsAction } from '@/lib/settingsActions';
import { changeAdminPasswordAction } from '@/lib/authActions';
import {
  Building,
  CreditCard,
  Phone,
  CheckCircle2,
  Save,
  ShieldCheck,
  KeyRound,
  History,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface ResortSettingRecord {
  id: string;
  resort_name: string;
  bca_account_number: string;
  bca_account_holder: string;
  mandiri_number: string;
  mandiri_holder: string;
  cs_whatsapp: string;
  contact_email: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  details: string;
  created_at: Date | string;
}

export default function SettingsClientManager({
  initialSettings,
  auditLogs = [],
}: {
  initialSettings: ResortSettingRecord;
  auditLogs?: AuditLogRecord[];
}) {
  // Resort Settings State
  const [resortName, setResortName] = useState(initialSettings.resort_name);
  const [bcaNumber, setBcaNumber] = useState(initialSettings.bca_account_number);
  const [bcaHolder, setBcaHolder] = useState(initialSettings.bca_account_holder);
  const [mandiriNumber, setMandiriNumber] = useState(initialSettings.mandiri_number);
  const [mandiriHolder, setMandiriHolder] = useState(initialSettings.mandiri_holder);
  const [csWhatsapp, setCsWhatsapp] = useState(initialSettings.cs_whatsapp);
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password Changer State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('resort_name', resortName);
    formData.append('bca_account_number', bcaNumber);
    formData.append('bca_account_holder', bcaHolder);
    formData.append('mandiri_number', mandiriNumber);
    formData.append('mandiri_holder', mandiriHolder);
    formData.append('cs_whatsapp', csWhatsapp);
    formData.append('contact_email', contactEmail);

    const res = await updateResortSettingsAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Pengaturan rekening & kontak resort berhasil diperbarui!');
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui pengaturan.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);
    setPassSuccessMsg('');
    setPassErrorMsg('');

    const res = await changeAdminPasswordAction(oldPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccessMsg('Kata sandi admin berhasil diganti!');
      setOldPassword('');
      setNewPassword('');
    } else {
      setPassErrorMsg(res.error || 'Gagal mengganti kata sandi.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. Change Password Hardening Module */}
      <div className="bg-white dark:bg-[#0f172a] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              Ubah Kata Sandi Admin (Security Hardening)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ganti kata sandi default (<code className="font-mono text-amber-500">252575</code>) ke kata sandi rahasia baru Anda.
            </p>
          </div>
        </div>

        {passSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{passSuccessMsg}</span>
          </div>
        )}

        {passErrorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold">
            {passErrorMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Lama:
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Baru (Min. 6 Karakter):
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Masukkan kata sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              {isChangingPass ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Resort Settings Form */}
      <form onSubmit={handleSubmitSettings} className="space-y-6">
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Resort Branding */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Identitas & Branding Resort
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Resmi Resort:</label>
            <input
              type="text"
              required
              value={resortName}
              onChange={(e) => setResortName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            />
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Rekening Bank Resmi Transfer Pembayaran (BCA & Mandiri)
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs block">Bank Central Asia (BCA)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Nomor Rekening BCA:</label>
                <input
                  type="text"
                  required
                  value={bcaNumber}
                  onChange={(e) => setBcaNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Nama Pemilik Rekening BCA:</label>
                <input
                  type="text"
                  required
                  value={bcaHolder}
                  onChange={(e) => setBcaHolder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="font-bold text-amber-700 dark:text-amber-400 text-xs block">Bank Mandiri</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Nomor Rekening Mandiri:</label>
                <input
                  type="text"
                  required
                  value={mandiriNumber}
                  onChange={(e) => setMandiriNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Nama Pemilik Rekening Mandiri:</label>
                <input
                  type="text"
                  required
                  value={mandiriHolder}
                  onChange={(e) => setMandiriHolder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support Contacts */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Kontak Layanan Pelanggan (CS WhatsApp & Email)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Nomor WhatsApp CS (Format 628...):</label>
              <input
                type="text"
                required
                value={csWhatsapp}
                onChange={(e) => setCsWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Email Resmi Reservations:</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg border border-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* 3. Security Audit Log View */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            Log Aktivitas Keamanan Admin (Security Audit Log)
          </h3>
          <span className="text-[11px] text-slate-400">20 Aktivitas Terakhir</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Waktu Kejadian</th>
                <th className="p-3">Jenis Aktivitas</th>
                <th className="p-3">Detail Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss')}
                  </td>
                  <td className="p-3 font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        log.action === 'LOGIN_SUCCESS'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : log.action === 'CHANGE_PASSWORD'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
