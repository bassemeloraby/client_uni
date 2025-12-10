import React from 'react';
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

const url = "detailed-sales/stats/pharmacies-by-branch";
const salesByNameUrl = "detailed-sales/stats/sales-by-name";
const salesByInvoiceTypeUrl = "detailed-sales/stats/sales-by-invoice-type";
const salesByMonthUrl = "detailed-sales/stats/sales-by-month";

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

    // Build sales by name URL with branchCode if provided
    let salesByNameUrlWithFilter = salesByNameUrl;
    let salesByInvoiceTypeUrlWithFilter = salesByInvoiceTypeUrl;
    let salesByMonthUrlWithFilter = salesByMonthUrl;
    if (branchCode) {
      salesByNameUrlWithFilter += `?branchCode=${branchCode}`;
      salesByInvoiceTypeUrlWithFilter += `?branchCode=${branchCode}`;
      salesByMonthUrlWithFilter += `?branchCode=${branchCode}`;
    }

    const [pharmacyStatsResponse, salesByNameResponse, salesByInvoiceTypeResponse, salesByMonthResponse] = await Promise.allSettled([
      customFetch.get(url),
      customFetch.get(salesByNameUrlWithFilter),
      customFetch.get(salesByInvoiceTypeUrlWithFilter),
      customFetch.get(salesByMonthUrlWithFilter),
    ]);
    
    const pharmacyStats = pharmacyStatsResponse.status === 'fulfilled' && pharmacyStatsResponse.value.data.success 
      ? pharmacyStatsResponse.value.data.data 
      : null;
    const salesByNameStats = salesByNameResponse.status === 'fulfilled' && salesByNameResponse.value.data.success 
      ? salesByNameResponse.value.data.data 
      : null;
    const salesByInvoiceTypeStats = salesByInvoiceTypeResponse.status === 'fulfilled' && salesByInvoiceTypeResponse.value.data.success 
      ? salesByInvoiceTypeResponse.value.data.data 
      : null;
    const salesByMonthStats = salesByMonthResponse.status === 'fulfilled' && salesByMonthResponse.value.data.success 
      ? salesByMonthResponse.value.data.data 
      : null;
    
    if (pharmacyStats && salesByNameStats) {
      return {
        pharmacyStats,
        salesByNameStats,
        salesByInvoiceTypeStats,
        salesByMonthStats,
        pharmacies,
        selectedBranchCode: branchCode || null,
      };
    }
    throw new Error("Failed to fetch statistics");
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
  const { pharmacyStats, salesByNameStats, salesByInvoiceTypeStats, salesByMonthStats, pharmacies, selectedBranchCode } = useLoaderData();
  const { statistics, summary } = pharmacyStats || {};
  const { statistics: salesByNameStatistics, summary: salesByNameSummary } = salesByNameStats || {};
  const { statistics: salesByInvoiceTypeStatistics, summary: salesByInvoiceTypeSummary } = salesByInvoiceTypeStats || {};
  const { statistics: salesByMonthStatistics, summary: salesByMonthSummary } = salesByMonthStats || {};
  const [searchParams, setSearchParams] = useSearchParams();

  // Get selected pharmacy name
  const selectedPharmacy = pharmacies.find(p => p.branchCode === parseInt(selectedBranchCode || 0));

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
    if (branchCode) {
      setSearchParams({ branchCode });
    } else {
      setSearchParams({});
    }
  };

  // Prepare data for pie chart
  const pieChartData = salesByNameStatistics?.map((stat, index) => ({
    name: stat.salesName,
    value: stat.totalSales,
    percentage: stat.percentage,
  })) || [];

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
        <div className="flex items-center gap-3 mb-4">
          <FaChartBar className="text-4xl text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            Detailed Sales Statistics
          </h1>
        </div>
        <p className="text-base-content/70">
          Statistics showing the number of pharmacies using each branch code
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FaHashtag className="text-2xl text-primary" />
              </div>
              <div>
                <h3 className="text-sm text-base-content/70">Total Branch Codes</h3>
                <p className="text-3xl font-bold">{summary.totalBranchCodes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <FaBuilding className="text-2xl text-success" />
              </div>
              <div>
                <h3 className="text-sm text-base-content/70">Total Pharmacies</h3>
                <p className="text-3xl font-bold">{summary.totalPharmacies}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <FaDollarSign className="text-2xl text-warning" />
              </div>
              <div>
                <h3 className="text-sm text-base-content/70">Total Sales</h3>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(summary.totalSales || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <FaStore className="text-primary" />
            Pharmacies by Branch Code
          </h2>
          
          {statistics && statistics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Branch Code</th>
                    <th>Number of Pharmacies</th>
                    <th>Total Sales</th>
                    <th>% of Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((stat) => (
                    <tr key={stat.branchCode} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <FaHashtag className="text-primary" />
                          <span className="font-mono font-semibold">{stat.branchCode}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-success" />
                          <span className="text-lg font-semibold">{stat.pharmacyCount}</span>
                          <span className="text-sm text-base-content/70">
                            {stat.pharmacyCount === 1 ? 'pharmacy' : 'pharmacies'}
                          </span>
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
                          <span className="badge badge-primary badge-lg">
                            {formatPercentage(stat.percentage)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/detailed-sales?branchCode=${stat.branchCode}`}
                          className="btn btn-sm btn-primary gap-2"
                        >
                          <FaChartBar />
                          View Sales
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>
                      <span className="text-lg font-semibold">
                        {statistics.reduce((sum, stat) => sum + stat.pharmacyCount, 0)}
                      </span>
                    </th>
                    <th>
                      <span className="text-lg font-semibold text-success">
                        {formatCurrency(statistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                      </span>
                    </th>
                    <th>
                      <span className="badge badge-primary badge-lg">100.00%</span>
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No statistics available
              </p>
              <p className="text-base-content/50">
                No branch codes found in detailed sales records
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sales Name Statistics */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="card-title">
              <FaUser className="text-primary" />
              Sales by Sales Person
              {selectedPharmacy && (
                <span className="text-lg font-normal text-base-content/70 ml-2">
                  - {selectedPharmacy.name} (Branch: {selectedPharmacy.branchCode})
                </span>
              )}
            </h2>
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
          </div>
          
          {salesByNameStatistics && salesByNameStatistics.length > 0 ? (
            <>
              {/* Sales Name Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales Persons</div>
                  <div className="stat-value text-2xl">{salesByNameSummary?.totalSalesPersons || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales</div>
                  <div className="stat-value text-2xl">
                    {formatCurrency(salesByNameSummary?.totalSales || 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-2xl">{salesByNameSummary?.totalTransactions || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Units Quantity</div>
                  <div className="stat-value text-2xl">{salesByNameSummary?.totalQuantity || 0}</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Sales Person</th>
                      <th>Total Sales</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByNameStatistics.map((stat) => (
                      <tr key={stat.salesName} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FaUser className="text-primary" />
                            <span className="font-semibold">{stat.salesName}</span>
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
                          <Link
                            to={`/detailed-sales?salesName=${encodeURIComponent(stat.salesName)}${selectedBranchCode ? `&branchCode=${selectedBranchCode}` : ''}`}
                            className="btn btn-sm btn-primary gap-2"
                          >
                            <FaChartBar />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th>
                        <span className="text-lg font-semibold text-success">
                          {formatCurrency(salesByNameStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">100.00%</span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {salesByNameStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                        </span>
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Column Chart */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">
                    <FaChartBar className="text-primary" />
                    Sales Distribution
                  </h3>
                  {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={pieChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${formatCurrency(value)} (${formatPercentage(props.payload.percentage)}%)`,
                              'Sales'
                            ]}
                            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#3b82f6"
                            radius={[8, 8, 0, 0]}
                          >
                            {pieChartData.map((entry, index) => (
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
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No sales person statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sales by Invoice Type Statistics */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="card-title">
              <FaFileInvoice className="text-primary" />
              Sales by Invoice Type
              {selectedPharmacy && (
                <span className="text-lg font-normal text-base-content/70 ml-2">
                  - {selectedPharmacy.name} (Branch: {selectedPharmacy.branchCode})
                </span>
              )}
            </h2>
          </div>
          
          {salesByInvoiceTypeStatistics && salesByInvoiceTypeStatistics.length > 0 ? (
            <>
              {/* Invoice Type Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Invoice Types</div>
                  <div className="stat-value text-2xl">{salesByInvoiceTypeSummary?.totalInvoiceTypes || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales</div>
                  <div className="stat-value text-2xl">
                    {formatCurrency(salesByInvoiceTypeSummary?.totalSales || 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-2xl">{salesByInvoiceTypeSummary?.totalTransactions || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Units Quantity</div>
                  <div className="stat-value text-2xl">{salesByInvoiceTypeSummary?.totalQuantity || 0}</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Invoice Type</th>
                      <th>Total Sales</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByInvoiceTypeStatistics.map((stat) => (
                      <tr key={stat.invoiceType} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FaFileInvoice className="text-primary" />
                            <span className="font-semibold">{stat.invoiceType}</span>
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
                          {stat.invoiceType === 'Total insurance' || stat.invoiceType === 'Total Online' || stat.invoiceType === 'Total CashCustomer' || stat.invoiceType === 'Total Normal' ? (
                            <span className="text-base-content/50 text-sm">N/A</span>
                          ) : (
                            <Link
                              to={`/detailed-sales?invoiceType=${encodeURIComponent(stat.invoiceType)}${selectedBranchCode ? `&branchCode=${selectedBranchCode}` : ''}`}
                              className="btn btn-sm btn-primary gap-2"
                            >
                              <FaChartBar />
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th>
                        <span className="text-lg font-semibold text-success">
                          {formatCurrency(salesByInvoiceTypeStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">100.00%</span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {salesByInvoiceTypeStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                        </span>
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pie Chart */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">
                    <FaChartBar className="text-primary" />
                    Invoice Type Distribution
                  </h3>
                  {salesByInvoiceTypeStatistics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={salesByInvoiceTypeStatistics.map((stat, index) => ({
                            name: stat.invoiceType,
                            value: stat.totalSales,
                            percentage: stat.percentage,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {salesByInvoiceTypeStatistics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${formatCurrency(value)} (${formatPercentage(props.payload.percentage)}%)`,
                            props.payload.name
                          ]}
                          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={60}
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value, entry) => (
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                              {value}: {formatPercentage(entry.payload.percentage)}%
                            </span>
                          )}
                        />
                      </PieChart>
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
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No invoice type statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          )}
        </div>
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
          </div>
          
          {salesByMonthStatistics && salesByMonthStatistics.length > 0 ? (
            <>
              {/* Sales by Month Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Months</div>
                  <div className="stat-value text-2xl">{salesByMonthSummary?.totalMonths || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales</div>
                  <div className="stat-value text-2xl">
                    {formatCurrency(salesByMonthSummary?.totalSales || 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-2xl">{salesByMonthSummary?.totalTransactions || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Units Quantity</div>
                  <div className="stat-value text-2xl">{salesByMonthSummary?.totalQuantity || 0}</div>
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
                    {salesByMonthStatistics.map((stat) => (
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
                          {formatCurrency(salesByMonthStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(
                            salesByMonthStatistics.length > 0
                              ? salesByMonthStatistics.reduce((sum, stat) => sum + (stat.averageSalesPerDay || 0), 0) / salesByMonthStatistics.length
                              : 0
                          )}
                        </span>
                        <span className="text-xs text-base-content/70 ml-2">(Overall Avg)</span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">100.00%</span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {salesByMonthStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {salesByMonthStatistics.reduce((sum, stat) => sum + stat.totalQuantity, 0)}
                        </span>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Column Chart */}
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">
                    <FaChartBar className="text-primary" />
                    Monthly Sales Distribution
                  </h3>
                  {salesByMonthStatistics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={salesByMonthStatistics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="monthYear" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${formatCurrency(value)} (${formatPercentage(props.payload.percentage)}%)`,
                            'Sales'
                          ]}
                          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                        />
                        <Bar 
                          dataKey="totalSales" 
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                        >
                          {salesByMonthStatistics.map((entry, index) => (
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
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No monthly sales statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedSalesStatistics;

