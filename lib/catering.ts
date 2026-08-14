export interface CateringPackage {
  id: string;
  name: string;
  category: 'PRASMANAN' | 'BBQ' | 'BREAKFAST' | 'KAMBING_GULING' | 'ADDON';
  pricePerPax: number;
  unitLabel: string;
  minPax: number;
  description: string;
  items: string[];
  photoUrl: string;
  isPopular?: boolean;
}

export const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'sunda-prasmanan',
    name: 'Paket Prasmanan Sunda Tradisional',
    category: 'PRASMANAN',
    pricePerPax: 45000,
    unitLabel: 'Per Porsi',
    minPax: 15,
    description: 'Hidangan khas Sunda hangat cocok untuk makan siang/malam rombongan keluarga.',
    items: [
      'Nasi Liwet Kastrol Puncak',
      'Ayam Goreng Lengkuas Aromatis',
      'Ikan Gurame Terbang Renyah',
      'Tahu & Tempe Bacem',
      'Sambal Dadak & Lalapan Segar',
      'Es Kelapa Muda Gula Aren',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    isPopular: true,
  },
  {
    id: 'bbq-night-premium',
    name: 'Paket BBQ Night Resort Puncak',
    category: 'BBQ',
    pricePerPax: 85000,
    unitLabel: 'Per Porsi',
    minPax: 15,
    description: 'Pesta BBQ malam hari lengkap dengan panggangan, arang, dan chef pemanggang.',
    items: [
      'Daging Sapi Marinated Sirloin',
      'Sosis Bratwurst Jumbo',
      'Udang & Cumi Bakar Mentega',
      'Jagung Bakar Karamel',
      'Saus Blackpepper & BBQ',
      'Teh Hangat & Buah Segar',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isPopular: true,
  },
  {
    id: 'kambing-guling-utuh',
    name: 'Paket Kambing Guling Utuh Special',
    category: 'KAMBING_GULING',
    pricePerPax: 2500000,
    unitLabel: 'Per Ekor (40-50 Pax)',
    minPax: 1,
    description: '1 Ekor Kambing Guling Muda olahan rempah khas Puncak empuk tanpa bau prengus.',
    items: [
      '1 Ekor Kambing Guling Utuh',
      'Lontong / Nasi Kebuli',
      'Bumbu Kecap Pedas & Bumbu Kacang',
      'Acar Segar',
      'Chef Pemanggang di Vila',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'breakfast-buffet',
    name: 'Paket Sarapan Pagi Buffet',
    category: 'BREAKFAST',
    pricePerPax: 30000,
    unitLabel: 'Per Porsi',
    minPax: 15,
    description: 'Sarapan pagi hangat sejuk Puncak untuk memulihkan energi rombongan.',
    items: [
      'Nasi Uduk Gurih / Nasi Goreng Spesial',
      'Telur Balado / Dadar Suwir',
      'Bihun Goreng & Kerupuk',
      'Kopi Tubruk Puncak & Teh Manis Hangat',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  },
];
