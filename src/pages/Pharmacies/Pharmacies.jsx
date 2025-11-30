import React from 'react'
import { useLoaderData, Link } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { customFetch } from "../../utils";
const url = "pharmacies";


export const loader = async ({ request }) => {
  try {
    const response = await customFetch.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch pharmacies");
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch pharmacies");
  }
};

const Pharmacies = () => {
  const pharmacies = useLoaderData();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-6xl font-bold text-blue-500'>Pharmacies</h1>
        <Link
          to="/pharmacies/create"
          className="btn btn-primary gap-2"
        >
          <FaPlus className="h-5 w-5" />
          Create Pharmacy
        </Link>
      </div>

      {pharmacies && pharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
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
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">No pharmacies found</p>
          <Link to="/pharmacies/create" className="btn btn-primary gap-2">
            <FaPlus className="h-5 w-5" />
            Create Your First Pharmacy
          </Link>
        </div>
      )}
    </div>
  )
}

export default Pharmacies