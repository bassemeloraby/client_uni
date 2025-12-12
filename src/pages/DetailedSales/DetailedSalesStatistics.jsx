import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaStore, 
  FaArrowLeft,
  FaUser,
  FaFileInvoice
} from 'react-icons/fa';
import { customFetch } from "../../utils";


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

    // Get branchCode from URL params
    const params = new URL(request.url).searchParams;
    const branchCode = params.get('branchCode');

    // Fetch pharmacies for dropdown
    const pharmaciesResponse = await customFetch.get('pharmacies');
    const pharmacies = pharmaciesResponse.data.success ? pharmaciesResponse.data.data : [];
    
    // Return data
    return {
      pharmacies,
      selectedBranchCode: branchCode || null,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    
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
    
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch statistics");
  }
};

const DetailedSalesStatistics = () => {
  const { pharmacies, selectedBranchCode } = useLoaderData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/detailed-sales"
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Detailed Sales
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-4xl text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              Detailed Sales Statistics
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/detailed-sales/statistics/sales-by-pharmacies"
              className="btn btn-primary gap-2"
            >
              <FaStore />
              View Sales by Pharmacies
            </Link>
            <Link
              to="/detailed-sales/statistics/sales-by-sales-person"
              className="btn btn-primary gap-2"
            >
              <FaUser />
              View Sales by Sales Person
            </Link>
            <Link
              to="/detailed-sales/statistics/sales-by-invoice-type"
              className="btn btn-primary gap-2"
            >
              <FaFileInvoice />
              View Sales by Invoice Type
            </Link>
          </div>
        </div>
        <p className="text-base-content/70">
          Comprehensive sales statistics and analytics
        </p>
      </div>
    </div>
  );
};

export default DetailedSalesStatistics;

