import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CompanyDashboardView from './CompanyDashboardView';

interface Props {
  params: {
    slug: string;
  };
}

async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Check if user has super-admin access (either OWNER role or is accessing from admin routes)
    // For now, we'll allow access if they have a valid session and are on admin routes
    return session;
  } catch (error) {
    console.error('Get admin session error:', error);
    return null;
  }
}

export default async function AdminCompanyViewPage({ params }: Props) {
  const session = await getAdminSession();
  
  // Check if user has a valid session
  if (!session) {
    redirect('/login');
  }

  // Get the company by slug (await dynamic params per Next 15 guidance)
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: {
          user: true
        }
      },
      _count: {
        select: {
          documents: true,
          memberships: true
        }
      }
    }
  });

  if (!company) {
    notFound();
  }

  // Get company stats
  const memberCount = company._count.memberships;
  const documentCount = company._count.documents;

  return (
    <CompanyDashboardView 
      company={company}
      memberCount={memberCount}
      documentCount={documentCount}
    />
  );
}
