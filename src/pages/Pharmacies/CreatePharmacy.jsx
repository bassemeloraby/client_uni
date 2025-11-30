import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

const CreatePharmacy = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up the data - remove empty location fields if not provided
      const submitData = { ...formData };
      if (!submitData.location.latitude || !submitData.location.longitude) {
        delete submitData.location;
      }

      const response = await customFetch.post('pharmacies', submitData);

      if (response.data.success) {
        toast.success('Pharmacy created successfully!');
        navigate('/pharmacies');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Failed to create pharmacy. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-base-100 shadow-xl rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-primary">Create New Pharmacy</h1>

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
              <h2 className="card-title text-2xl mb-4">Location (Optional)</h2>
              
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
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/pharmacies')}
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
                  Creating...
                </>
              ) : (
                'Create Pharmacy'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePharmacy;

