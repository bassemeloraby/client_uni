import React, { useState, useEffect } from 'react';
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaGlobe,
  FaEdit,
  FaUser,
  FaUserPlus,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

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
  const navigate = useNavigate();
  const [showPharmacistModal, setShowPharmacistModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pharmacists, setPharmacists] = useState([]);
  const [isLoadingPharmacists, setIsLoadingPharmacists] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (showPharmacistModal) {
      fetchPharmacists();
    }
  }, [showPharmacistModal]);

  const fetchPharmacists = async () => {
    setIsLoadingPharmacists(true);
    try {
      const response = await customFetch.get('users?role=pharmacist&isActive=true');
      if (response.data.success) {
        setPharmacists(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      toast.error('Failed to fetch pharmacists');
    } finally {
      setIsLoadingPharmacists(false);
    }
  };

  const handleAssignPharmacist = async (pharmacistId) => {
    setIsAssigning(true);
    try {
      const response = await customFetch.put(`pharmacies/${pharmacy._id}`, {
        pharmacist: pharmacistId,
      });

      if (response.data.success) {
        toast.success('Pharmacist assigned successfully!');
        setShowPharmacistModal(false);
        // Reload the page to show updated data
        navigate(0);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to assign pharmacist. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemovePharmacist = async () => {
    setIsAssigning(true);
    try {
      const response = await customFetch.put(`pharmacies/${pharmacy._id}`, {
        pharmacist: null,
      });

      if (response.data.success) {
        toast.success('Pharmacist removed successfully!');
        // Reload the page to show updated data
        navigate(0);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to remove pharmacist. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  // Format WhatsApp number for link
  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    let cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '966' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('966') && cleaned.length > 0) {
      if (cleaned.length === 9 && cleaned.startsWith('5')) {
        cleaned = '966' + cleaned;
      }
      if (cleaned.length === 10 && cleaned.startsWith('05')) {
        cleaned = '966' + cleaned.substring(1);
      }
    }
    return cleaned;
  };

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
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/pharmacies"
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Pharmacies
        </Link>
        <Link
          to={`/pharmacies/${pharmacy._id}/edit`}
          className="btn btn-primary gap-2"
        >
          <FaEdit className="h-4 w-4" />
          Edit Pharmacy
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

          {/* Pharmacist Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FaUser className="text-primary" />
                Assigned Pharmacist
              </h2>
              <button
                onClick={() => setShowPharmacistModal(true)}
                className="btn btn-sm btn-primary gap-2"
                disabled={isAssigning}
              >
                <FaUserPlus />
                {pharmacy.pharmacist ? 'Change Pharmacist' : 'Assign Pharmacist'}
              </button>
            </div>
            {pharmacy.pharmacist ? (
              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-12">
                          <span className="text-lg">
                            {pharmacy.pharmacist.firstName?.[0]?.toUpperCase() || 'P'}
                            {pharmacy.pharmacist.lastName?.[0]?.toUpperCase() || ''}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {pharmacy.pharmacist.firstName} {pharmacy.pharmacist.lastName}
                        </h3>
                        <p className="text-sm text-base-content/70">@{pharmacy.pharmacist.username}</p>
                      </div>
                    </div>
                    <div className="ml-16 space-y-2">
                      {pharmacy.pharmacist.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaEnvelope className="text-primary" />
                          <a
                            href={`mailto:${pharmacy.pharmacist.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {pharmacy.pharmacist.email}
                          </a>
                        </div>
                      )}
                      {pharmacy.pharmacist.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaPhone className="text-primary" />
                          <a
                            href={`tel:${pharmacy.pharmacist.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {pharmacy.pharmacist.phone}
                          </a>
                        </div>
                      )}
                      {pharmacy.pharmacist.whatsapp && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaWhatsapp className="text-green-500" />
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(pharmacy.pharmacist.whatsapp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-500 transition-colors"
                          >
                            {pharmacy.pharmacist.whatsapp}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRemoveModal(true)}
                    className="btn btn-sm btn-ghost text-error gap-2"
                    disabled={isAssigning}
                    title="Remove pharmacist"
                  >
                    <FaTimes />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-base-200 p-4 rounded-lg text-center text-base-content/70">
                <p>No pharmacist assigned to this pharmacy</p>
              </div>
            )}
          </div>

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

      {/* Pharmacist Selection Modal */}
      {showPharmacistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Select Pharmacist</h2>
              <button
                onClick={() => setShowPharmacistModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <FaTimes />
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              {isLoadingPharmacists ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : pharmacists.length > 0 ? (
                <div className="space-y-3">
                  {pharmacists.map((pharmacist) => (
                    <div
                      key={pharmacist._id}
                      className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-12">
                                <span className="text-lg">
                                  {pharmacist.firstName?.[0]?.toUpperCase() || 'P'}
                                  {pharmacist.lastName?.[0]?.toUpperCase() || ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {pharmacist.firstName} {pharmacist.lastName}
                              </h3>
                              <p className="text-sm text-base-content/70">@{pharmacist.username}</p>
                              {pharmacist.email && (
                                <p className="text-sm text-base-content/60">{pharmacist.email}</p>
                              )}
                              {pharmacist.phone && (
                                <p className="text-sm text-base-content/60">{pharmacist.phone}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignPharmacist(pharmacist._id)}
                            className="btn btn-primary btn-sm gap-2"
                            disabled={isAssigning || pharmacy.pharmacist?._id === pharmacist._id}
                          >
                            {pharmacy.pharmacist?._id === pharmacist._id ? (
                              'Current'
                            ) : (
                              <>
                                <FaUserPlus />
                                Assign
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/70">
                  <p>No pharmacists available</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setShowPharmacistModal(false)}
                className="btn btn-outline w-full"
                disabled={isAssigning}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Pharmacist Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Remove Pharmacist</h2>
              <p className="text-base-content/70 mb-6">
                Are you sure you want to remove{' '}
                <span className="font-semibold">
                  {pharmacy.pharmacist?.firstName} {pharmacy.pharmacist?.lastName}
                </span>{' '}
                from this pharmacy?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="btn btn-outline"
                  disabled={isAssigning}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowRemoveModal(false);
                    await handleRemovePharmacist();
                  }}
                  className="btn btn-error gap-2"
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Removing...
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePharmacy;

