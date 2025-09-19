import { getSession } from '@/app/(auth)/login/actions';
import { prisma } from '@/lib/prisma';

export default async function CompanyDashboard() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  // Get company stats
  const [memberCount, documentCount] = await Promise.all([
    prisma.membership.count({
      where: { companyId: session.companyId, status: 'ACTIVE' }
    }),
    prisma.document.count({
      where: { companyId: session.companyId }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to {session.companyName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your company and team members
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{memberCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">📄</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{documentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-md flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400">🏢</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{session.companyName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-md flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400">👤</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Role</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {session.role === 'OWNER' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/company/staff"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Manage Staff</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add and manage team members</p>
            </div>
          </a>
          
          <a
            href="/company/documents"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mr-3">📄</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Upload Documents</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload and organize documents</p>
            </div>
          </a>
          
          <a
            href="/company/settings"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Company Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage company preferences</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
