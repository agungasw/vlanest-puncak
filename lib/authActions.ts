'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '252575';
const COOKIE_NAME = 'vlanest_admin_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'vlanest_resort_puncak_secret_key_2026_x89a';

// In-Memory Rate Limiting Tracker
const loginAttempts = new Map<string, { attempts: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

function generateSignedToken(): string {
  const timestamp = Date.now().toString();
  const payload = `authenticated_admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export async function verifySignedToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payload, hmac] = parts;
    const [role, timestampStr] = payload.split(':');
    if (role !== 'authenticated_admin') return false;

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    // Token valid for 7 days
    if (isNaN(timestamp) || now - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export async function loginAdminAction(formData: FormData) {
  try {
    const password = (formData.get('password') as string) || '';

    // 1. Check Rate Limiting
    const now = Date.now();
    const trackingKey = 'global_admin_login';
    const record = loginAttempts.get(trackingKey);

    if (record) {
      if (now - record.lastAttempt > BLOCK_WINDOW_MS) {
        loginAttempts.set(trackingKey, { attempts: 0, lastAttempt: now });
      } else if (record.attempts >= MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((BLOCK_WINDOW_MS - (now - record.lastAttempt)) / 60000);

        await db.adminAuditLog.create({
          data: {
            action: 'LOGIN_BLOCKED',
            details: 'Percobaan login diblokir karena batas maksimum 5x kesalahan terlampaui.',
          },
        });

        return {
          success: false,
          error: `Terlalu banyak percobaan login yang gagal. Akses diblokir sementara selama ${remainingMinutes} menit demi keamanan.`,
        };
      }
    }

    if (!password.trim()) {
      return { success: false, error: 'Masukkan kata sandi admin!' };
    }

    // 2. Fetch custom password from ResortSetting database
    const settings = await db.resortSetting.findUnique({ where: { id: 'default' } });
    let isMatch = false;

    if (settings?.admin_password_hash) {
      const inputHash = hashPassword(password.trim());
      isMatch = crypto.timingSafeEqual(
        Buffer.from(inputHash),
        Buffer.from(settings.admin_password_hash)
      );
    } else {
      const inputBuffer = Buffer.from(password.trim());
      const targetBuffer = Buffer.from(DEFAULT_ADMIN_PASSWORD);
      if (inputBuffer.length === targetBuffer.length) {
        isMatch = crypto.timingSafeEqual(inputBuffer, targetBuffer);
      }
    }

    if (!isMatch) {
      const currentAttempts = (record?.attempts || 0) + 1;
      loginAttempts.set(trackingKey, { attempts: currentAttempts, lastAttempt: now });
      const remaining = MAX_ATTEMPTS - currentAttempts;

      await db.adminAuditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          details: `Kata sandi salah. Percobaan ke-${currentAttempts}`,
        },
      });

      return {
        success: false,
        error: `Kata sandi admin salah! Sisa percobaan: ${Math.max(0, remaining)} kali.`,
      };
    }

    // Reset rate limiting on success
    loginAttempts.delete(trackingKey);

    // Audit log
    await db.adminAuditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        details: 'Otentikasi admin berhasil. Sesi terenkripsi 7 hari dibuat.',
      },
    });

    // 3. Set Signed Cookie
    const token = generateSignedToken();
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat verifikasi.' };
  }
}

export async function changeAdminPasswordAction(oldPassword: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'Kata sandi baru minimal 6 karakter!' };
    }

    const settings = await db.resortSetting.findUnique({ where: { id: 'default' } });
    let isMatch = false;

    if (settings?.admin_password_hash) {
      const oldHash = hashPassword(oldPassword.trim());
      isMatch = crypto.timingSafeEqual(
        Buffer.from(oldHash),
        Buffer.from(settings.admin_password_hash)
      );
    } else {
      const inputBuffer = Buffer.from(oldPassword.trim());
      const targetBuffer = Buffer.from(DEFAULT_ADMIN_PASSWORD);
      if (inputBuffer.length === targetBuffer.length) {
        isMatch = crypto.timingSafeEqual(inputBuffer, targetBuffer);
      }
    }

    if (!isMatch) {
      return { success: false, error: 'Kata sandi lama yang Anda masukkan salah!' };
    }

    const newHash = hashPassword(newPassword.trim());
    await db.resortSetting.upsert({
      where: { id: 'default' },
      update: { admin_password_hash: newHash },
      create: {
        id: 'default',
        admin_password_hash: newHash,
      },
    });

    await db.adminAuditLog.create({
      data: {
        action: 'CHANGE_PASSWORD',
        details: 'Kata sandi admin berhasil diperbarui dari dashboard.',
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal merubah kata sandi.' };
  }
}

export async function getAdminAuditLogs() {
  return db.adminAuditLog.findMany({
    take: 20,
    orderBy: { created_at: 'desc' },
  });
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return false;
    return await verifySignedToken(session.value);
  } catch {
    return false;
  }
}
