import { redirect } from 'next/navigation';
import { getSession } from '@/app/(auth)/login/actions';
import CompanyLayoutClient from './CompanyLayoutClient';

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <CompanyLayoutClient session={session}>
      {children}
    </CompanyLayoutClient>
  );
}
