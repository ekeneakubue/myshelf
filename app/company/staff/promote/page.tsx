import { promoteEmailToAdmin, promoteEmailToSuperAdmin } from '../actions';
import { redirect } from 'next/navigation';

type PromoteSearchParams = { email?: string; to?: 'admin' | 'super-admin' };

export default async function PromotePage({ searchParams }: { searchParams?: PromoteSearchParams }) {
  const email = searchParams?.email || '';
  const to = searchParams?.to || 'admin';
  if (!email) {
    return (
      <div className="p-6 text-sm">
        Provide an email query param, e.g. /company/staff/promote?email=user@example.com&to=super-admin
      </div>
    );
  }

  if (to === 'super-admin') {
    await promoteEmailToSuperAdmin(email);
  } else {
    await promoteEmailToAdmin(email);
  }
  // Redirect back to staff page after operation
  redirect('/company/staff');
}


