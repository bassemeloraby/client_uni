import React, { useState, useEffect } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

export const loader = async ({ params }) => {
  try {
    const response = await customFetch.get(`baby-joy/${params.id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch baby joy item');
  } catch (error) {
    console.error('Error fetching baby joy item:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch baby joy item');
  }
};

const EditBabyJoy = () => {
  const navigate = useNavigate();
  const babyJoyItem = useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Material: '',
    SapDescription: '',
    Brand: 'Baby Joy',
    Price: '',
    MaterialDetail: '',
    UnitsInCartoon: '',
    NumberOfBacket: '',
    Form: '',
  });

  // Populate form with existing baby joy data
  useEffect(() => {
    if (babyJoyItem) {
      setFormData({
        Material: babyJoyItem.Material || '',
        SapDescription: babyJoyItem.SapDescription || '',
        Brand: babyJoyItem.Brand || 'Baby Joy',
        Price: babyJoyItem.Price || '',
        MaterialDetail: babyJoyItem.MaterialDetail || '',
        UnitsInCartoon: babyJoyItem.UnitsInCartoon || '',
        NumberOfBacket: babyJoyItem.NumberOfBacket || '',
        Form: babyJoyItem.Form || '',
      });
    }
  }, [babyJoyItem]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields
    if (['Material', 'Price', 'UnitsInCartoon', 'NumberOfBacket'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.Material || !formData.SapDescription || !formData.Price) {
        toast.error('Material, SAP Description, and Price are required');
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        ...formData,
        Material: parseInt(formData.Material),
        Price: parseFloat(formData.Price),
        UnitsInCartoon: formData.UnitsInCartoon ? parseInt(formData.UnitsInCartoon) : undefined,
        NumberOfBacket: formData.NumberOfBacket ? parseInt(formData.NumberOfBacket) : undefined,
      };

      // Remove empty fields
      Object.keys(submitData).forEach(
        (key) => submitData[key] === '' || submitData[key] === undefined ? delete submitData[key] : {}
      );

      const response = await customFetch.put(`baby-joy/${babyJoyItem._id}`, submitData);

      if (response.data.success) {
        toast.success('Baby Joy item updated successfully!');
        navigate('/baby-joy');
      } else {
        toast.error(response.data.message || 'Failed to update baby joy item');
      }
    } catch (error) {
      console.error('Error updating baby joy item:', error);
      toast.error(error.response?.data?.message || 'Failed to update baby joy item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Baby Joy Item</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Material Code */}
            <div>
              <label htmlFor="Material" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Material Code *
              </label>
              <input
                type="number"
                id="Material"
                name="Material"
                value={formData.Material}
                onChange={handleChange}
                disabled
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100"
                placeholder="Enter material code"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Material code cannot be changed</p>
            </div>

            {/* SAP Description */}
            <div>
              <label htmlFor="SapDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SAP Description *
              </label>
              <textarea
                id="SapDescription"
                name="SapDescription"
                value={formData.SapDescription}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter SAP description"
              />
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="Brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand
              </label>
              <input
                type="text"
                id="Brand"
                name="Brand"
                value={formData.Brand}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter brand name"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="Price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price *
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">SAR</span>
                <input
                  type="number"
                  id="Price"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter price"
                />
              </div>
            </div>

            {/* Material Detail */}
            <div>
              <label htmlFor="MaterialDetail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Material Detail
              </label>
              <textarea
                id="MaterialDetail"
                name="MaterialDetail"
                value={formData.MaterialDetail}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter material detail"
              />
            </div>

            {/* Form/Type */}
            <div>
              <label htmlFor="Form" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Form/Type
              </label>
              <input
                type="text"
                id="Form"
                name="Form"
                value={formData.Form}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter form/type"
              />
            </div>

            {/* Units in Cartoon */}
            <div>
              <label htmlFor="UnitsInCartoon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Units in Cartoon
              </label>
              <input
                type="number"
                id="UnitsInCartoon"
                name="UnitsInCartoon"
                value={formData.UnitsInCartoon}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter units in cartoon"
              />
            </div>

            {/* Number of Basket */}
            <div>
              <label htmlFor="NumberOfBacket" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Basket
              </label>
              <input
                type="number"
                id="NumberOfBacket"
                name="NumberOfBacket"
                value={formData.NumberOfBacket}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter number of basket"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/baby-joy')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBabyJoy;
