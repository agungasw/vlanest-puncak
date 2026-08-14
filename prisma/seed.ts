import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VlaNest Resort settings, promo codes, and linking demo owner to all villas...');

  await prisma.resortSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      resort_name: 'VlaNest Puncak Luxury Resort',
      bca_account_number: '8830-1928-331',
      bca_account_holder: 'PT VLANEST PUNCAK RESORT',
      mandiri_number: '133-00-9821-4431',
      mandiri_holder: 'PT VLANEST PUNCAK RESORT',
      cs_whatsapp: '6281298765432',
      contact_email: 'reservation@vlanestpuncak.id',
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'PUNCAKCERIA' },
    update: {},
    create: {
      code: 'PUNCAKCERIA',
      discount_type: 'FIXED_AMOUNT',
      discount_value: 200000,
      min_spend: 1000000,
      active: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'ROMBONGAN10' },
    update: {},
    create: {
      code: 'ROMBONGAN10',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      min_spend: 2000000,
      active: true,
    },
  });

  // Seed Demo Villa Owner
  const demoOwner = await prisma.villaOwner.upsert({
    where: { phone_number: '081234567890' },
    update: {
      name: 'Bpk. Hendra Wijaya',
      notes: 'Pemilik Seluruh Unit Sampel Vila VlaNest Puncak',
    },
    create: {
      name: 'Bpk. Hendra Wijaya',
      phone_number: '081234567890',
      notes: 'Pemilik Seluruh Unit Sampel Vila VlaNest Puncak',
    },
  });

  // Link demo owner to ALL villas in database
  await prisma.villa.updateMany({
    data: {
      owner_id: demoOwner.id,
    },
  });

  console.log('Successfully linked owner 081234567890 to all sample villas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
