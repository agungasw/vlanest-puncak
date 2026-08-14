'use server';

import { db } from './db';
import { isAdminAuthenticated } from './auth';

export async function getRevenueSharingData(villaId?: string, monthYear?: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return null;

  const villas = await db.villa.findMany({
    include: {
      owner: true,
      bookings: {
        where: {
          payment_status: {
            in: ['PAID_DP', 'PAID_FULL'],
          },
        },
      },
      maintenance_logs: true,
    },
  });

  return villas;
}

export async function addMaintenanceLogAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const villa_id = formData.get('villa_id') as string;
    const item_name = formData.get('item_name') as string;
    const description = (formData.get('description') as string) || '';
    const estimated_cost = Number(formData.get('estimated_cost')) || 0;

    if (!villa_id || !item_name) {
      return { success: false, error: 'Pilih vila dan tuliskan item perbaikan!' };
    }

    await db.villaMaintenanceLog.create({
      data: {
        villa_id,
        item_name,
        description,
        estimated_cost,
        status: 'NEED_ATTENTION',
      },
    });

    await db.adminAuditLog.create({
      data: {
        action: 'ADD_MAINTENANCE_LOG',
        details: `Menambahkan laporan perbaikan untuk vila ID: ${villa_id} - ${item_name} (${estimated_cost}).`,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menambahkan laporan perbaikan.' };
  }
}

export async function updateMaintenanceStatusAction(logId: string, status: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    await db.villaMaintenanceLog.update({
      where: { id: logId },
      data: { status },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Gagal mengupdate status.' };
  }
}
