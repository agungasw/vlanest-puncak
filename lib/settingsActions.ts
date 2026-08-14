'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';

export async function getResortSettings() {
  let settings = await db.resortSetting.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await db.resortSetting.create({
      data: {
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
  }

  return settings;
}

export async function updateResortSettingsAction(formData: FormData) {
  try {
    const resort_name = (formData.get('resort_name') as string) || 'VlaNest Puncak Luxury Resort';
    const bca_account_number = (formData.get('bca_account_number') as string) || '8830-1928-331';
    const bca_account_holder = (formData.get('bca_account_holder') as string) || 'PT VLANEST PUNCAK RESORT';
    const mandiri_number = (formData.get('mandiri_number') as string) || '133-00-9821-4431';
    const mandiri_holder = (formData.get('mandiri_holder') as string) || 'PT VLANEST PUNCAK RESORT';
    const cs_whatsapp = (formData.get('cs_whatsapp') as string) || '6281298765432';
    const contact_email = (formData.get('contact_email') as string) || 'reservation@vlanestpuncak.id';

    await db.resortSetting.upsert({
      where: { id: 'default' },
      update: {
        resort_name,
        bca_account_number,
        bca_account_holder,
        mandiri_number,
        mandiri_holder,
        cs_whatsapp,
        contact_email,
      },
      create: {
        id: 'default',
        resort_name,
        bca_account_number,
        bca_account_holder,
        mandiri_number,
        mandiri_holder,
        cs_whatsapp,
        contact_email,
      },
    });

    revalidatePath('/');
    revalidatePath('/checkout/[slug]', 'page');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: 'Gagal memperbarui pengaturan resort.' };
  }
}

// Promo Code Actions
export async function getPromoCodes() {
  return db.promoCode.findMany({
    orderBy: { created_at: 'desc' },
  });
}

export async function validatePromoCode(codeStr: string, grandTotal: number) {
  try {
    const promo = await db.promoCode.findUnique({
      where: { code: codeStr.toUpperCase().trim() },
    });

    if (!promo || !promo.active) {
      return { isValid: false, error: 'Kode promo tidak ditemukan atau sudah tidak aktif.' };
    }

    if (grandTotal < promo.min_spend) {
      return {
        isValid: false,
        error: `Minimal transaksi untuk promo ini adalah Rp ${promo.min_spend.toLocaleString('id-ID')}`,
      };
    }

    let discountAmount = 0;
    if (promo.discount_type === 'PERCENTAGE') {
      discountAmount = Math.round((grandTotal * promo.discount_value) / 100);
    } else {
      discountAmount = promo.discount_value;
    }

    return {
      isValid: true,
      code: promo.code,
      discountAmount,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
    };
  } catch (error) {
    return { isValid: false, error: 'Gagal memvalidasi promo.' };
  }
}

export async function savePromoCodeAction(data: {
  code: string;
  discount_type: string;
  discount_value: number;
  min_spend: number;
}) {
  try {
    const cleanCode = data.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    await db.promoCode.create({
      data: {
        code: cleanCode,
        discount_type: data.discount_type || 'FIXED_AMOUNT',
        discount_value: data.discount_value,
        min_spend: data.min_spend || 0,
        active: true,
      },
    });
    revalidatePath('/admin/promos');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Kode promo sudah ada atau terjadi kesalahan.' };
  }
}

export async function togglePromoStatusAction(id: string, active: boolean) {
  try {
    await db.promoCode.update({
      where: { id },
      data: { active },
    });
    revalidatePath('/admin/promos');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal merubah status promo.' };
  }
}

export async function deletePromoCodeAction(id: string) {
  try {
    await db.promoCode.delete({
      where: { id },
    });
    revalidatePath('/admin/promos');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus kode promo.' };
  }
}
