import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaGlobe,
} from 'react-icons/fa';
import { customFetch } from '../../utils';

export const loader = async ({ params }) => {
  try {
    const response = await customFetch.get(`pharmacies/${params.id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch pharmacy');
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pharmacy');
  }
};

const SinglePharmacy = () => {
  const pharmacy = useLoaderData();

  if (!pharmacy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-2xl text-error">Pharmacy not found</p>
          <Link to="/pharmacies" className="btn btn-primary mt-4">
            <FaArrowLeft className="mr-2" />
            Back to Pharmacies
          </Link>
        </div>
      </div>
    );
  }

  const mapUrl = pharmacy.location?.latitude && pharmacy.location?.longitude
    ? `https://www.google.com/maps?q=${pharmacy.location.latitude},${pharmacy.location.longitude}`
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          to="/pharmacies"
          className="btn btn-ghost gap-2 mb-4"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Pharmacies
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-2">{pharmacy.name}</h1>
              {pharmacy.description && (
                <p className="text-lg text-base-content/70">{pharmacy.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pharmacy.isActive ? (
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
            </div>
          </div>

          <div className="divider"></div>

          {/* Address Section */}
          {pharmacy.address && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                Address
              </h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-lg font-medium">{pharmacy.address.street}</p>
                <p className="text-base">
                  {pharmacy.address.city}
                  {pharmacy.address.state && `, ${pharmacy.address.state}`}
                  {pharmacy.address.zipCode && ` ${pharmacy.address.zipCode}`}
                </p>
                {pharmacy.address.country && (
                  <p className="text-base">{pharmacy.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(pharmacy.contact?.phone || pharmacy.contact?.email) && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-base-200 p-4 rounded-lg space-y-3">
                {pharmacy.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary text-xl" />
                    <a
                      href={`tel:${pharmacy.contact.phone}`}
                      className="text-lg hover:text-primary transition-colors"
                    >
                      {pharmacy.contact.phone}
                    </a>
                  </div>
                )}
                {pharmacy.contact?.email && (
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-primary text-xl" />
                    <a
                      href={`mailto:${pharmacy.contact.email}`}
                      className="text-lg hover:text-primary transition-colors"
                    >
                      {pharmacy.contact.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working Hours */}
          {pharmacy.workingHours && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaClock className="text-primary" />
                Working Hours
              </h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-lg font-medium mb-2">
                  {pharmacy.workingHours.open} - {pharmacy.workingHours.close}
                </p>
                {pharmacy.workingHours.days && pharmacy.workingHours.days.length > 0 && (
                  <div>
                    <p className="text-base font-medium mb-1">Open on:</p>
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.workingHours.days.map((day, index) => (
                        <span key={index} className="badge badge-primary">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {pharmacy.location?.latitude && pharmacy.location?.longitude && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-base mb-3">
                  <span className="font-medium">Coordinates:</span>{' '}
                  {pharmacy.location.latitude.toFixed(6)}, {pharmacy.location.longitude.toFixed(6)}
                </p>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary gap-2"
                  >
                    <FaGlobe className="h-4 w-4" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-base-content/60">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {pharmacy.createdAt
                  ? new Date(pharmacy.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
              {pharmacy.updatedAt && (
                <p className="mt-1">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(pharmacy.updatedAt).toLocaleDateString('en-US', {
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

export default SinglePharmacy;

