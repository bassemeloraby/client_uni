import React, { useState } from 'react';
import { useLoaderData, Link, useSearchParams } from 'react-router-dom';
import { 
  FaChartBar, 
  FaStore, 
  FaArrowLeft,
  FaHashtag,
  FaBuilding,
  FaDollarSign,
  FaUser,
  FaShoppingCart,
  FaBox,
  FaFilter,
  FaFileInvoice,
  FaCalendarAlt
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { customFetch } from "../../utils";

const salesByMonthUrl = "detailed-sales/stats/sales-by-month";
const salesByDayUrl = "detailed-sales/stats/sales-by-day";

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

    // Get branchCode and month from URL params
    const params = new URL(request.url).searchParams;
    const branchCode = params.get('branchCode');
    const month = params.get('month'); // Format: "YYYY-MM"

    // Fetch pharmacies for dropdown
    const pharmaciesResponse = await customFetch.get('pharmacies');
    const pharmacies = pharmaciesResponse.data.success ? pharmaciesResponse.data.data : [];

    // Build sales by month URL with branchCode if provided
    let salesByMonthUrlWithFilter = salesByMonthUrl;
    
    if (branchCode) {
      salesByMonthUrlWithFilter += `?branchCode=${branchCode}`;
    }

    // Build sales by day URL if month is selected
    let salesByDayUrlWithFilter = null;
    if (month) {
      const [year, monthNum] = month.split('-');
      salesByDayUrlWithFilter = salesByDayUrl;
      salesByDayUrlWithFilter += `?year=${year}&month=${monthNum}`;
      if (branchCode) {
        salesByDayUrlWithFilter += `&branchCode=${branchCode}`;
      }
    }

    const promises = [
      customFetch.get(salesByMonthUrlWithFilter),
    ];

    if (salesByDayUrlWithFilter) {
      promises.push(customFetch.get(salesByDayUrlWithFilter));
    }

    const responses = await Promise.allSettled(promises);
    
    const salesByMonthResponse = responses[0];
    const salesByDayResponse = responses[1]; // Will be undefined if salesByDayUrlWithFilter was null
    
    // Log errors for debugging
    if (salesByMonthResponse.status === 'rejected') {
      console.error('Error fetching sales by month:', salesByMonthResponse.reason);
    }
    if (salesByDayResponse && salesByDayResponse.status === 'rejected') {
      console.error('Error fetching sales by day:', salesByDayResponse.reason);
    }
    
    const salesByMonthStats = salesByMonthResponse.status === 'fulfilled' && salesByMonthResponse.value?.data?.success 
      ? salesByMonthResponse.value.data.data 
      : null;
    const salesByDayStats = salesByDayResponse && salesByDayResponse.status === 'fulfilled' && salesByDayResponse.value?.data?.success 
      ? salesByDayResponse.value.data.data 
      : null;
    
    // Return data even if some stats are null - let the component handle empty states
    return {
      salesByMonthStats,
      salesByDayStats,
      pharmacies,
      selectedBranchCode: branchCode || null,
      selectedMonth: month || null,
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
  const { salesByMonthStats, salesByDayStats, pharmacies, selectedBranchCode, selectedMonth } = useLoaderData();
  const { statistics: salesByMonthStatistics, summary: salesByMonthSummary } = salesByMonthStats || {};
  const { statistics: salesByDayStatistics, summary: salesByDaySummary } = salesByDayStats || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSalesByMonth, setShowSalesByMonth] = useState(false);

  // Get selected pharmacy name
  const selectedPharmacy = pharmacies.find(p => p.branchCode === parseInt(selectedBranchCode || 0));
  
  // Get selected month from URL params (use from loader or searchParams)
  const currentSelectedMonth = selectedMonth || searchParams.get('month') || '';
  
  // Determine if we should show daily data (when a month is selected)
  const showDailyData = currentSelectedMonth !== '';

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Handle pharmacy filter change
  const handlePharmacyChange = (e) => {
    const branchCode = e.target.value;
    const month = searchParams.get('month') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    setSearchParams(params);
  };

  // Handle month filter change for Sales by Month section
  const handleMonthChange = (e) => {
    const month = e.target.value;
    const branchCode = searchParams.get('branchCode') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    setSearchParams(params);
  };


  // Filter sales by month statistics based on selected month
  const filteredSalesByMonthStatistics = selectedMonth
    ? salesByMonthStatistics?.filter(stat => {
        const [monthName, year] = stat.monthYear.split(' ');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthIndex = monthNames.indexOf(monthName);
        const monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        return monthValue === selectedMonth;
      }) || []
    : salesByMonthStatistics || [];

  // Colors for pie chart
  const COLORS = [
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
  ];

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

      {/* Sales by Month Statistics */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="card-title">
              <FaCalendarAlt className="text-primary" />
              Sales by Month
              {selectedPharmacy && (
                <span className="text-lg font-normal text-base-content/70 ml-2">
                  - {selectedPharmacy.name} (Branch: {selectedPharmacy.branchCode})
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowSalesByMonth(!showSalesByMonth)}
              className="btn btn-sm btn-primary"
            >
              Sales by Month
            </button>
          </div>
          {showSalesByMonth && (
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FaFilter className="text-primary" />
                    Filter by Pharmacy
                  </span>
                </label>
                <select
                  className="select select-bordered w-full md:w-64"
                  value={selectedBranchCode || ''}
                  onChange={handlePharmacyChange}
                >
                  <option value="">All Pharmacies</option>
                  {pharmacies.map((pharmacy) => (
                    <option key={pharmacy._id} value={pharmacy.branchCode}>
                      {pharmacy.name} (Branch: {pharmacy.branchCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    Filter by Month
                  </span>
                </label>
                <select
                  className="select select-bordered w-full md:w-64"
                  value={selectedMonth || ''}
                  onChange={handleMonthChange}
                >
                  <option value="">All Months</option>
                  {salesByMonthStatistics?.map((stat) => (
                    <option key={`${stat.year}-${stat.month}`} value={`${stat.year}-${String(stat.month).padStart(2, '0')}`}>
                      {stat.monthYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {showSalesByMonth && filteredSalesByMonthStatistics && filteredSalesByMonthStatistics.length > 0 ? (
            <>
              {/* Sales by Month Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Months</div>
                  <div className="stat-value text-2xl">{filteredSalesByMonthStatistics.length || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales</div>
                  <div className="stat-value text-2xl">
                    {formatCurrency(filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-2xl">
                    {filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Units Quantity</div>
                  <div className="stat-value text-2xl">
                    {filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalQuantity, 0)}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Sales</th>
                      <th>Average Sales per Day</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalesByMonthStatistics.map((stat) => (
                      <tr key={`${stat.year}-${stat.month}`} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            <span className="font-semibold">{stat.monthYear}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-warning" />
                            <span className="text-lg font-semibold text-success">
                              {formatCurrency(stat.totalSales)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-info" />
                            <span className="text-lg font-semibold text-primary">
                              {formatCurrency(stat.averageSalesPerDay || 0)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="badge badge-primary badge-lg">
                              {formatPercentage(stat.percentage)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaShoppingCart className="text-info" />
                            <span className="font-semibold">{stat.totalTransactions}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaBox className="text-success" />
                            <span className="font-semibold">{stat.totalQuantity}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th>
                        <span className="text-lg font-semibold text-success">
                          {formatCurrency(filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(
                            filteredSalesByMonthStatistics.length > 0
                              ? filteredSalesByMonthStatistics.reduce((sum, stat) => sum + (stat.averageSalesPerDay || 0), 0) / filteredSalesByMonthStatistics.length
                              : 0
                          )}
                        </span>
                        <span className="text-xs text-base-content/70 ml-2">(Overall Avg)</span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">
                          {filteredSalesByMonthStatistics.length > 0 && salesByMonthStatistics.length > 0
                            ? formatPercentage(
                                (filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalSales, 0) /
                                  salesByMonthStatistics.reduce((sum, stat) => sum + stat.totalSales, 0)) *
                                  100
                              )
                            : '0.00'}%
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {filteredSalesByMonthStatistics.reduce((sum, stat) => sum + stat.totalQuantity, 0)}
                        </span>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Column Chart - Show daily or monthly based on selection */}
              {showDailyData && salesByDayStatistics ? (
                <>
                  {/* Daily Sales Distribution */}
                  <div className="card bg-base-200 shadow-md">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">
                        <FaChartBar className="text-primary" />
                        Daily Sales Distribution
                      </h3>
                      {salesByDayStatistics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={450}>
                          <BarChart data={salesByDayStatistics} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="dayLabel" 
                              angle={-45}
                              textAnchor="end"
                              height={120}
                              interval={0}
                              tick={{ fontSize: 11, fill: '#666' }}
                            />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value)}
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <Tooltip 
                              formatter={(value, name, props) => {
                                const totalSales = salesByDayStatistics?.reduce((sum, stat) => sum + stat.totalSales, 0) || 0;
                                const percentage = totalSales > 0 ? (value / totalSales) * 100 : 0;
                                return [
                                  `${formatCurrency(value)} (${formatPercentage(percentage)}%)`,
                                  'Sales'
                                ];
                              }}
                              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                            />
                            <Bar 
                              dataKey="totalSales" 
                              fill="#3b82f6"
                              radius={[8, 8, 0, 0]}
                            >
                              {salesByDayStatistics.map((entry, index) => (
                                <Cell key={`cell-day-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-96">
                          <p className="text-base-content/70">No data available for chart</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Daily Transactions Distribution */}
                  <div className="card bg-base-200 shadow-md mt-6">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">
                        <FaChartBar className="text-primary" />
                        Daily Transactions Distribution
                      </h3>
                      {salesByDayStatistics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={450}>
                          <BarChart data={salesByDayStatistics} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="dayLabel" 
                              angle={-45}
                              textAnchor="end"
                              height={120}
                              interval={0}
                              tick={{ fontSize: 11, fill: '#666' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <Tooltip 
                              formatter={(value, name, props) => [
                                `${value} transactions`,
                                'Transactions'
                              ]}
                              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                            />
                            <Bar 
                              dataKey="totalTransactions" 
                              fill="#10b981"
                              radius={[8, 8, 0, 0]}
                            >
                              {salesByDayStatistics.map((entry, index) => (
                                <Cell key={`cell-day-trans-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-96">
                          <p className="text-base-content/70">No data available for chart</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Monthly Sales Distribution */}
                  <div className="card bg-base-200 shadow-md">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">
                        <FaChartBar className="text-primary" />
                        Monthly Sales Distribution
                      </h3>
                      {filteredSalesByMonthStatistics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={450}>
                          <BarChart data={filteredSalesByMonthStatistics} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="monthYear" 
                              angle={-45}
                              textAnchor="end"
                              height={120}
                              interval={0}
                              tick={{ fontSize: 12, fill: '#666' }}
                              tickFormatter={(value) => {
                                // Shorten month names for better display
                                const parts = value.split(' ');
                                if (parts.length === 2) {
                                  const month = parts[0].substring(0, 3); // First 3 letters
                                  const year = parts[1];
                                  return `${month} ${year}`;
                                }
                                return value;
                              }}
                            />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value)}
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <Tooltip 
                              formatter={(value, name, props) => {
                                const totalSales = salesByMonthStatistics?.reduce((sum, stat) => sum + stat.totalSales, 0) || 0;
                                const percentage = totalSales > 0 ? (value / totalSales) * 100 : 0;
                                return [
                                  `${formatCurrency(value)} (${formatPercentage(percentage)}%)`,
                                  'Sales'
                                ];
                              }}
                              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                            />
                            <Bar 
                              dataKey="totalSales" 
                              fill="#3b82f6"
                              radius={[8, 8, 0, 0]}
                            >
                              {filteredSalesByMonthStatistics.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-96">
                          <p className="text-base-content/70">No data available for chart</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Monthly Transactions Distribution */}
                  <div className="card bg-base-200 shadow-md mt-6">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">
                        <FaChartBar className="text-primary" />
                        Monthly Transactions Distribution
                      </h3>
                      {filteredSalesByMonthStatistics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={450}>
                          <BarChart data={filteredSalesByMonthStatistics} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="monthYear" 
                              angle={-45}
                              textAnchor="end"
                              height={120}
                              interval={0}
                              tick={{ fontSize: 12, fill: '#666' }}
                              tickFormatter={(value) => {
                                // Shorten month names for better display
                                const parts = value.split(' ');
                                if (parts.length === 2) {
                                  const month = parts[0].substring(0, 3); // First 3 letters
                                  const year = parts[1];
                                  return `${month} ${year}`;
                                }
                                return value;
                              }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <Tooltip 
                              formatter={(value, name, props) => [
                                `${value} transactions`,
                                'Transactions'
                              ]}
                              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                            />
                            <Bar 
                              dataKey="totalTransactions" 
                              fill="#10b981"
                              radius={[8, 8, 0, 0]}
                            >
                              {filteredSalesByMonthStatistics.map((entry, index) => (
                                <Cell key={`cell-trans-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-96">
                          <p className="text-base-content/70">No data available for chart</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : showSalesByMonth ? (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No monthly sales statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailedSalesStatistics;

