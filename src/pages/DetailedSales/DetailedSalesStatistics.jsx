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
  FaUsers,
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
const salesByDayUrl = "detailed-sales/stats/sales-by-day";
const salesByCustomerNameUrl = "detailed-sales/stats/sales-by-customer-name";

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

    // Get salesPersonMonth, invoiceTypeMonth, and customerNameMonth from URL params
    const salesPersonMonth = params.get('salesPersonMonth'); // Format: "YYYY-MM"
    const invoiceTypeMonth = params.get('invoiceTypeMonth'); // Format: "YYYY-MM"
    const customerNameMonth = params.get('customerNameMonth'); // Format: "YYYY-MM"

    // Build sales by name URL with branchCode and month if provided
    let salesByNameUrlWithFilter = salesByNameUrl;
    let salesByInvoiceTypeUrlWithFilter = salesByInvoiceTypeUrl;
    let salesByMonthUrlWithFilter = salesByMonthUrl;
    let salesByCustomerNameUrlWithFilter = salesByCustomerNameUrl;
    
    const salesByNameParams = [];
    if (branchCode) salesByNameParams.push(`branchCode=${branchCode}`);
    if (salesPersonMonth) {
      const [year, monthNum] = salesPersonMonth.split('-');
      salesByNameParams.push(`year=${year}&month=${monthNum}`);
    }
    if (salesByNameParams.length > 0) {
      salesByNameUrlWithFilter += `?${salesByNameParams.join('&')}`;
    }
    
    const salesByInvoiceTypeParams = [];
    if (branchCode) salesByInvoiceTypeParams.push(`branchCode=${branchCode}`);
    if (invoiceTypeMonth) {
      const [year, monthNum] = invoiceTypeMonth.split('-');
      salesByInvoiceTypeParams.push(`year=${year}&month=${monthNum}`);
    }
    if (salesByInvoiceTypeParams.length > 0) {
      salesByInvoiceTypeUrlWithFilter += `?${salesByInvoiceTypeParams.join('&')}`;
    }
    
    if (branchCode) {
      salesByMonthUrlWithFilter += `?branchCode=${branchCode}`;
    }
    
    const salesByCustomerNameParams = [];
    if (branchCode) salesByCustomerNameParams.push(`branchCode=${branchCode}`);
    if (customerNameMonth) {
      const [year, monthNum] = customerNameMonth.split('-');
      salesByCustomerNameParams.push(`year=${year}&month=${monthNum}`);
    }
    if (salesByCustomerNameParams.length > 0) {
      salesByCustomerNameUrlWithFilter += `?${salesByCustomerNameParams.join('&')}`;
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
      customFetch.get(url),
      customFetch.get(salesByNameUrlWithFilter),
      customFetch.get(salesByInvoiceTypeUrlWithFilter),
      customFetch.get(salesByMonthUrlWithFilter),
      customFetch.get(salesByCustomerNameUrlWithFilter),
    ];

    if (salesByDayUrlWithFilter) {
      promises.push(customFetch.get(salesByDayUrlWithFilter));
    }

    const [pharmacyStatsResponse, salesByNameResponse, salesByInvoiceTypeResponse, salesByMonthResponse, salesByCustomerNameResponse, salesByDayResponse] = await Promise.allSettled(promises);
    
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
    const salesByCustomerNameStats = salesByCustomerNameResponse.status === 'fulfilled' && salesByCustomerNameResponse.value.data.success 
      ? salesByCustomerNameResponse.value.data.data 
      : null;
    const salesByDayStats = salesByDayResponse && salesByDayResponse.status === 'fulfilled' && salesByDayResponse.value.data.success 
      ? salesByDayResponse.value.data.data 
      : null;
    
    if (pharmacyStats && salesByNameStats) {
      return {
        pharmacyStats,
        salesByNameStats,
        salesByInvoiceTypeStats,
        salesByMonthStats,
        salesByCustomerNameStats,
        salesByDayStats,
        pharmacies,
        selectedBranchCode: branchCode || null,
        selectedMonth: month || null,
        selectedSalesPersonMonth: salesPersonMonth || null,
        selectedInvoiceTypeMonth: invoiceTypeMonth || null,
        selectedCustomerNameMonth: customerNameMonth || null,
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
  const { pharmacyStats, salesByNameStats, salesByInvoiceTypeStats, salesByMonthStats, salesByCustomerNameStats, salesByDayStats, pharmacies, selectedBranchCode, selectedMonth, selectedSalesPersonMonth, selectedInvoiceTypeMonth, selectedCustomerNameMonth } = useLoaderData();
  const { statistics, summary } = pharmacyStats || {};
  const { statistics: salesByNameStatistics, summary: salesByNameSummary } = salesByNameStats || {};
  const { statistics: salesByInvoiceTypeStatistics, summary: salesByInvoiceTypeSummary } = salesByInvoiceTypeStats || {};
  const { statistics: salesByMonthStatistics, summary: salesByMonthSummary } = salesByMonthStats || {};
  const { statistics: salesByCustomerNameStatistics, summary: salesByCustomerNameSummary } = salesByCustomerNameStats || {};
  const { statistics: salesByDayStatistics, summary: salesByDaySummary } = salesByDayStats || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPharmaciesByBranch, setShowPharmaciesByBranch] = useState(false);
  const [showSalesBySalesPerson, setShowSalesBySalesPerson] = useState(false);
  const [showSalesByInvoiceType, setShowSalesByInvoiceType] = useState(false);
  const [showSalesByMonth, setShowSalesByMonth] = useState(false);
  const [showSalesByCustomerName, setShowSalesByCustomerName] = useState(false);

  // Get selected pharmacy name
  const selectedPharmacy = pharmacies.find(p => p.branchCode === parseInt(selectedBranchCode || 0));
  
  // Get selected month from URL params (use from loader or searchParams)
  const currentSelectedMonth = selectedMonth || searchParams.get('month') || '';
  const currentSalesPersonMonth = selectedSalesPersonMonth || searchParams.get('salesPersonMonth') || '';
  const currentInvoiceTypeMonth = selectedInvoiceTypeMonth || searchParams.get('invoiceTypeMonth') || '';
  const currentCustomerNameMonth = selectedCustomerNameMonth || searchParams.get('customerNameMonth') || '';
  
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
    const salesPersonMonth = searchParams.get('salesPersonMonth') || '';
    const invoiceTypeMonth = searchParams.get('invoiceTypeMonth') || '';
    const customerNameMonth = searchParams.get('customerNameMonth') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    if (salesPersonMonth) params.salesPersonMonth = salesPersonMonth;
    if (invoiceTypeMonth) params.invoiceTypeMonth = invoiceTypeMonth;
    if (customerNameMonth) params.customerNameMonth = customerNameMonth;
    setSearchParams(params);
  };

  // Handle month filter change for Sales by Month section
  const handleMonthChange = (e) => {
    const month = e.target.value;
    const branchCode = searchParams.get('branchCode') || '';
    const salesPersonMonth = searchParams.get('salesPersonMonth') || '';
    const invoiceTypeMonth = searchParams.get('invoiceTypeMonth') || '';
    const customerNameMonth = searchParams.get('customerNameMonth') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    if (salesPersonMonth) params.salesPersonMonth = salesPersonMonth;
    if (invoiceTypeMonth) params.invoiceTypeMonth = invoiceTypeMonth;
    if (customerNameMonth) params.customerNameMonth = customerNameMonth;
    setSearchParams(params);
  };

  // Handle month filter change for Sales by Sales Person section
  const handleSalesPersonMonthChange = (e) => {
    const salesPersonMonth = e.target.value;
    const branchCode = searchParams.get('branchCode') || '';
    const month = searchParams.get('month') || '';
    const invoiceTypeMonth = searchParams.get('invoiceTypeMonth') || '';
    const customerNameMonth = searchParams.get('customerNameMonth') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    if (salesPersonMonth) params.salesPersonMonth = salesPersonMonth;
    if (invoiceTypeMonth) params.invoiceTypeMonth = invoiceTypeMonth;
    if (customerNameMonth) params.customerNameMonth = customerNameMonth;
    setSearchParams(params);
  };

  // Handle month filter change for Sales by Invoice Type section
  const handleInvoiceTypeMonthChange = (e) => {
    const invoiceTypeMonth = e.target.value;
    const branchCode = searchParams.get('branchCode') || '';
    const month = searchParams.get('month') || '';
    const salesPersonMonth = searchParams.get('salesPersonMonth') || '';
    const customerNameMonth = searchParams.get('customerNameMonth') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    if (salesPersonMonth) params.salesPersonMonth = salesPersonMonth;
    if (invoiceTypeMonth) params.invoiceTypeMonth = invoiceTypeMonth;
    if (customerNameMonth) params.customerNameMonth = customerNameMonth;
    setSearchParams(params);
  };

  // Handle month filter change for Sales by Customer Name section
  const handleCustomerNameMonthChange = (e) => {
    const customerNameMonth = e.target.value;
    const branchCode = searchParams.get('branchCode') || '';
    const month = searchParams.get('month') || '';
    const salesPersonMonth = searchParams.get('salesPersonMonth') || '';
    const invoiceTypeMonth = searchParams.get('invoiceTypeMonth') || '';
    const params = {};
    if (branchCode) params.branchCode = branchCode;
    if (month) params.month = month;
    if (salesPersonMonth) params.salesPersonMonth = salesPersonMonth;
    if (invoiceTypeMonth) params.invoiceTypeMonth = invoiceTypeMonth;
    if (customerNameMonth) params.customerNameMonth = customerNameMonth;
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">
              <FaStore className="text-primary" />
              Pharmacies by Branch Code
            </h2>
            <button
              onClick={() => setShowPharmaciesByBranch(!showPharmaciesByBranch)}
              className="btn btn-sm btn-primary"
            >
              Pharmacies by Branch Code
            </button>
          </div>
          
          {showPharmaciesByBranch && statistics && statistics.length > 0 ? (
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
          ) : showPharmaciesByBranch ? (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No statistics available
              </p>
              <p className="text-base-content/50">
                No branch codes found in detailed sales records
              </p>
            </div>
          ) : null}
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
            <button
              onClick={() => setShowSalesBySalesPerson(!showSalesBySalesPerson)}
              className="btn btn-sm btn-primary"
            >
              Sales by Sales Person
            </button>
          </div>
          {showSalesBySalesPerson && (
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
                  value={currentSalesPersonMonth || ''}
                  onChange={handleSalesPersonMonthChange}
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
          
          {showSalesBySalesPerson && salesByNameStatistics && salesByNameStatistics.length > 0 ? (
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
                      <th>APT</th>
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
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-primary" />
                            <span className="text-lg font-semibold text-primary">
                              {formatCurrency(stat.totalTransactions > 0 ? stat.totalSales / stat.totalTransactions : 0)}
                            </span>
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
                      <th>
                        <span className="text-lg font-semibold text-primary">
                          {(() => {
                            const totalSales = salesByNameStatistics.reduce((sum, stat) => sum + stat.totalSales, 0);
                            const totalTransactions = salesByNameStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0);
                            return formatCurrency(totalTransactions > 0 ? totalSales / totalTransactions : 0);
                          })()}
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
                    Sales Distribution
                  </h3>
                  {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={pieChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={120}
                            interval={0}
                            tick={{ fontSize: 12, fill: '#666' }}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fontSize: 12, fill: '#666' }}
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
          ) : showSalesBySalesPerson ? (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No sales person statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          ) : null}
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
            <button
              onClick={() => setShowSalesByInvoiceType(!showSalesByInvoiceType)}
              className="btn btn-sm btn-primary"
            >
              Sales by Invoice Type
            </button>
          </div>
          {showSalesByInvoiceType && (
            <div className="form-control w-full md:w-auto mb-4">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" />
                  Filter by Month
                </span>
              </label>
              <select
                className="select select-bordered w-full md:w-64"
                value={currentInvoiceTypeMonth || ''}
                onChange={handleInvoiceTypeMonthChange}
              >
                <option value="">All Months</option>
                {salesByMonthStatistics?.map((stat) => (
                  <option key={`${stat.year}-${stat.month}`} value={`${stat.year}-${String(stat.month).padStart(2, '0')}`}>
                    {stat.monthYear}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {showSalesByInvoiceType && salesByInvoiceTypeStatistics && salesByInvoiceTypeStatistics.length > 0 ? (
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
          ) : showSalesByInvoiceType ? (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No invoice type statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found'}
              </p>
            </div>
          ) : null}
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

      {/* Sales by Customer Name Statistics */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="card-title">
              <FaUsers className="text-primary" />
              Sales by Customer Name
              {selectedPharmacy && (
                <span className="text-lg font-normal text-base-content/70 ml-2">
                  - {selectedPharmacy.name} (Branch: {selectedPharmacy.branchCode})
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowSalesByCustomerName(!showSalesByCustomerName)}
              className="btn btn-sm btn-primary"
            >
              Sales by Customer Name
            </button>
          </div>
          {showSalesByCustomerName && (
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
                  value={currentCustomerNameMonth || ''}
                  onChange={handleCustomerNameMonthChange}
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
          
          {showSalesByCustomerName && salesByCustomerNameStatistics && salesByCustomerNameStatistics.length > 0 ? (
            <>
              {/* Customer Name Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Customers</div>
                  <div className="stat-value text-2xl">{salesByCustomerNameSummary?.totalCustomers || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Sales</div>
                  <div className="stat-value text-2xl">
                    {formatCurrency(salesByCustomerNameSummary?.totalSales || 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-2xl">{salesByCustomerNameSummary?.totalTransactions || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs">Total Units Quantity</div>
                  <div className="stat-value text-2xl">{salesByCustomerNameSummary?.totalQuantity || 0}</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Total Sales</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>APT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByCustomerNameStatistics.map((stat) => (
                      <tr key={stat.customerName} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FaUsers className="text-primary" />
                            <span className="font-semibold">{stat.customerName}</span>
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
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-primary" />
                            <span className="text-lg font-semibold text-primary">
                              {formatCurrency(stat.totalTransactions > 0 ? stat.totalSales / stat.totalTransactions : 0)}
                            </span>
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
                          {formatCurrency(salesByCustomerNameStatistics.reduce((sum, stat) => sum + stat.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">100.00%</span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {salesByCustomerNameStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold text-primary">
                          {(() => {
                            const totalSales = salesByCustomerNameStatistics.reduce((sum, stat) => sum + stat.totalSales, 0);
                            const totalTransactions = salesByCustomerNameStatistics.reduce((sum, stat) => sum + stat.totalTransactions, 0);
                            return formatCurrency(totalTransactions > 0 ? totalSales / totalTransactions : 0);
                          })()}
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
                    Sales Distribution by Customer
                  </h3>
                  {salesByCustomerNameStatistics.length > 0 ? (
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={salesByCustomerNameStatistics} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="customerName" 
                            angle={-45}
                            textAnchor="end"
                            height={120}
                            interval={0}
                            tick={{ fontSize: 12, fill: '#666' }}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fontSize: 12, fill: '#666' }}
                          />
                          <Tooltip 
                            formatter={(value, name, props) => {
                              const totalSales = salesByCustomerNameStatistics?.reduce((sum, stat) => sum + stat.totalSales, 0) || 0;
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
                            {salesByCustomerNameStatistics.map((entry, index) => (
                              <Cell key={`cell-customer-${index}`} fill={COLORS[index % COLORS.length]} />
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
          ) : showSalesByCustomerName ? (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No customer name statistics available
              </p>
              <p className="text-base-content/50">
                {selectedBranchCode ? 'No sales records found for this pharmacy' : 'No sales records found with customer names'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailedSalesStatistics;

