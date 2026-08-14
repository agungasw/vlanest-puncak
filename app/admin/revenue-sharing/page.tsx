import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getRevenueSharingData } from '@/lib/revenueSharingActions';
import RevenueSharingClient from './RevenueSharingClient';

export default async function RevenueSharingPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect('/admin/login');
  }

  const villasData = await getRevenueSharingData();

  return <RevenueSharingClient villasData={villasData || []} />;
}
