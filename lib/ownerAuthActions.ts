'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';

const COOKIE_NAME = 'vlanest_owner_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'vlanest_resort_puncak_secret_key_2026_x89a';

function generateSignedToken(ownerId: string, phone: string): string {
  const timestamp = Date.now().toString();
  const payload = `owner:${ownerId}:${phone}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export async function verifySignedToken(token: string): Promise<{ ownerId: string; phone: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, hmac] = parts;
    const [role, ownerId, phone, timestampStr] = payload.split(':');
    if (role !== 'owner') return null;

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    // Token valid for 30 days
    if (isNaN(timestamp) || now - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    return { ownerId, phone };
  } catch {
    return null;
  }
}

export async function loginOwnerAction(formData: FormData) {
  try {
    const rawPhone = (formData.get('phone') as string) || '';
    const cleanPhone = rawPhone.trim().replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      return { success: false, error: 'Masukkan nomor telepon terdaftar!' };
    }

    // Find owner by phone number
    const owner = await db.villaOwner.findFirst({
      where: {
        phone_number: {
          contains: cleanPhone,
        },
      },
      include: {
        villas: true,
      },
    });

    if (!owner) {
      return {
        success: false,
        error:
          'Nomor HP tidak terdaftar sebagai Pemilik Vila. Hubungi Manajemen VlaNest untuk pendaftaran.',
      };
    }

    // Audit Log
    await db.adminAuditLog.create({
      data: {
        action: 'OWNER_LOGIN',
        details: `Pemilik Vila ${owner.name} (${owner.phone_number}) berhasil masuk ke Portal Pemilik.`,
      },
    });

    // Set signed cookie
    const token = generateSignedToken(owner.id, owner.phone_number);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error during owner login:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat verifikasi.' };
  }
}

export async function logoutOwnerAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function isOwnerAuthenticated() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return null;
    return await verifySignedToken(session.value);
  } catch {
    return null;
  }
}

export async function getOwnerVillasAndData() {
  const session = await isOwnerAuthenticated();
  if (!session) return null;

  const owner = await db.villaOwner.findUnique({
    where: { id: session.ownerId },
    include: {
      villas: {
        include: {
          blocked_dates: true,
          bookings: {
            where: {
              payment_status: {
                in: ['PAID_DP', 'PAID_FULL', 'PENDING'],
              },
            },
            orderBy: { created_at: 'desc' },
          },
        },
      },
    },
  });

  return owner;
}

export async function toggleOwnerBlockedDateAction(
  villaId: string,
  blockedDateIso: string,
  reason: string = 'Booking Pemilik / Direct Owner'
) {
  try {
    const session = await isOwnerAuthenticated();
    if (!session) return { success: false, error: 'Sesi habis. Silakan login kembali.' };

    const targetDate = new Date(blockedDateIso);
    targetDate.setHours(0, 0, 0, 0);

    // Verify villa belongs to this owner
    const villa = await db.villa.findFirst({
      where: {
        id: villaId,
        owner_id: session.ownerId,
      },
      include: {
        bookings: {
          where: {
            payment_status: {
              in: ['PAID_DP', 'PAID_FULL', 'PENDING'],
            },
          },
        },
      },
    });

    if (!villa) {
      return { success: false, error: 'Vila ini tidak terdaftar atas nama Anda.' };
    }

    // STRICT PROTECTION 1: Check if there is an active guest booking on this date
    const hasGuestBooking = villa.bookings.some((booking) => {
      const checkIn = new Date(booking.check_in_date);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(booking.check_out_date);
      checkOut.setHours(0, 0, 0, 0);

      return targetDate >= checkIn && targetDate < checkOut;
    });

    if (hasGuestBooking) {
      return {
        success: false,
        error: 'TANGGAL DILINDUNGI: Tanggal ini sudah dipesan oleh Tamu Umum (Tersewa). Tidak dapat ditimpa atau diubah oleh Pemilik!',
      };
    }

    // Check existing blocked date by owner/admin
    const existing = await db.calendarBlockedDate.findFirst({
      where: {
        villa_id: villaId,
        blocked_date: targetDate,
      },
    });

    if (existing) {
      // Unblock
      await db.calendarBlockedDate.delete({ where: { id: existing.id } });
      await db.adminAuditLog.create({
        data: {
          action: 'OWNER_UNBLOCK_DATE',
          details: `Pemilik ${villa.title} membuka kembali tanggal ${blockedDateIso}.`,
        },
      });
      return { success: true, action: 'UNBLOCKED' };
    } else {
      // Block with custom reason
      await db.calendarBlockedDate.create({
        data: {
          villa_id: villaId,
          blocked_date: targetDate,
          reason: reason.trim() || 'Booking Pemilik / Direct Owner',
        },
      });

      await db.adminAuditLog.create({
        data: {
          action: 'OWNER_BLOCK_DATE',
          details: `Pemilik ${villa.title} memblokir tanggal ${blockedDateIso} dengan alasan: "${reason}".`,
        },
      });

      return {
        success: true,
        action: 'BLOCKED',
        villaTitle: villa.title,
        blockedDateIso,
        reason,
      };
    }
  } catch (error) {
    return { success: false, error: 'Gagal merubah status tanggal.' };
  }
}
