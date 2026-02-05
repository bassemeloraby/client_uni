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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
        grandTotals: response.data.grandTotals || {},
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
      grandTotals: {},
      availableYears: [],
      selectedYear: null,
      error: error.response?.data?.message || error.message || "Failed to fetch cash sales by month",
    };
  }
};

const CashSales = () => {
  const { salesByMonth, grandTotals, availableYears, selectedYear, error } = useLoaderData();
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Use grand totals from backend
  const totals = grandTotals || {};
  const grandTotal = Math.round(totals.Total || 0);

  // Month order for sorting
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedSales = [...salesByMonth].sort((a, b) => {
    if (a.Year !== b.Year) {
      return b.Year - a.Year; // Sort years descending
    }
    return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
  });

  // Color palette for the chart
  const colorPalette = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#a855f7', // violet
  ];

  // Prepare chart data with colors
  const chartData = sortedSales.map((item, index) => ({
    month: `${item.Month} ${item.Year}`,
    monthAbbr: item.Month,
    amount: Math.round(item.Total || 0),
    year: item.Year,
    color: colorPalette[index % colorPalette.length]
  }));

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-200 p-4 rounded-lg shadow-lg border border-base-300">
          <p className="font-semibold text-base-content">{payload[0].payload.month}</p>
          <p className="text-success">
            <FaDollarSign className="inline mr-1" />
            Total: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

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

      {/* Column Chart */}
      {chartData.length > 0 && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <FaChartBar className="text-primary" />
              Cash Sales by Month - Column Chart
            </h2>
            <div className="w-full" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-base-content">Total Amount (SAR)</span>}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[8, 8, 0, 0]}
                    name="Total Amount (SAR)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                <th>Total (SAR)</th>
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
                  <td className="font-bold text-lg">
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span className="text-success">{formatCurrency(Math.round(item.Total || 0))}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" className="text-right">Grand Total:</th>
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

