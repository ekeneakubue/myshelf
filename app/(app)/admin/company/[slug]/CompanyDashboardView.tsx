'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  memberships: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Props {
  company: Company;
  memberCount: number;
  documentCount: number;
}

export default function CompanyDashboardView({ company, memberCount, documentCount }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = company.memberships.filter(member =>
    member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'MEMBER':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'MEMBER':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {company.name} Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Company overview and team management
          </p>
        </div>
        <Link
          href="/companies"
          className="text-sm px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          ← Back to Companies
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{company.plan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
            <p className="text-gray-900 dark:text-white">{company.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Slug</label>
            <p className="text-gray-900 dark:text-white">/{company.slug}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              company.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {company.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
            <p className="text-gray-900 dark:text-white">
              {new Date(company.createdAt).toISOString().split('T')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
            />
          </div>
        </div>
        
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No team members found matching your search.' : 'No team members found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((membership) => (
                  <tr key={membership.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {membership.user.name || 'No name'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {membership.user.email}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleColor(membership.role)}`}>
                        {getRoleName(membership.role)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">View only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
