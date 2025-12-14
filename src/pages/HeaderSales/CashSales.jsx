import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaCalendarAlt,
  FaDollarSign,
  FaChartBar,
  FaDownload,
  FaRedo,
  FaFileInvoice,
  FaCashRegister,
  FaCreditCard,
  FaShoppingCart,
  FaGlobe,
  FaUndo,
  FaStore
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "header-sales/cash-by-month";

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
    throw new Error("Failed to fetch cash sales by month");
  } catch (error) {
    console.error("Error fetching cash sales by month:", error);
    
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
      error: error.response?.data?.message || error.message || "Failed to fetch cash sales by month",
    };
  }
};

const CashSales = () => {
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
    navigate(`/cash-sales${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedYearState('');
    navigate('/cash-sales');
  };

  // Calculate totals
  const calculateTotals = () => {
    return salesByMonth.reduce((acc, item) => {
      acc.CashCustomer += item.CashCustomer || 0;
      acc.CreditCustomer += item.CreditCustomer || 0;
      acc.Normal += item.Normal || 0;
      acc.Online += item.Online || 0;
      acc.Return += item.Return || 0;
      acc.ReturnCashCustomer += item.ReturnCashCustomer || 0;
      acc.ReturnCreditCustomer += item.ReturnCreditCustomer || 0;
      acc.ReturnOnline += item.ReturnOnline || 0;
      acc.totalCount += item.totalCount || 0;
      return acc;
    }, {
      CashCustomer: 0,
      CreditCustomer: 0,
      Normal: 0,
      Online: 0,
      Return: 0,
      ReturnCashCustomer: 0,
      ReturnCreditCustomer: 0,
      ReturnOnline: 0,
      totalCount: 0
    });
  };

  const totals = calculateTotals();
  const grandTotal = totals.CashCustomer + totals.CreditCustomer + totals.Normal + 
                     totals.Online + totals.Return + totals.ReturnCashCustomer + 
                     totals.ReturnCreditCustomer + totals.ReturnOnline;

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
          <h1 className='text-6xl font-bold text-blue-500'>Cash Sales by Month</h1>
          <p className="text-lg text-base-content/70 mt-2">
            {selectedYear 
              ? `Cash sales data for ${selectedYear}`
              : 'All cash sales data grouped by month'
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
            <div className="stat-title">Grand Total</div>
            <div className="stat-value text-success">{formatCurrency(grandTotal)}</div>
            <div className="stat-desc">Sum of all invoice types</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-figure text-info">
              <FaFileInvoice className="text-4xl" />
            </div>
            <div className="stat-title">Total Invoices</div>
            <div className="stat-value text-info">{totals.totalCount}</div>
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
                <th>
                  <div className="flex items-center gap-2">
                    <FaCashRegister className="text-primary" />
                    Cash Customer
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaCreditCard className="text-info" />
                    Credit Customer
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaStore className="text-success" />
                    Normal
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-warning" />
                    Online
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaUndo className="text-error" />
                    Return
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaUndo className="text-error" />
                    Return Cash
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaUndo className="text-error" />
                    Return Credit
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <FaUndo className="text-error" />
                    Return Online
                  </div>
                </th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.map((item, index) => {
                const monthTotal = (item.CashCustomer || 0) + (item.CreditCustomer || 0) + 
                                  (item.Normal || 0) + (item.Online || 0) + (item.Return || 0) + 
                                  (item.ReturnCashCustomer || 0) + (item.ReturnCreditCustomer || 0) + 
                                  (item.ReturnOnline || 0);
                return (
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
                    <td className="text-success font-semibold">
                      {formatCurrency(item.CashCustomer || 0)}
                    </td>
                    <td className="text-info font-semibold">
                      {formatCurrency(item.CreditCustomer || 0)}
                    </td>
                    <td className="text-success font-semibold">
                      {formatCurrency(item.Normal || 0)}
                    </td>
                    <td className="text-warning font-semibold">
                      {formatCurrency(item.Online || 0)}
                    </td>
                    <td className="text-error font-semibold">
                      {formatCurrency(item.Return || 0)}
                    </td>
                    <td className="text-error font-semibold">
                      {formatCurrency(item.ReturnCashCustomer || 0)}
                    </td>
                    <td className="text-error font-semibold">
                      {formatCurrency(item.ReturnCreditCustomer || 0)}
                    </td>
                    <td className="text-error font-semibold">
                      {formatCurrency(item.ReturnOnline || 0)}
                    </td>
                    <td className="font-bold text-lg">
                      <div className="flex items-center gap-1">
                        <FaDollarSign className="text-success" />
                        <span className="text-success">{formatCurrency(monthTotal)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" className="text-right">Total:</th>
                <th className="text-success">{formatCurrency(totals.CashCustomer)}</th>
                <th className="text-info">{formatCurrency(totals.CreditCustomer)}</th>
                <th className="text-success">{formatCurrency(totals.Normal)}</th>
                <th className="text-warning">{formatCurrency(totals.Online)}</th>
                <th className="text-error">{formatCurrency(totals.Return)}</th>
                <th className="text-error">{formatCurrency(totals.ReturnCashCustomer)}</th>
                <th className="text-error">{formatCurrency(totals.ReturnCreditCustomer)}</th>
                <th className="text-error">{formatCurrency(totals.ReturnOnline)}</th>
                <th className="text-success text-lg">
                  {formatCurrency(grandTotal)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">
            {selectedYearState 
              ? `No cash sales data found for year ${selectedYearState}`
              : 'No cash sales data found'
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

export default CashSales;

