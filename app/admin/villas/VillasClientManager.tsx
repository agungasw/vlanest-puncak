'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  MapPin,
  Users,
  Bed,
  Bath,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah } from '@/lib/pricing';
import { saveVillaAction, deleteVillaAction } from '@/lib/actions';

export interface VillaFullRecord {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  description: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  base_price_weekday: number;
  base_price_weekend: number;
  security_deposit: number;
  min_stay_default: number;
  rules_text: string;
  google_maps_url?: string | null;
  photos: { photo_url: string; virtual_tour_url?: string | null; is_primary: boolean }[];
  amenities: { amenity_name: string }[];
}

export default function VillasClientManager({ villas }: { villas: VillaFullRecord[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVillaId, setEditingVillaId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [locationArea, setLocationArea] = useState('Cisarua');
  const [description, setDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState(20);
  const [bedrooms, setBedrooms] = useState(4);
  const [bathrooms, setBathrooms] = useState(4);
  const [basePriceWeekday, setBasePriceWeekday] = useState(3000000);
  const [basePriceWeekend, setBasePriceWeekend] = useState(4500000);
  const [securityDeposit, setSecurityDeposit] = useState(1000000);
  const [minStayDefault, setMinStayDefault] = useState(1);
  const [rulesText, setRulesText] = useState(
    '1. Check-in 14.00, Check-out 12.00.\n2. Dilarang membawa hewan peliharaan.\n3. Harap menjaga ketenangan setelah jam 22.00 WIB.'
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=Puncak+Bogor');
  const [virtualTourUrl, setVirtualTourUrl] = useState('https://my.matterport.com/show/?m=sample-360');
  const [photoUrlsInput, setPhotoUrlsInput] = useState<string[]>(['']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Private Pool',
    'Wifi',
    'View Gunung',
    'BBQ',
    'Water Heater',
  ]);

  const availableAmenitiesList = [
    'Private Pool',
    'Wifi',
    'Karaoke',
    'View Gunung',
    'BBQ',
    'Akses Bus Besar',
    'Water Heater',
    'Smart TV',
    'Billiard',
    'Kitchen Set',
    'Gazebo Rooftop',
  ];

  const handleOpenCreate = () => {
    setEditingVillaId(null);
    setTitle('');
    setLocationArea('Cisarua');
    setDescription('');
    setMaxGuests(20);
    setBedrooms(4);
    setBathrooms(4);
    setBasePriceWeekday(3000000);
    setBasePriceWeekend(4500000);
    setSecurityDeposit(1000000);
    setMinStayDefault(1);
    setRulesText(
      '1. Check-in 14.00, Check-out 12.00.\n2. Dilarang membawa hewan peliharaan.\n3. Harap menjaga ketenangan setelah jam 22.00 WIB.'
    );
    setGoogleMapsUrl('https://maps.google.com/?q=Puncak+Bogor');
    setVirtualTourUrl('https://my.matterport.com/show/?m=sample-360');
    setPhotoUrlsInput([
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ]);
    setSelectedAmenities(['Private Pool', 'Wifi', 'View Gunung', 'BBQ', 'Water Heater']);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VillaFullRecord) => {
    setEditingVillaId(v.id);
    setTitle(v.title);
    setLocationArea(v.location_area);
    setDescription(v.description);
    setMaxGuests(v.max_guests);
    setBedrooms(v.bedrooms);
    setBathrooms(v.bathrooms);
    setBasePriceWeekday(v.base_price_weekday);
    setBasePriceWeekend(v.base_price_weekend);
    setSecurityDeposit(v.security_deposit);
    setMinStayDefault(v.min_stay_default);
    setRulesText(v.rules_text);
    setGoogleMapsUrl(v.google_maps_url || '');
    setVirtualTourUrl(v.photos[0]?.virtual_tour_url || '');
    setPhotoUrlsInput(v.photos.map((p) => p.photo_url));
    setSelectedAmenities(v.amenities.map((a) => a.amenity_name));
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleAddPhotoField = () => {
    setPhotoUrlsInput([...photoUrlsInput, '']);
  };

  const handlePhotoUrlChange = (idx: number, value: string) => {
    const updated = [...photoUrlsInput];
    updated[idx] = value;
    setPhotoUrlsInput(updated);
  };

  const handleRemovePhotoField = (idx: number) => {
    setPhotoUrlsInput(photoUrlsInput.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMessage('Judul dan Deskripsi Vila wajib diisi!');
      return;
    }

    const cleanPhotos = photoUrlsInput.filter((p) => p.trim().length > 0);
    if (cleanPhotos.length === 0) {
      setErrorMessage('Masukkan minimal 1 URL Foto Vila!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await saveVillaAction({
      id: editingVillaId || undefined,
      title,
      location_area: locationArea,
      description,
      max_guests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      base_price_weekday: Number(basePriceWeekday),
      base_price_weekend: Number(basePriceWeekend),
      security_deposit: Number(securityDeposit),
      min_stay_default: Number(minStayDefault),
      rules_text: rulesText,
      google_maps_url: googleMapsUrl,
      virtual_tour_url: virtualTourUrl,
      photos: cleanPhotos,
      amenities: selectedAmenities,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan vila.');
    }
  };

  const handleDelete = async (villaId: string, villaTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data vila "${villaTitle}"?`)) {
      await deleteVillaAction(villaId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            Katalog Properti Puncak
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Manajemen Vila (CRUD)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tambah vila baru lengkap dengan galeri foto, tautan 360° Virtual Tour, fasilitas, harga, dan deposit.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-xl border border-emerald-400/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tambah Vila Baru</span>
        </button>
      </div>

      {/* Villa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villas.map((v) => {
          const primaryPhoto =
            v.photos.find((p) => p.is_primary)?.photo_url || v.photos[0]?.photo_url;

          return (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-3xl overflow-hidden shadow-xl space-y-4 p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={primaryPhoto} alt={v.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {v.location_area}
                  </span>
                  <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]">
                    {v.photos.length} Foto
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-white line-clamp-1">{v.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Max {v.max_guests} orang</span>
                    <span>•</span>
                    <span>{v.bedrooms} Kamar</span>
                    <span>•</span>
                    <span>{v.bathrooms} KM</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1">
                  {v.amenities.slice(0, 4).map((a, i) => (
                    <span
                      key={i}
                      className="bg-slate-950 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800"
                    >
                      {a.amenity_name}
                    </span>
                  ))}
                  {v.amenities.length > 4 && (
                    <span className="text-[10px] text-amber-400 pl-1 font-semibold">
                      +{v.amenities.length - 4} lagi
                    </span>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Weekday:</span>
                    <span className="font-bold text-amber-400 font-sans">{formatRupiah(v.base_price_weekday)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Weekend:</span>
                    <span className="font-bold text-white font-sans">{formatRupiah(v.base_price_weekend)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                    <span>Security Deposit:</span>
                    <span className="font-semibold">{formatRupiah(v.security_deposit)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/villa/${v.slug}`}
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Pratinjau
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.title)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 font-semibold text-xs border border-slate-700 transition-colors"
                    title="Hapus Vila"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Villa Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400">
                  {editingVillaId ? 'Edit Data Vila' : 'Formulir Vila Baru'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-0.5">
                  {editingVillaId ? `Edit: ${title}` : 'Tambah Vila Puncak Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
              {/* Section 1: Basic Info */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 1. Identitas & Informasi Utama Vila
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nama / Judul Vila <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Villa Panoramic Sky Cipanas"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Kawasan Area <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Cisarua">Cisarua</option>
                      <option value="Cipanas">Cipanas</option>
                      <option value="Megamendung">Megamendung</option>
                      <option value="Ciawi">Ciawi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Deskripsi Vila Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan suasana vila, pemandangan, fasilitas unggulan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Specs & Pricing */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> 2. Spesifikasi, Tarif Dasar & Deposit Jaminan
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Maks Tamu:</label>
                    <input
                      type="number"
                      required
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kamar Tidur:</label>
                    <input
                      type="number"
                      required
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kamar Mandi:</label>
                    <input
                      type="number"
                      required
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Min Stay (Malam):</label>
                    <input
                      type="number"
                      required
                      value={minStayDefault}
                      onChange={(e) => setMinStayDefault(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Harga Weekday (Rp):</label>
                    <input
                      type="number"
                      required
                      value={basePriceWeekday}
                      onChange={(e) => setBasePriceWeekday(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Harga Weekend (Rp):</label>
                    <input
                      type="number"
                      required
                      value={basePriceWeekend}
                      onChange={(e) => setBasePriceWeekend(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Security Deposit (Rp):</label>
                    <input
                      type="number"
                      required
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Photos & Virtual Tour URLs */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> 3. Foto-Foto Vila & Tautan Virtual Tour 360°
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPhotoField}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah URL Foto
                  </button>
                </div>

                <div className="space-y-3">
                  {photoUrlsInput.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="w-6 text-slate-400 text-xs font-bold">{idx + 1}.</span>
                      <input
                        type="url"
                        required
                        placeholder="Contoh: https://images.unsplash.com/photo-1580587771525..."
                        value={url}
                        onChange={(e) => handlePhotoUrlChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                      {photoUrlsInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoField(idx)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tautan Embed Virtual Tour 360° / Video Review (Matterport / Youtube):
                  </label>
                  <input
                    type="url"
                    placeholder="Contoh: https://my.matterport.com/show/?m=sample"
                    value={virtualTourUrl}
                    onChange={(e) => setVirtualTourUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Section 4: Amenities Checkbox Grid */}
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white text-sm">4. Pilih Fasilitas Lengkap Vila:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableAmenitiesList.map((amName) => {
                    const isChecked = selectedAmenities.includes(amName);
                    return (
                      <div
                        key={amName}
                        onClick={() => toggleAmenity(amName)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-emerald-950/80 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{amName}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <p className="text-rose-400 font-semibold text-xs text-center">{errorMessage}</p>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-sm shadow-xl border border-emerald-400/40 transition-all hover:scale-[1.01]"
                >
                  {isSubmitting ? 'Memproses Simpan...' : editingVillaId ? 'Simpan Perubahan Vila' : 'Simpan Vila Baru'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
