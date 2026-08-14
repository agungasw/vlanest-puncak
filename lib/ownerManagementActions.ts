'use server';

import { db } from './db';
import { revalidatePath } from 'next/cache';

export async function getVillaOwnersWithVillas() {
  return db.villaOwner.findMany({
    include: {
      villas: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function createVillaOwnerAction(formData: FormData) {
  try {
    const name = (formData.get('name') as string) || '';
    const rawPhone = (formData.get('phone_number') as string) || '';
    const notes = (formData.get('notes') as string) || '';
    const assignedVillaId = (formData.get('assigned_villa_id') as string) || '';

    const phoneNumber = rawPhone.trim().replace(/[^0-9]/g, '');

    if (!name.trim() || !phoneNumber) {
      return { success: false, error: 'Nama dan Nomor WhatsApp Pemilik wajib diisi!' };
    }

    const existing = await db.villaOwner.findUnique({
      where: { phone_number: phoneNumber },
    });

    if (existing) {
      return { success: false, error: 'Nomor HP ini sudah terdaftar atas nama pemilik lain!' };
    }

    const owner = await db.villaOwner.create({
      data: {
        name: name.trim(),
        phone_number: phoneNumber,
        notes: notes.trim(),
      },
    });

    if (assignedVillaId) {
      await db.villa.update({
        where: { id: assignedVillaId },
        data: { owner_id: owner.id },
      });
    }

    await db.adminAuditLog.create({
      data: {
        action: 'CREATE_OWNER',
        details: `Admin mendaftarkan Pemilik Vila baru: ${name} (${phoneNumber}).`,
      },
    });

    revalidatePath('/admin/owners');
    return { success: true };
  } catch (error) {
    console.error('Error creating owner:', error);
    return { success: false, error: 'Gagal mendaftarkan pemilik vila.' };
  }
}

export async function deleteVillaOwnerAction(ownerId: string) {
  try {
    const owner = await db.villaOwner.delete({
      where: { id: ownerId },
    });

    await db.adminAuditLog.create({
      data: {
        action: 'DELETE_OWNER',
        details: `Admin menghapus data Pemilik Vila: ${owner.name}.`,
      },
    });

    revalidatePath('/admin/owners');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data pemilik vila.' };
  }
}

export async function assignVillaToOwnerAction(villaId: string, ownerId: string | null) {
  try {
    await db.villa.update({
      where: { id: villaId },
      data: { owner_id: ownerId },
    });

    revalidatePath('/admin/owners');
    revalidatePath('/admin/villas');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal merubah alokasi pemilik vila.' };
  }
}

export async function generateOwnerWABroadcastUrl(ownerName: string, phoneNumber: string, villaTitles: string[]) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  const villasStr = villaTitles.length > 0 ? villaTitles.join(', ') : 'Vila Anda';

  const message = `Halo Bpk/Ibu *${ownerName}*,\n\nSalam hangat dari Manajemen *VlaNest Puncak Resort*.\n\nMohon bantuannya untuk melakukan *update ketersediaan tanggal terisi/kosong* untuk *${villasStr}* pada minggu ini agar tidak terjadi double booking dengan tamu umum kami.\n\nSilakan klik link portal Anda untuk mengecek & memblokir tanggal:\n👉 http://localhost:3000/owner/login\n\nTerima kasih atas kerja sama dan kepercayaan Anda berpartner bersama VlaNest Puncak! 🏡✨`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
