import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
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
} from 'react-icons/fa';
import { customFetch } from '../../utils';

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
        <Link
          to={`/users/${user._id}/edit`}
          className="btn btn-primary gap-2"
        >
          <FaEdit className="h-4 w-4" />
          Edit User
        </Link>
      </div>

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
                    href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
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

