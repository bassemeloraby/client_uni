import React from 'react'
import { useLoaderData, Link } from 'react-router-dom';
import { FaPlus, FaUser, FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaWhatsapp } from 'react-icons/fa';
import { customFetch } from "../../utils";
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
  
  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'badge-error',
      pharmacist: 'badge-warning',
      user: 'badge-info',
    };
    return roleColors[role] || 'badge-ghost';
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
            <Link
              key={user._id}
              to={`/users/${user._id}`}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
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
                        href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
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
              </div>
            </Link>
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

