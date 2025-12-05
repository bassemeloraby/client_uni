import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaFileInvoice, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import { customFetch } from '../../utils';

export const loader = async ({ params }) => {
  try {
    // Fetch pharmacy data
    const pharmacyResponse = await customFetch.get(`pharmacies/${params.id}`);
    
    if (!pharmacyResponse.data.success) {
      throw new Error('Failed to fetch pharmacy');
    }
    
    const pharmacy = pharmacyResponse.data.data;
    
    // Check if there is any data for this pharmacy's branch code
    try {
      const salesResponse = await customFetch.get(`detailed-sales?branchCode=${pharmacy.branchCode}&limit=1`);
      const hasData = salesResponse.data.success && 
                      salesResponse.data.data && 
                      salesResponse.data.data.length > 0;
      
      return {
        pharmacy,
        hasPermission: true,
        permissionError: null,
        permissionReason: null,
        hasData,
      };
    } catch (salesError) {
      // If error fetching sales, assume no data
      return {
        pharmacy,
        hasPermission: true,
        permissionError: null,
        permissionReason: null,
        hasData: false,
      };
    }
  } catch (error) {
    console.error('Error fetching pharmacy reports:', error);
    
    // Handle permission errors (403)
    if (error.response?.status === 403) {
      return {
        pharmacy: null,
        hasPermission: false,
        permissionError: error.response?.data?.message || 'Access denied. You are not authorized to view this pharmacy.',
        permissionReason: error.response?.data?.reason || 'You are not assigned as a supervisor for this pharmacy. Only the assigned supervisor or an administrator can view pharmacy reports.',
        hasData: false,
      };
    }
    
    // Handle other errors
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch pharmacy');
  }
};

const PharmacyReports = () => {
  const { pharmacy, hasPermission, permissionError, permissionReason, hasData } = useLoaderData();

  // Handle permission error
  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/pharmacies"
            className="btn btn-ghost gap-2"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Pharmacies
          </Link>
        </div>

        <div className="card bg-base-100 shadow-xl border-2 border-error">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="text-4xl text-error" />
              <h1 className="text-3xl font-bold text-error">
                Access Denied
              </h1>
            </div>
            
            <div className="divider"></div>
            
            <div className="alert alert-error">
              <FaExclamationTriangle className="text-2xl" />
              <div>
                <h3 className="font-bold">Permission Error</h3>
                <div className="text-sm mt-2">
                  {permissionError || 'You do not have permission to view reports for this pharmacy.'}
                </div>
                {permissionReason && (
                  <div className="text-sm mt-2">
                    <strong>Reason:</strong> {permissionReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle pharmacy not found
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

  // Handle no data available
  if (!hasData) {
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

        <div className="card bg-base-100 shadow-xl border-2 border-warning">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-4xl text-warning" />
              <h1 className="text-3xl font-bold text-warning">
                No Data Available
              </h1>
            </div>
            
            <div className="divider"></div>
            
            <div className="alert alert-warning">
              <FaExclamationTriangle className="text-2xl" />
              <div>
                <h3 className="font-bold">No Sales Data Found</h3>
                <div className="text-sm mt-2">
                  There is no sales data available for pharmacy <strong>{pharmacy.name}</strong> (Branch Code: {pharmacy.branchCode}).
                </div>
                <div className="text-sm mt-2">
                  Sales data will appear here once transactions are recorded for this pharmacy branch.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show reports if data is available
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
              Pharmacy Reports - {pharmacy.name}
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

