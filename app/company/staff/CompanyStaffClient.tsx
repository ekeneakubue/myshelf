'use client';

import { useState, useTransition, useEffect } from 'react';
import { createCompanyStaff, updateCompanyStaff, deleteCompanyStaff } from './actions';
import { useRouter } from 'next/navigation';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'super-admin' | 'admin' | 'manager' | 'staff' | string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'INACTIVE' | string;
  createdAt: string | Date;
}

export default function CompanyStaffClient({ staffMembers }: { staffMembers: StaffMember[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedStaffName, setAddedStaffName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showNoStaffMessage, setShowNoStaffMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });

  // Show "No staff found" message after 10 seconds if still no staff
  useEffect(() => {
    if (staffMembers.length === 0) {
      const timer = setTimeout(() => {
        setShowNoStaffMessage(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    } else {
      setShowNoStaffMessage(false);
    }
  }, [staffMembers.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', formData.name);
    formDataToSubmit.append('email', formData.email);
    formDataToSubmit.append('role', formData.role);
    formDataToSubmit.append('password', formData.password);

    startTransition(async () => {
      const result = await createCompanyStaff(formDataToSubmit);
      
      if (result.success) {
        // Show success message
        setAddedStaffName(formData.name);
        setShowSuccess(true);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'staff', password: '' });
        
        // Refresh the page to show updated staff list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedStaffName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to create staff member');
      }
    });
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('staffId', editingStaff.id);
    formDataToSubmit.append('name', editFormData.name);
    formDataToSubmit.append('email', editFormData.email);
    formDataToSubmit.append('role', editFormData.role);
    formDataToSubmit.append('password', editFormData.password);

    startTransition(async () => {
      const result = await updateCompanyStaff(formDataToSubmit);
      
      if (result.success) {
        // Show success message
        setAddedStaffName(editFormData.name);
        setShowSuccess(true);
        setIsEditModalOpen(false);
        setEditingStaff(null);
        
        // Refresh the page to show updated staff list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedStaffName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to update staff member');
      }
    });
  };

  const handleDelete = (staff: StaffMember) => {
    setDeletingStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setError('');
    
    startTransition(async () => {
      const result = await deleteCompanyStaff(deletingStaff.id);
      
      if (result.success) {
        // Show success message
        setAddedStaffName(deletingStaff.name);
        setShowSuccess(true);
        setIsDeleteModalOpen(false);
        setDeletingStaff(null);
        
        // Refresh the page to show updated staff list
        router.refresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setAddedStaffName('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to delete staff member');
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

  const getRoleColor = (role: string) => {
    // Support both DB roles (OWNER | ADMIN | MEMBER) and legacy UI roles
    switch (role) {
      case 'OWNER':
      case 'super-admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'ADMIN':
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'MANAGER':
      case 'manager':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'MEMBER':
      case 'staff':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 text-sm text-green-700 dark:text-green-300">
          {addedStaffName} added successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Staff Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-sm px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Add Staff
        </button>
      </div>
      
      {staffMembers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {showNoStaffMessage ? (
              <span>No staff members found in your company</span>
            ) : (
              <>
                <span>Fetching staff list...</span>
                <div className="animate-spin w-4 h-4 border-2 border-gray-200 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400 rounded-full"></div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{staff.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(staff.role)}`}>
                      {/* Normalize display: DB roles to human-readable */}
                      {staff.role === 'OWNER' ? 'Super Admin' : staff.role === 'ADMIN' ? 'Admin' : staff.role === 'MANAGER' ? 'Manager' : staff.role === 'MEMBER' ? 'Staff' : staff.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      staff.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(staff.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="p-4 text-sm">
                    <button 
                      onClick={() => handleEdit(staff)}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(staff)}
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

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Staff Member</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Staff Member</h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStaff(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 h-10 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Updating...' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Staff Member</h2>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingStaff(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete <strong>{deletingStaff?.name}</strong>? This action cannot be undone.
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingStaff(null);
                  }}
                  className="flex-1 h-10 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Deleting...' : 'Delete Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
