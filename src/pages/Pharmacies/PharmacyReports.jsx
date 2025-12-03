import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaFileInvoice } from 'react-icons/fa';
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

const PharmacyReports = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/pharmacies/${pharmacy._id}`}
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Pharmacy
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-6">
            <FaChartBar className="text-4xl text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              Welcome to pharmacy {pharmacy.name}
            </h1>
          </div>
          
          <div className="divider"></div>
          
          <div className="flex flex-col gap-4">
            <Link
              to={`/detailed-sales?branchCode=${pharmacy.branchCode}`}
              className="btn btn-primary btn-lg gap-2"
            >
              <FaFileInvoice className="h-5 w-5" />
              View Detailed Sales for Branch {pharmacy.branchCode}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReports;

