import React, { useState } from 'react';
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaEdit,
  FaShieldAlt,
  FaWhatsapp,
  FaTrash,
} from 'react-icons/fa';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

export const loader = async ({ params }) => {
  try {
    const response = await customFetch.get(`users/${params.id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch user');
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

const SingleUser = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-2xl text-error">User not found</p>
          <Link to="/users" className="btn btn-primary mt-4">
            <FaArrowLeft className="mr-2" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'badge-error',
      pharmacist: 'badge-warning',
      user: 'badge-info',
    };
    return roleColors[role] || 'badge-ghost';
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await customFetch.delete(`users/${user._id}`);
      
      if (response.data.success) {
        toast.success(`User ${user.firstName} ${user.lastName} deleted successfully!`);
        navigate('/users');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      toast.error(errorMessage);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/users"
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/users/${user._id}/edit`}
            className="btn btn-primary gap-2"
          >
            <FaEdit className="h-4 w-4" />
            Edit User
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-error gap-2"
            disabled={isDeleting}
          >
            <FaTrash className="h-4 w-4" />
            Delete User
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error mb-4">Delete User</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>?
            </p>
            <p className="text-sm text-base-content/70 mb-4">
              This action cannot be undone. All data associated with this user will be permanently deleted.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error gap-2"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-20">
                  <span className="text-3xl">
                    {user.firstName?.[0]?.toUpperCase() || 'U'}
                    {user.lastName?.[0]?.toUpperCase() || ''}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-base-content/70">@{user.username}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {user.isActive ? (
                <div className="badge badge-success gap-2">
                  <FaCheckCircle />
                  Active
                </div>
              ) : (
                <div className="badge badge-error gap-2">
                  <FaTimesCircle />
                  Inactive
                </div>
              )}
              <span className={`badge ${getRoleBadge(user.role)} badge-lg`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Contact Information */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="bg-base-200 p-4 rounded-lg space-y-3">
              {user.email && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-primary text-xl" />
                  <a
                    href={`mailto:${user.email}`}
                    className="text-lg hover:text-primary transition-colors"
                  >
                    {user.email}
                  </a>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <FaPhone className="text-primary text-xl" />
                  <a
                    href={`tel:${user.phone}`}
                    className="text-lg hover:text-primary transition-colors"
                  >
                    {user.phone}
                  </a>
                </div>
              )}
              {user.whatsapp && (
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-green-500 text-xl" />
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(user.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg hover:text-green-500 transition-colors flex items-center gap-2"
                  >
                    {user.whatsapp}
                    <span className="text-xs text-base-content/60">(Click to chat on WhatsApp)</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          {user.address && (user.address.street || user.address.city) && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                Address
              </h2>
              <div className="bg-base-200 p-4 rounded-lg">
                {user.address.street && (
                  <p className="text-lg font-medium">{user.address.street}</p>
                )}
                <p className="text-base">
                  {user.address.city}
                  {user.address.state && `, ${user.address.state}`}
                  {user.address.zipCode && ` ${user.address.zipCode}`}
                </p>
                {user.address.country && (
                  <p className="text-base">{user.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-base-content/60">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
              {user.updatedAt && (
                <p className="mt-1">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUser;

