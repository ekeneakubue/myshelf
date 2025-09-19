'use client';

import { useState, useTransition } from 'react';
import { createCompany, updateCompany, deleteCompany } from './actions';
import { useRouter } from 'next/navigation';

export default function CompaniesClient({ companies }: { companies: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedCompanyName, setAddedCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'FREE',
    logoUrl: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    role: 'admin'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    plan: 'FREE',
    logoUrl: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    role: 'admin'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', formData.name);
    formDataToSubmit.append('slug', formData.slug);
    formDataToSubmit.append('plan', formData.plan);
    if (logoFile) {
      formDataToSubmit.append('logo', logoFile);
    }
    formDataToSubmit.append('ownerEmail', formData.ownerEmail);
    formDataToSubmit.append('ownerName', formData.ownerName);
    formDataToSubmit.append('ownerPassword', formData.ownerPassword);

    startTransition(async () => {
      const result = await createCompany(formDataToSubmit);
      
      if (result.success) {
        // Show success message
        setAddedCompanyName(formData.name);
        setShowSuccess(true);
        setIsModalOpen(false);
        setFormData({ name: '', slug: '', plan: 'FREE', logoUrl: '', ownerEmail: '', ownerName: '', ownerPassword: '', role: 'admin' });
        setLogoFile(null);
        
        // Refresh the page to show updated companies list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedCompanyName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to create company');
      }
    });
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setEditFormData({
      name: company.name,
      slug: company.slug,
      plan: company.plan,
      logoUrl: company.logoUrl || '',
      ownerName: company.owner?.name || '',
      ownerEmail: company.owner?.email || '',
      ownerPassword: '',
      role: company.owner?.role === 'OWNER' ? 'super-admin' : 'admin'
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (company: any) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setError('');
    
    startTransition(async () => {
      const result = await deleteCompany(deletingCompany.id);
      
      if (result.success) {
        // Show success message
        setAddedCompanyName(deletingCompany.name);
        setShowSuccess(true);
        setIsDeleteModalOpen(false);
        setDeletingCompany(null);
        
        // Refresh the page to show updated companies list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedCompanyName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to delete company');
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('companyId', editingCompany.id);
    formDataToSubmit.append('name', editFormData.name);
    formDataToSubmit.append('slug', editFormData.slug);
    formDataToSubmit.append('plan', editFormData.plan);
    // For edit, keep supporting URL-based update for now
    if (editFormData.logoUrl) {
      formDataToSubmit.append('logoUrl', editFormData.logoUrl);
    }
    formDataToSubmit.append('ownerName', editFormData.ownerName);
    formDataToSubmit.append('ownerEmail', editFormData.ownerEmail);
    formDataToSubmit.append('ownerPassword', editFormData.ownerPassword);
    formDataToSubmit.append('role', editFormData.role);

    startTransition(async () => {
      const result = await updateCompany(formDataToSubmit);
      
      if (result.success) {
        // Show success message
        setAddedCompanyName(editFormData.name);
        setShowSuccess(true);
        setIsEditModalOpen(false);
        setEditingCompany(null);
        
        // Refresh the page to show updated companies list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedCompanyName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to update company');
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="text-green-600 dark:text-green-400">✓</div>
            <span className="text-green-700 dark:text-green-300 font-medium">
              {addedCompanyName} added successfully!
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Companies</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-black/60 dark:text-white/70">
            {companies.length} companies
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Add Company
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none text-sm flex-1 max-w-md"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 text-sm text-black/60 dark:text-white/70">
          {searchTerm ? 'No companies found matching your search.' : 'No companies found.'}
        </div>
      ) : (
        <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/[.02] dark:bg-white/[.02] border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Company</th>
                <th className="text-left p-4 text-sm font-medium">Company Admin</th>
                <th className="text-left p-4 text-sm font-medium">Plan</th>
                <th className="text-left p-4 text-sm font-medium">Members</th>
                <th className="text-left p-4 text-sm font-medium">Documents</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[.01] dark:hover:bg-white/[.01]">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{company.name}</div>
                      <div className="text-xs text-black/60 dark:text-white/60">/{company.slug}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {company.owner ? (
                      <div>
                        <div>{company.owner.name || 'No name'}</div>
                        <div className="text-xs text-black/60 dark:text-white/60">{company.owner.email}</div>
                      </div>
                    ) : (
                      <span className="text-black/60 dark:text-white/60">No company admin</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      company.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                      company.plan === 'TEAM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                      company.plan === 'PRO' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {company.plan}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-black/70 dark:text-white/70">{company.memberCount}</td>
                  <td className="p-4 text-sm text-black/70 dark:text-white/70">{company.documentCount}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      company.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-black/70 dark:text-white/70">
                    {new Date(company.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="p-4 text-sm">
                    <a 
                      href={`/admin/company/${company.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
                    >
                      View
                    </a>
                    <button 
                      onClick={() => handleEdit(company)}
                      className="text-green-600 dark:text-green-400 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(company)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Company</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  required
                />
                </div>
                
                <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  placeholder="company-slug"
                  required
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="w-full h-10 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-black/10 dark:file:bg-white/10"
                />
                </div>
                
                <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  required
                >
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="TEAM">Team</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Company Admin</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Email</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Password</label>
                    <input
                      type="password"
                      name="ownerPassword"
                      value={formData.ownerPassword}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Company</h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCompany(null);
                }}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={editFormData.slug}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  placeholder="company-slug"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  name="plan"
                  value={editFormData.plan}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                  required
                >
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="TEAM">Team</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Company Admin</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={editFormData.ownerName}
                      onChange={handleEditInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Email</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={editFormData.ownerEmail}
                      onChange={handleEditInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Admin Password</label>
                    <input
                      type="password"
                      name="ownerPassword"
                      value={editFormData.ownerPassword}
                      onChange={handleEditInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                      className="w-full h-10 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCompany(null);
                  }}
                  className="flex-1 h-10 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Updating...' : 'Update Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Company Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Company</h2>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCompany(null);
                }}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              
              <div className="text-sm text-black/70 dark:text-white/70">
                Are you sure you want to delete <strong>{deletingCompany?.name}</strong>? This action cannot be undone and will remove:
              </div>
              
              <ul className="text-sm text-black/60 dark:text-white/60 ml-4">
                <li>• The company and all its data</li>
                <li>• All {deletingCompany?.memberCount || 0} staff members</li>
                <li>• All {deletingCompany?.documentCount || 0} documents</li>
              </ul>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingCompany(null);
                  }}
                  className="flex-1 h-10 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Deleting...' : 'Delete Company'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
