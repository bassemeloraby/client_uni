import React, { useState } from 'react'
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaUser, FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaWhatsapp, FaLock, FaSave } from 'react-icons/fa';
import { customFetch } from "../../utils";
import { availablePages } from "../../utils/availablePages";
import { toast } from 'react-toastify';
const url = "users";


export const loader = async ({ request }) => {
  try {
    const response = await customFetch.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch users");
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

const Users = () => {
  const users = useLoaderData();
  const navigate = useNavigate();
  const [editingUserId, setEditingUserId] = useState(null);
  const [userPagePermissions, setUserPagePermissions] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize page permissions state from users data
  React.useEffect(() => {
    const permissions = {};
    users.forEach(user => {
      permissions[user._id] = user.allowedPages || [];
    });
    setUserPagePermissions(permissions);
  }, [users]);

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'badge-error',
      pharmacist: 'badge-warning',
      user: 'badge-info',
    };
    return roleColors[role] || 'badge-ghost';
  };

  // Format WhatsApp number for link
  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    // Remove all non-numeric characters
    let cleaned = number.replace(/[^0-9]/g, '');
    
    // If number starts with 0, replace with 966 (Saudi Arabia country code)
    if (cleaned.startsWith('0')) {
      cleaned = '966' + cleaned.substring(1);
    }
    // If number already starts with country code (966), keep it
    // If it doesn't start with country code and doesn't start with 0, check if it needs country code
    if (!cleaned.startsWith('966') && cleaned.length > 0) {
      // If it's a local Saudi number (9 digits starting with 5), add 966
      if (cleaned.length === 9 && cleaned.startsWith('5')) {
        cleaned = '966' + cleaned;
      }
      // If it's a local Saudi number (10 digits starting with 05), remove leading 0 and add 966
      if (cleaned.length === 10 && cleaned.startsWith('05')) {
        cleaned = '966' + cleaned.substring(1);
      }
    }
    
    return cleaned;
  };

  const handlePageToggle = (userId, pagePath) => {
    setUserPagePermissions(prev => {
      const currentPages = prev[userId] || [];
      const newPages = currentPages.includes(pagePath)
        ? currentPages.filter(p => p !== pagePath)
        : [...currentPages, pagePath];
      return { ...prev, [userId]: newPages };
    });
  };

  const handleSavePermissions = async (userId) => {
    setIsSaving(true);
    try {
      const pagesToSave = userPagePermissions[userId] || [];
      const response = await customFetch.put(`users/${userId}`, {
        allowedPages: pagesToSave
      });

      if (response.data.success) {
        toast.success('Page permissions updated successfully!');
        setEditingUserId(null);
        // Reload the page to refresh user data
        window.location.reload();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update permissions';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (userId) => {
    // Reset to original permissions
    const user = users.find(u => u._id === userId);
    setUserPagePermissions(prev => ({
      ...prev,
      [userId]: user?.allowedPages || []
    }));
    setEditingUserId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-6xl font-bold text-blue-500'>Users</h1>
        <Link
          to="/users/create"
          className="btn btn-primary gap-2"
        >
          <FaPlus className="h-5 w-5" />
          Create User
        </Link>
      </div>

      {users && users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="text-xl">
                          {user.firstName?.[0]?.toUpperCase() || 'U'}
                          {user.lastName?.[0]?.toUpperCase() || ''}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h2 className="card-title text-xl">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="text-sm text-base-content/70">@{user.username}</p>
                    </div>
                  </div>
                  {user.isActive ? (
                    <FaCheckCircle className="text-green-500 text-xl" title="Active" />
                  ) : (
                    <FaTimesCircle className="text-red-500 text-xl" title="Inactive" />
                  )}
                </div>

                <div className="space-y-2">
                  {/* Email */}
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-primary" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {user.whatsapp && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(user.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 hover:text-green-500 transition-colors"
                      >
                        <FaWhatsapp className="text-green-500" />
                        <span className="text-sm">{user.whatsapp}</span>
                      </a>
                    </div>
                  )}

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-primary" />
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Address */}
                  {user.address?.city && (
                    <div className="text-sm text-base-content/70">
                      📍 {user.address.city}
                      {user.address.country && `, ${user.address.country}`}
                    </div>
                  )}
                </div>

                {/* Page Permissions Section - Only show for non-admin users or allow admin to manage all */}
                {user.role !== 'admin' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaLock className="text-primary" />
                        <span className="font-semibold text-sm">Page Access</span>
                      </div>
                      {editingUserId === user._id ? (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => handleSavePermissions(user._id)}
                            disabled={isSaving}
                          >
                            <FaSave className="h-3 w-3" />
                            Save
                          </button>
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => handleCancelEdit(user._id)}
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingUserId(user._id);
                          }}
                        >
                          Manage
                        </button>
                      )}
                    </div>
                    
                    {editingUserId === user._id ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availablePages.map((page) => {
                          const isChecked = (userPagePermissions[user._id] || []).includes(page.path);
                          return (
                            <label
                              key={page.path}
                              className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary"
                                checked={isChecked}
                                onChange={() => handlePageToggle(user._id, page.path)}
                              />
                              <span className="text-sm">{page.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-base-content/60">
                        {user.allowedPages && user.allowedPages.length > 0 ? (
                          <span>{user.allowedPages.length} page(s) allowed</span>
                        ) : (
                          <span className="text-warning">No pages assigned</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    to={`/users/${user._id}`}
                    className="btn btn-sm btn-outline btn-primary w-full"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">No users found</p>
          <Link to="/users/create" className="btn btn-primary gap-2">
            <FaPlus className="h-5 w-5" />
            Create Your First User
          </Link>
        </div>
      )}
    </div>
  )
}

export default Users

