import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Villa Booking Platform Puncak data...');

  // Clean old data
  await prisma.booking.deleteMany();
  await prisma.calendarBlockedDate.deleteMany();
  await prisma.villaSpecialRate.deleteMany();
  await prisma.villaAmenity.deleteMany();
  await prisma.villaPhoto.deleteMany();
  await prisma.villa.deleteMany();

  // 1. Villa High Pines Grand Cisarua
  const villa1 = await prisma.villa.create({
    data: {
      title: 'Villa High Pines Grand Cisarua',
      slug: 'villa-high-pines-grand-cisarua',
      location_area: 'Cisarua',
      description:
        'Villa mewah bernuansa resort bintang 5 di kawasan Cisarua Puncak dengan pemandangan langsung Gunung Gede Pangrango. Dilengkapi kolam renang pribadi hangat, ruang karaoke Sound System Bose, area BBQ outdoor yang luas, serta akses mudah untuk bus pariwisata 59 seat.',
      max_guests: 25,
      bedrooms: 5,
      bathrooms: 5,
      base_price_weekday: 3500000,
      base_price_weekend: 4800000,
      security_deposit: 1000000,
      min_stay_default: 1,
      rules_text:
        '1. Dilarang membawa hewan peliharaan.\n2. Waktu Check-in 14:00 WIB, Check-out 12:00 WIB.\n3. Harap menjaga ketenangan setelah jam 22.00 WIB.\n4. Dilarang merokok di dalam kamar tidur.',
      google_maps_url: 'https://maps.google.com/?q=-6.6981,106.9388',
      photos: {
        create: [
          {
            photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
            virtual_tour_url: 'https://my.matterport.com/show/?m=sample1',
            is_primary: true,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
        ],
      },
      amenities: {
        create: [
          { amenity_name: 'Private Pool' },
          { amenity_name: 'Wifi' },
          { amenity_name: 'Karaoke' },
          { amenity_name: 'View Gunung' },
          { amenity_name: 'BBQ' },
          { amenity_name: 'Akses Bus Besar' },
          { amenity_name: 'Water Heater' },
          { amenity_name: 'Smart TV' },
          { amenity_name: 'Kitchen Set' },
        ],
      },
      special_rates: {
        create: [
          {
            event_name: 'Peak Season Akhir Tahun & Natal',
            start_date: new Date('2026-12-24T00:00:00.000Z'),
            end_date: new Date('2026-12-31T23:59:59.000Z'),
            custom_price_per_night: 6500000,
            min_stay_override: 2,
          },
        ],
      },
      blocked_dates: {
        create: [
          {
            blocked_date: new Date('2026-08-20T00:00:00.000Z'),
            reason: 'Perawatan Kolam & Pemeliharaan Rutin',
          },
        ],
      },
    },
  });

  // 2. Villa Panoramic Sky Cipanas
  const villa2 = await prisma.villa.create({
    data: {
      title: 'Villa Panoramic Sky Cipanas',
      slug: 'villa-panoramic-sky-cipanas',
      location_area: 'Cipanas',
      description:
        'Villa estetik dengan pemandangan 360 derajat perbukitan teh Cipanas. Dilengkapi gazebo rooftop, kolam renang infinity, ruang santai modern, dan dapur lengkap.',
      max_guests: 18,
      bedrooms: 4,
      bathrooms: 4,
      base_price_weekday: 2800000,
      base_price_weekend: 3900000,
      security_deposit: 7500000,
      min_stay_default: 1,
      rules_text:
        '1. Kapasitas maksimum 18 orang.\n2. Dilarang menyalakan kembang api tanpa izin pengelola.\n3. Jaga kebersihan area kolam renang.',
      google_maps_url: 'https://maps.google.com/?q=-6.7211,107.0392',
      photos: {
        create: [
          {
            photo_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            virtual_tour_url: 'https://my.matterport.com/show/?m=sample2',
            is_primary: true,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
        ],
      },
      amenities: {
        create: [
          { amenity_name: 'Private Pool' },
          { amenity_name: 'Wifi' },
          { amenity_name: 'View Gunung' },
          { amenity_name: 'Karaoke' },
          { amenity_name: 'BBQ' },
          { amenity_name: 'Water Heater' },
          { amenity_name: 'Gazebo Rooftop' },
        ],
      },
    },
  });

  // 3. Villa Royal Crown Megamendung
  const villa3 = await prisma.villa.create({
    data: {
      title: 'Villa Royal Crown Megamendung',
      slug: 'villa-royal-crown-megamendung',
      location_area: 'Megamendung',
      description:
        'Villa megah seluas 2.000m² di Megamendung Puncak. Dilengkapi meja billiard standar internasional, privat karaoke hall, kolam renang olympic size, dan lapangan rumput luas untuk outbond keluarga.',
      max_guests: 30,
      bedrooms: 6,
      bathrooms: 6,
      base_price_weekday: 4200000,
      base_price_weekend: 5500000,
      security_deposit: 1500000,
      min_stay_default: 1,
      rules_text:
        '1. Dilarang merusak fasilitas permainan billiard dan audio karaoke.\n2. Maksimum kendaraan bus medium 3/4.\n3. Deposit dikembalikan setelah inspeksi H+0 check-out.',
      google_maps_url: 'https://maps.google.com/?q=-6.6582,106.9212',
      photos: {
        create: [
          {
            photo_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            virtual_tour_url: 'https://my.matterport.com/show/?m=sample3',
            is_primary: true,
          },
          {
            photo_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
            is_primary: false,
          },
        ],
      },
      amenities: {
        create: [
          { amenity_name: 'Private Pool' },
          { amenity_name: 'Wifi' },
          { amenity_name: 'Karaoke' },
          { amenity_name: 'View Gunung' },
          { amenity_name: 'BBQ' },
          { amenity_name: 'Akses Bus Besar' },
          { amenity_name: 'Water Heater' },
          { amenity_name: 'Billiard' },
        ],
      },
    },
  });

  // 4. Sample Bookings
  await prisma.booking.create({
    data: {
      booking_code: 'VLA-8921',
      villa_id: villa1.id,
      guest_name: 'Budi Santoso',
      whatsapp_number: '081298765432',
      check_in_date: new Date('2026-08-25T00:00:00.000Z'),
      check_out_date: new Date('2026-08-27T00:00:00.000Z'),
      total_nights: 2,
      total_base_price: 7000000,
      security_deposit_amount: 1000000,
      grand_total: 8000000,
      payment_type: 'DP_50',
      paid_amount: 4000000,
      remaining_amount: 4000000,
      payment_status: 'PAID_DP',
      proof_of_payment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      deposit_refunded: false,
    },
  });

  await prisma.booking.create({
    data: {
      booking_code: 'VLA-9412',
      villa_id: villa2.id,
      guest_name: 'Siti Rahmawati',
      whatsapp_number: '085711223344',
      check_in_date: new Date('2026-09-05T00:00:00.000Z'),
      check_out_date: new Date('2026-09-06T00:00:00.000Z'),
      total_nights: 1,
      total_base_price: 3900000,
      security_deposit_amount: 750000,
      grand_total: 4650000,
      payment_type: 'FULL',
      paid_amount: 4650000,
      remaining_amount: 0,
      payment_status: 'PAID_FULL',
      proof_of_payment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      deposit_refunded: false,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
