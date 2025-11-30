import React, { useState, useEffect } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
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

const EditPharmacy = () => {
  const navigate = useNavigate();
  const pharmacy = useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Egypt',
    },
    contact: {
      phone: '',
      email: '',
    },
    workingHours: {
      open: '09:00',
      close: '22:00',
      days: [],
    },
    location: {
      latitude: '',
      longitude: '',
    },
    isActive: true,
    description: '',
  });

  // Populate form with existing pharmacy data
  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        address: {
          street: pharmacy.address?.street || '',
          city: pharmacy.address?.city || '',
          state: pharmacy.address?.state || '',
          zipCode: pharmacy.address?.zipCode || '',
          country: pharmacy.address?.country || 'Egypt',
        },
        contact: {
          phone: pharmacy.contact?.phone || '',
          email: pharmacy.contact?.email || '',
        },
        workingHours: {
          open: pharmacy.workingHours?.open || '09:00',
          close: pharmacy.workingHours?.close || '22:00',
          days: pharmacy.workingHours?.days || [],
        },
        location: {
          latitude: pharmacy.location?.latitude || '',
          longitude: pharmacy.location?.longitude || '',
        },
        isActive: pharmacy.isActive !== undefined ? pharmacy.isActive : true,
        description: pharmacy.description || '',
      });
    }
  }, [pharmacy]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else if (name === 'days') {
      const day = value;
      setFormData((prev) => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          days: prev.workingHours.days.includes(day)
            ? prev.workingHours.days.filter((d) => d !== day)
            : [...prev.workingHours.days, day],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value ? parseFloat(value) : '',
      },
    }));
  };

  const reverseGeocode = async (latitude, longitude, showToast = true) => {
    try {
      setIsGettingAddress(true);
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UNI-Pharmacy-App', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Build complete street address with house number, building, and road name
        let streetAddress = '';
        const streetParts = [];
        
        // Add house number if available
        if (address.house_number) {
          streetParts.push(address.house_number);
        }
        
        // Add building name if available
        if (address.building) {
          streetParts.push(address.building);
        }
        
        // Add road name (most common)
        if (address.road) {
          streetParts.push(address.road);
        } else if (address.pedestrian) {
          streetParts.push(address.pedestrian);
        } else if (address.footway) {
          streetParts.push(address.footway);
        } else if (address.path) {
          streetParts.push(address.path);
        } else if (address.street) {
          streetParts.push(address.street);
        } else if (address.residential) {
          streetParts.push(address.residential);
        }
        
        // Combine all street parts
        streetAddress = streetParts.join(' ').trim();
        
        // If still empty, try using the display name as fallback
        if (!streetAddress && data.display_name) {
          const displayParts = data.display_name.split(',');
          streetAddress = displayParts[0] || '';
        }
        
        setFormData((prev) => ({
          ...prev,
          address: {
            street: streetAddress,
            city: address.city || address.town || address.village || address.municipality || address.county || prev.address.city,
            state: address.state || address.region || address.province || prev.address.state,
            zipCode: address.postcode || prev.address.zipCode,
            country: address.country || prev.address.country || 'Egypt',
          },
        }));
        if (showToast) {
          toast.success('Street address and location information retrieved successfully!');
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      if (showToast) {
        toast.warning('Could not retrieve address from location. Please fill manually.');
      }
    } finally {
      setIsGettingAddress(false);
    }
  };

  const getAddressFromCoordinates = () => {
    const { latitude, longitude } = formData.location;
    
    if (!latitude || !longitude) {
      toast.error('Please enter both latitude and longitude first');
      return;
    }

    reverseGeocode(latitude, longitude, true);
  };

  const geocodeAddress = async () => {
    const { street, city, state, zipCode, country } = formData.address;
    
    if (!street || !city) {
      toast.error('Please enter at least street address and city first');
      return;
    }

    try {
      setIsGettingLocation(true);
      
      // Build address string for geocoding
      const addressParts = [street, city];
      if (state) addressParts.push(state);
      if (zipCode) addressParts.push(zipCode);
      if (country) addressParts.push(country);
      
      const addressString = addressParts.join(', ');
      
      // Using OpenStreetMap Nominatim API for forward geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UNI-Pharmacy-App', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(parseFloat(result.lat).toFixed(6));
        const lon = parseFloat(parseFloat(result.lon).toFixed(6));
        
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: lat,
            longitude: lon,
          },
        }));
        
        toast.success('Coordinates retrieved from address successfully!');
      } else {
        toast.warning('Could not find coordinates for this address. Please enter coordinates manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to get coordinates from address. Please enter coordinates manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const lat = parseFloat(latitude.toFixed(6));
        const lon = parseFloat(longitude.toFixed(6));
        
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: lat,
            longitude: lon,
          },
        }));
        
        toast.success('Location retrieved successfully!');
        
        // Get address from coordinates
        await reverseGeocode(lat, lon, false);
        
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up the data - remove empty location fields if not provided
      const submitData = { ...formData };
      if (!submitData.location.latitude || !submitData.location.longitude) {
        delete submitData.location;
      }

      const response = await customFetch.put(`pharmacies/${pharmacy._id}`, submitData);

      if (response.data.success) {
        toast.success('Pharmacy updated successfully!');
        navigate(`/pharmacies/${pharmacy._id}`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Failed to update pharmacy. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pharmacy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-2xl text-error">Pharmacy not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-base-100 shadow-xl rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-primary">Edit Pharmacy</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Basic Information</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Pharmacy Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter pharmacy name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter pharmacy description"
                  rows="3"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">Active Status</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="toggle toggle-primary"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Address Information</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Street Address *</span>
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">City *</span>
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">State</span>
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Zip Code</span>
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter zip code"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Country</span>
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Contact Information</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Working Hours</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Opening Time</span>
                  </label>
                  <input
                    type="time"
                    name="workingHours.open"
                    value={formData.workingHours.open}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Closing Time</span>
                  </label>
                  <input
                    type="time"
                    name="workingHours.close"
                    value={formData.workingHours.close}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-semibold">Working Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="label cursor-pointer">
                      <span className="label-text mr-2">{day}</span>
                      <input
                        type="checkbox"
                        checked={formData.workingHours.days.includes(day)}
                        onChange={() => {
                          const newDays = formData.workingHours.days.includes(day)
                            ? formData.workingHours.days.filter((d) => d !== day)
                            : [...formData.workingHours.days, day];
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              days: newDays,
                            },
                          }));
                        }}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location (Optional) */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-2xl">Location (Optional)</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={isGettingLocation || !formData.address.street || !formData.address.city}
                    className="btn btn-sm btn-primary gap-2"
                    title="Get coordinates from the address above"
                  >
                    {isGettingLocation ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Getting...
                      </>
                    ) : (
                      <>
                        <FaMapMarkerAlt className="h-4 w-4" />
                        Get from Address
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="btn btn-sm btn-outline btn-primary gap-2"
                    title="Get your current GPS location"
                  >
                    <FaMapMarkerAlt className="h-4 w-4" />
                    My Location
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Latitude</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.location.latitude}
                    onChange={handleLocationChange}
                    step="any"
                    className="input input-bordered w-full"
                    placeholder="Enter latitude"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Longitude</span>
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.location.longitude}
                    onChange={handleLocationChange}
                    step="any"
                    className="input input-bordered w-full"
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
              
              {formData.location.latitude && formData.location.longitude && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={getAddressFromCoordinates}
                    disabled={isGettingAddress}
                    className="btn btn-sm btn-outline btn-primary gap-2 w-full"
                  >
                    {isGettingAddress ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Getting Address...
                      </>
                    ) : (
                      <>
                        <FaMapMarkerAlt className="h-4 w-4" />
                        Get Address from Coordinates
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/pharmacies/${pharmacy._id}`)}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Pharmacy'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPharmacy;

