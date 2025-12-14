import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaCalendarAlt,
  FaDollarSign,
  FaChartBar,
  FaDownload,
  FaRedo,
  FaFileInvoice
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "header-sales/by-month";

export const loader = async ({ request }) => {
  try {
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.jwt) {
      throw new Response("Unauthorized", { 
        status: 401,
        statusText: "Authentication required"
      });
    }

    const params = new URL(request.url).searchParams;
    const Year = params.get('Year');
    
    const queryString = Year ? `?Year=${Year}` : '';
    const response = await customFetch.get(`${url}${queryString}`);
    
    if (response.data.success) {
      return {
        salesByMonth: response.data.data || [],
        availableYears: response.data.availableYears || [],
        selectedYear: response.data.selectedYear,
      };
    }
    throw new Error("Failed to fetch sales by month");
  } catch (error) {
    console.error("Error fetching sales by month:", error);
    
    // Handle 401 errors - redirect to login
    if (error.response?.status === 401 || error.status === 401) {
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Response("Unauthorized", { 
        status: 401,
        statusText: "Authentication required"
      });
    }
    
    return {
      salesByMonth: [],
      availableYears: [],
      selectedYear: null,
      error: error.response?.data?.message || error.message || "Failed to fetch sales by month",
    };
  }
};

const SalesByMonth = () => {
  const { salesByMonth, availableYears, selectedYear, error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedYearState, setSelectedYearState] = useState(
    selectedYear?.toString() || searchParams.get('Year') || ''
  );

  // Update state when URL params change
  useEffect(() => {
    const yearParam = searchParams.get('Year');
    setSelectedYearState(yearParam || '');
  }, [searchParams]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Get month name
  const getMonthName = (monthAbbr) => {
    const months = {
      'Jan': 'January',
      'Feb': 'February',
      'Mar': 'March',
      'Apr': 'April',
      'May': 'May',
      'Jun': 'June',
      'Jul': 'July',
      'Aug': 'August',
      'Sep': 'September',
      'Oct': 'October',
      'Nov': 'November',
      'Dec': 'December'
    };
    return months[monthAbbr] || monthAbbr;
  };

  // Handle year filter change
  const handleYearChange = (year) => {
    setSelectedYearState(year);
    const params = new URLSearchParams();
    if (year) {
      params.set('Year', year);
    }
    navigate(`/header-sales/by-month${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedYearState('');
    navigate('/header-sales/by-month');
  };

  // Calculate total
  const totalAmount = salesByMonth.reduce((sum, item) => sum + (item.TotalAmountAfterDiscount || 0), 0);
  const totalCount = salesByMonth.reduce((sum, item) => sum + (item.count || 0), 0);

  // Month order for sorting
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedSales = [...salesByMonth].sort((a, b) => {
    if (a.Year !== b.Year) {
      return b.Year - a.Year; // Sort years descending
    }
    return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className='text-6xl font-bold text-blue-500'>Sales by Month</h1>
          <p className="text-lg text-base-content/70 mt-2">
            {selectedYear 
              ? `Sales data for ${selectedYear}`
              : 'All sales data grouped by month'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedYearState && (
            <button
              className="btn btn-error gap-2"
              onClick={clearFilter}
              title="Clear year filter"
            >
              <FaRedo className="h-5 w-5" />
              Clear Filter
            </button>
          )}
          <button
            className="btn btn-outline gap-2"
            onClick={() => window.print()}
          >
            <FaDownload className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Year Filter */}
      <div className="mb-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  <FaCalendarAlt className="inline mr-2" />
                  Filter by Year
                </span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={selectedYearState}
                onChange={(e) => handleYearChange(e.target.value)}
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {salesByMonth.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-figure text-primary">
              <FaChartBar className="text-4xl" />
            </div>
            <div className="stat-title">Total Months</div>
            <div className="stat-value text-primary">{salesByMonth.length}</div>
            <div className="stat-desc">Months with sales data</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-figure text-success">
              <FaDollarSign className="text-4xl" />
            </div>
            <div className="stat-title">Total Amount</div>
            <div className="stat-value text-success">{formatCurrency(totalAmount)}</div>
            <div className="stat-desc">Sum of all sales</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-figure text-info">
              <FaFileInvoice className="text-4xl" />
            </div>
            <div className="stat-title">Total Invoices</div>
            <div className="stat-value text-info">{totalCount}</div>
            <div className="stat-desc">Number of invoices</div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      {sortedSales && sortedSales.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Number of Invoices</th>
                <th>Total Amount After Discount</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.map((item, index) => (
                <tr key={`${item.Year}-${item.Month}-${index}`} className="hover">
                  <td>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-primary" />
                      <span className="font-semibold">{item.Year || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-primary badge-lg">
                      {getMonthName(item.Month)} ({item.Month})
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.count || 0}</span>
                      <span className="text-sm text-base-content/70">invoices</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-success text-lg" />
                      <span className="font-bold text-lg text-success">
                        {formatCurrency(item.TotalAmountAfterDiscount)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" className="text-right">Total:</th>
                <th className="text-info">{totalCount}</th>
                <th className="text-success text-lg">
                  {formatCurrency(totalAmount)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">
            {selectedYearState 
              ? `No sales data found for year ${selectedYearState}`
              : 'No sales data found'
            }
          </p>
          {selectedYearState && (
            <button
              className="btn btn-outline"
              onClick={clearFilter}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesByMonth;

