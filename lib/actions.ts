'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';
import { calculateBookingPrice } from './pricing';
import { bookingInputSchema, villaInputSchema } from './validation';

export async function createBookingAction(formData: FormData) {
  try {
    const rawInput = {
      villa_id: formData.get('villa_id') as string,
      guest_name: formData.get('guest_name') as string,
      whatsapp_number: formData.get('whatsapp_number') as string,
      check_in_date: formData.get('check_in_date') as string,
      check_out_date: formData.get('check_out_date') as string,
      payment_type: (formData.get('payment_type') as string) || 'DP_50',
      proof_of_payment_url: (formData.get('proof_of_payment_url') as string) || null,
      special_requests: (formData.get('special_requests') as string) || null,
    };

    const cateringPackageName = (formData.get('catering_package_name') as string) || null;
    const cateringAmount = parseInt((formData.get('catering_amount') as string) || '0', 10);

    // Zod Schema Validation
    const parseResult = bookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Input tidak valid.';
      return { success: false, error: firstError };
    }

    const input = parseResult.data;

    const villa = await db.villa.findUnique({
      where: { id: input.villa_id },
      include: {
        special_rates: true,
        blocked_dates: true,
        bookings: true,
      },
    });

    if (!villa) {
      return { success: false, error: 'Vila tidak ditemukan.' };
    }

    const checkIn = new Date(input.check_in_date);
    const checkOut = new Date(input.check_out_date);

    const priceRes = calculateBookingPrice(villa, checkIn, checkOut);
    if (!priceRes.isValid) {
      return { success: false, error: priceRes.errorMessage || 'Tanggal tidak valid.' };
    }

    // Grand total includes catering amount if selected
    const totalGrandWithCatering = priceRes.grandTotal + cateringAmount;

    let paidAmount = totalGrandWithCatering;
    let remainingAmount = 0;

    if (input.payment_type === 'DP_30') {
      paidAmount = Math.round(totalGrandWithCatering * 0.3);
      remainingAmount = totalGrandWithCatering - paidAmount;
    } else if (input.payment_type === 'DP_50') {
      paidAmount = Math.round(totalGrandWithCatering * 0.5);
      remainingAmount = totalGrandWithCatering - paidAmount;
    } else {
      paidAmount = totalGrandWithCatering;
      remainingAmount = 0;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `VLA-${randomSuffix}`;

    const newBooking = await db.booking.create({
      data: {
        booking_code: bookingCode,
        villa_id: input.villa_id,
        guest_name: input.guest_name,
        whatsapp_number: input.whatsapp_number,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_nights: priceRes.totalNights,
        total_base_price: priceRes.totalBasePrice,
        security_deposit_amount: priceRes.securityDeposit,
        catering_package: cateringPackageName,
        catering_amount: cateringAmount,
        special_requests: input.special_requests,
        grand_total: totalGrandWithCatering,
        payment_type: input.payment_type,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        payment_status: input.proof_of_payment_url ? 'PAID_DP' : 'PENDING',
        proof_of_payment_url: input.proof_of_payment_url,
      },
    });

    revalidatePath(`/villa/${villa.slug}`);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/calendar');

    return {
      success: true,
      bookingCode,
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}

export async function createManualBookingAction(data: {
  villa_id: string;
  guest_name: string;
  whatsapp_number: string;
  check_in_date: string;
  check_out_date: string;
  payment_type: string;
  paid_amount: number;
  payment_status: string;
  catering_package?: string;
  catering_amount?: number;
  special_requests?: string;
}) {
  try {
    const villa = await db.villa.findUnique({
      where: { id: data.villa_id },
      include: {
        special_rates: true,
        blocked_dates: true,
        bookings: true,
      },
    });

    if (!villa) {
      return { success: false, error: 'Vila tidak ditemukan.' };
    }

    const checkIn = new Date(data.check_in_date);
    const checkOut = new Date(data.check_out_date);

    const priceRes = calculateBookingPrice(villa, checkIn, checkOut);
    if (!priceRes.isValid) {
      return { success: false, error: priceRes.errorMessage || 'Tanggal tidak valid.' };
    }

    const cateringAmount = data.catering_amount || 0;
    const grandTotal = priceRes.grandTotal + cateringAmount;
    const paidAmount = data.paid_amount || Math.round(grandTotal * 0.5);
    const remainingAmount = Math.max(0, grandTotal - paidAmount);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `VLA-MANUAL-${randomSuffix}`;

    await db.booking.create({
      data: {
        booking_code: bookingCode,
        villa_id: data.villa_id,
        guest_name: data.guest_name,
        whatsapp_number: data.whatsapp_number,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_nights: priceRes.totalNights,
        total_base_price: priceRes.totalBasePrice,
        security_deposit_amount: priceRes.securityDeposit,
        catering_package: data.catering_package || null,
        catering_amount: cateringAmount,
        special_requests: data.special_requests || 'Input Manual Admin / WA Direct',
        grand_total: grandTotal,
        payment_type: data.payment_type || 'DP_50',
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        payment_status: data.payment_status || 'PAID_DP',
      },
    });

    revalidatePath(`/villa/${villa.slug}`);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/calendar');

    return { success: true, bookingCode };
  } catch (error) {
    console.error('Error creating manual booking:', error);
    return { success: false, error: 'Gagal membuat booking manual.' };
  }
}

export async function updateBookingStatusAction(bookingId: string, paymentStatus: string) {
  try {
    await db.booking.update({
      where: { id: bookingId },
      data: {
        payment_status: paymentStatus,
      },
    });
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal memperbarui status.' };
  }
}

export async function toggleDepositRefundAction(bookingId: string, refundedStatus: boolean) {
  try {
    await db.booking.update({
      where: { id: bookingId },
      data: {
        deposit_refunded: refundedStatus,
      },
    });
    revalidatePath('/admin/housekeeping');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal merubah status deposit.' };
  }
}

export async function toggleBlockedDateAction(villaId: string, dateStr: string, reason?: string) {
  try {
    const targetDate = new Date(dateStr);

    const existing = await db.calendarBlockedDate.findFirst({
      where: {
        villa_id: villaId,
        blocked_date: targetDate,
      },
    });

    if (existing) {
      await db.calendarBlockedDate.delete({
        where: { id: existing.id },
      });
    } else {
      await db.calendarBlockedDate.create({
        data: {
          villa_id: villaId,
          blocked_date: targetDate,
          reason: reason || 'Manual Admin Block',
        },
      });
    }

    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah tanggal blokir.' };
  }
}

export async function blockDateAction(villaId: string, dateStr: string, reason?: string) {
  return toggleBlockedDateAction(villaId, dateStr, reason);
}

export async function unblockDateAction(blockedIdOrVillaId: string, dateStr?: string) {
  try {
    if (dateStr) {
      await db.calendarBlockedDate.deleteMany({
        where: {
          villa_id: blockedIdOrVillaId,
          blocked_date: new Date(dateStr),
        },
      });
    } else {
      await db.calendarBlockedDate.delete({
        where: { id: blockedIdOrVillaId },
      });
    }
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuka blokir.' };
  }
}

export async function saveSpecialRateAction(
  villaId: string,
  eventName: string,
  startDateStr: string,
  endDateStr: string,
  customPrice: number,
  minStay?: number
) {
  try {
    await db.villaSpecialRate.create({
      data: {
        villa_id: villaId,
        event_name: eventName,
        start_date: new Date(startDateStr),
        end_date: new Date(endDateStr),
        custom_price_per_night: customPrice,
        min_stay_override: minStay || null,
      },
    });

    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menyimpan tarif khusus.' };
  }
}

export async function setSpecialRateAction(
  villaId: string,
  eventName: string,
  startDateStr: string,
  endDateStr: string,
  customPrice: number,
  minStay?: number
) {
  return saveSpecialRateAction(villaId, eventName, startDateStr, endDateStr, customPrice, minStay);
}

export async function deleteSpecialRateAction(rateId: string) {
  try {
    await db.villaSpecialRate.delete({
      where: { id: rateId },
    });
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus tarif khusus.' };
  }
}

export async function saveVillaAction(inputData: any) {
  try {
    let rawInput: any = {};

    if (inputData instanceof FormData) {
      const rawPhotos = inputData.getAll('photos') as string[];
      const rawAmenities = inputData.getAll('amenities') as string[];

      rawInput = {
        id: (inputData.get('id') as string) || undefined,
        title: inputData.get('title') as string,
        location_area: inputData.get('location_area') as string,
        description: inputData.get('description') as string,
        max_guests: parseInt((inputData.get('max_guests') as string) || '0', 10),
        bedrooms: parseInt((inputData.get('bedrooms') as string) || '0', 10),
        bathrooms: parseInt((inputData.get('bathrooms') as string) || '0', 10),
        base_price_weekday: parseInt((inputData.get('base_price_weekday') as string) || '0', 10),
        base_price_weekend: parseInt((inputData.get('base_price_weekend') as string) || '0', 10),
        security_deposit: parseInt((inputData.get('security_deposit') as string) || '0', 10),
        min_stay_default: parseInt((inputData.get('min_stay_default') as string) || '1', 10),
        rules_text: (inputData.get('rules_text') as string) || 'Dilarang membawa senjata tajam & narkoba.',
        google_maps_url: (inputData.get('google_maps_url') as string) || null,
        virtual_tour_url: (inputData.get('virtual_tour_url') as string) || null,
        photos: rawPhotos.filter((p) => p.trim().length > 0),
        amenities: rawAmenities.filter((a) => a.trim().length > 0),
      };
    } else {
      rawInput = inputData;
    }

    const parseResult = villaInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Input vila tidak valid.';
      return { success: false, error: firstError };
    }

    const input = parseResult.data;

    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (input.id) {
      await db.villa.update({
        where: { id: input.id },
        data: {
          title: input.title,
          slug,
          location_area: input.location_area,
          description: input.description,
          max_guests: input.max_guests,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          base_price_weekday: input.base_price_weekday,
          base_price_weekend: input.base_price_weekend,
          security_deposit: input.security_deposit,
          min_stay_default: input.min_stay_default,
          rules_text: input.rules_text,
          google_maps_url: input.google_maps_url,
        },
      });

      await db.villaPhoto.deleteMany({ where: { villa_id: input.id } });
      await db.villaAmenity.deleteMany({ where: { villa_id: input.id } });

      await db.villaPhoto.createMany({
        data: input.photos.map((url, i) => ({
          villa_id: input.id!,
          photo_url: url,
          virtual_tour_url: i === 0 ? input.virtual_tour_url : null,
          is_primary: i === 0,
        })),
      });

      await db.villaAmenity.createMany({
        data: input.amenities.map((name) => ({
          villa_id: input.id!,
          amenity_name: name,
        })),
      });
    } else {
      const newVilla = await db.villa.create({
        data: {
          title: input.title,
          slug,
          location_area: input.location_area,
          description: input.description,
          max_guests: input.max_guests,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          base_price_weekday: input.base_price_weekday,
          base_price_weekend: input.base_price_weekend,
          security_deposit: input.security_deposit,
          min_stay_default: input.min_stay_default,
          rules_text: input.rules_text,
          google_maps_url: input.google_maps_url,
        },
      });

      await db.villaPhoto.createMany({
        data: input.photos.map((url, i) => ({
          villa_id: newVilla.id,
          photo_url: url,
          virtual_tour_url: i === 0 ? input.virtual_tour_url : null,
          is_primary: i === 0,
        })),
      });

      await db.villaAmenity.createMany({
        data: input.amenities.map((name) => ({
          villa_id: newVilla.id,
          amenity_name: name,
        })),
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/villas');
    return { success: true };
  } catch (error) {
    console.error('Error saving villa:', error);
    return { success: false, error: 'Gagal menyimpan data vila.' };
  }
}

export async function upsertVillaAction(inputData: any) {
  return saveVillaAction(inputData);
}

export async function deleteVillaAction(villaId: string) {
  try {
    await db.villa.delete({
      where: { id: villaId },
    });
    revalidatePath('/');
    revalidatePath('/admin/villas');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus vila.' };
  }
}
