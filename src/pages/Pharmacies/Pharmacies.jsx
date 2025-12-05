import React, { useState } from 'react'
import { useLoaderData, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle, FaTh, FaList, FaSearch, FaTable } from 'react-icons/fa';
import { customFetch } from "../../utils";
const url = "pharmacies";


export const loader = async ({ request }) => {
  try {
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.jwt) {
      // Redirect to login if not authenticated
      throw new Response("Unauthorized", { 
        status: 401,
        statusText: "Authentication required"
      });
    }

    const response = await customFetch.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch pharmacies");
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    
    // Handle 401 errors - redirect to login
    if (error.response?.status === 401 || error.status === 401) {
      // Clear user data
      localStorage.removeItem('user');
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Response("Unauthorized", { 
        status: 401,
        statusText: "Authentication required"
      });
    }
    
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch pharmacies");
  }
};

const Pharmacies = () => {
  const pharmacies = useLoaderData();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.userRole?.toLowerCase() === 'admin';
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter pharmacies by name
  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className='text-6xl font-bold text-blue-500'>Pharmacies</h1>
          <p className="text-lg text-base-content/70 mt-2">
            {searchTerm 
              ? `Showing ${filteredPharmacies.length} of ${pharmacies.length} ${pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}`
              : `${pharmacies.length} ${pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}`
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="btn-group">
            <button
              className={`btn ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList className="h-5 w-5" />
            </button>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaTh className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Link
                  to="/pharmacies/assignments"
                  className="btn btn-secondary gap-2"
                >
                  <FaTable className="h-5 w-5" />
                  View Assignments
                </Link>
                <Link
                  to="/pharmacies/create"
                  className="btn btn-primary gap-2"
                >
                  <FaPlus className="h-5 w-5" />
                  Create Pharmacy
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by pharmacy name..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <FaSearch className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {pharmacies && pharmacies.length > 0 ? (
        filteredPharmacies.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPharmacies.map((pharmacy) => (
              <Link
                key={pharmacy._id}
                to={`/pharmacies/${pharmacy._id}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="card-title text-2xl">{pharmacy.name}</h2>
                    {pharmacy.isActive ? (
                      <FaCheckCircle className="text-green-500 text-xl" title="Active" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-xl" title="Inactive" />
                    )}
                  </div>

                  {pharmacy.description && (
                    <p className="text-base-content/70 mb-4">{pharmacy.description}</p>
                  )}

                  <div className="space-y-2">
                    {/* Address */}
                    {pharmacy.address && (
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <p>{pharmacy.address.street}</p>
                          <p>
                            {pharmacy.address.city}
                            {pharmacy.address.state && `, ${pharmacy.address.state}`}
                            {pharmacy.address.zipCode && ` ${pharmacy.address.zipCode}`}
                          </p>
                          {pharmacy.address.country && <p>{pharmacy.address.country}</p>}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="space-y-1">
                      {pharmacy.contact?.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-primary" />
                          <span className="text-sm">{pharmacy.contact.phone}</span>
                        </div>
                      )}
                      {pharmacy.contact?.email && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-primary" />
                          <span className="text-sm">{pharmacy.contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Working Hours */}
                    {pharmacy.workingHours && (
                      <div className="flex items-start gap-2">
                        <FaClock className="text-primary mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <p>
                            {pharmacy.workingHours.open} - {pharmacy.workingHours.close}
                          </p>
                          {pharmacy.workingHours.days && pharmacy.workingHours.days.length > 0 && (
                            <p className="text-base-content/70">
                              {pharmacy.workingHours.days.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {pharmacy.location?.latitude && pharmacy.location?.longitude && (
                      <div className="text-sm text-base-content/70">
                        <p>
                          📍 {pharmacy.location.latitude.toFixed(6)}, {pharmacy.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="space-y-4">
              {filteredPharmacies.map((pharmacy) => (
              <Link
                key={pharmacy._id}
                to={`/pharmacies/${pharmacy._id}`}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="card-title text-xl">{pharmacy.name}</h2>
                        {pharmacy.isActive ? (
                          <FaCheckCircle className="text-green-500 text-lg" title="Active" />
                        ) : (
                          <FaTimesCircle className="text-red-500 text-lg" title="Inactive" />
                        )}
                      </div>

                      {pharmacy.description && (
                        <p className="text-base-content/70 mb-3 line-clamp-2">{pharmacy.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {/* Address */}
                        {pharmacy.address && (
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">Address</p>
                              <p>{pharmacy.address.street}</p>
                              <p>
                                {pharmacy.address.city}
                                {pharmacy.address.state && `, ${pharmacy.address.state}`}
                                {pharmacy.address.zipCode && ` ${pharmacy.address.zipCode}`}
                              </p>
                              {pharmacy.address.country && <p>{pharmacy.address.country}</p>}
                            </div>
                          </div>
                        )}

                        {/* Contact */}
                        <div className="space-y-1">
                          <p className="font-semibold mb-1">Contact</p>
                          {pharmacy.contact?.phone && (
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-primary" />
                              <span>{pharmacy.contact.phone}</span>
                            </div>
                          )}
                          {pharmacy.contact?.email && (
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-primary" />
                              <span className="truncate">{pharmacy.contact.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Working Hours */}
                        {pharmacy.workingHours && (
                          <div className="flex items-start gap-2">
                            <FaClock className="text-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold mb-1">Hours</p>
                              <p>
                                {pharmacy.workingHours.open} - {pharmacy.workingHours.close}
                              </p>
                              {pharmacy.workingHours.days && pharmacy.workingHours.days.length > 0 && (
                                <p className="text-base-content/70 text-xs">
                                  {pharmacy.workingHours.days.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {pharmacy.location?.latitude && pharmacy.location?.longitude && (
                          <div>
                            <p className="font-semibold mb-1">Location</p>
                            <p className="text-base-content/70 text-xs">
                              📍 {pharmacy.location.latitude.toFixed(6)}, {pharmacy.location.longitude.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl text-base-content/70 mb-4">
              {searchTerm ? `No pharmacies found matching "${searchTerm}"` : 'No pharmacies found'}
            </p>
            {searchTerm && (
              <button
                className="btn btn-outline mb-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
            {!searchTerm && isAdmin && (
              <Link to="/pharmacies/create" className="btn btn-primary gap-2">
                <FaPlus className="h-5 w-5" />
                Create Your First Pharmacy
              </Link>
            )}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">No pharmacies found</p>
          {isAdmin && (
            <Link to="/pharmacies/create" className="btn btn-primary gap-2">
              <FaPlus className="h-5 w-5" />
              Create Your First Pharmacy
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Pharmacies