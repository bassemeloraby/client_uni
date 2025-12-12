import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaFileInvoice, FaArrowLeft, FaDollarSign, FaShoppingCart, FaBox, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { customFetch } from '../../utils';

const SalesByInvoiceType = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [salesByMonthStats, setSalesByMonthStats] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [month, setMonth] = useState(searchParams.get('month') || '');

  const fetchSalesByMonth = async () => {
    try {
      const res = await customFetch.get('detailed-sales/stats/sales-by-month');
      if (res.data?.success) {
        setSalesByMonthStats(res.data.data.statistics || []);
      }
    } catch (err) {
      console.error('Error fetching sales by month:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {};
      if (month) {
        const [year, monthNum] = month.split('-');
        params.year = year;
        params.month = monthNum;
      }

      const res = await customFetch.get('detailed-sales/stats/sales-by-invoice-type', { params });
      if (res.data?.success) {
        setStats(res.data.data.statistics || []);
        setSummary(res.data.data.summary || null);
      } else {
        setError(res.data?.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesByMonth();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [month]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    const params = {};
    if (newMonth) params.month = newMonth;
    setSearchParams(params);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Colors for chart
  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#eab308', '#dc2626', '#0ea5e9'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/detailed-sales/statistics"
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Detailed Sales Statistics
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaFileInvoice className="text-4xl text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            Sales by Invoice Type
          </h1>
        </div>
        <p className="text-base-content/70">
          Statistics showing sales data grouped by invoice type
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Filters */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaCalendarAlt className="text-primary" />
                Filters
              </h2>
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    Filter by Month
                  </span>
                </label>
                <select
                  className="select select-bordered w-full md:w-64"
                  value={month}
                  onChange={handleMonthChange}
                >
                  <option value="">All Months</option>
                  {salesByMonthStats.map((stat) => (
                    <option key={`${stat.year}-${stat.month}`} value={`${stat.year}-${String(stat.month).padStart(2, '0')}`}>
                      {stat.monthYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <FaFileInvoice className="text-xl md:text-2xl text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm text-base-content/70">Total Invoice Types</h3>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                      {summary?.totalInvoiceTypes || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-success/10 rounded-lg flex-shrink-0">
                    <FaDollarSign className="text-xl md:text-2xl text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm text-base-content/70">Total Sales</h3>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-words overflow-wrap-anywhere">
                      {formatCurrency(summary?.totalSales || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-info/10 rounded-lg flex-shrink-0">
                    <FaShoppingCart className="text-xl md:text-2xl text-info" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm text-base-content/70">Total Transactions</h3>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                      {summary?.totalTransactions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-warning/10 rounded-lg flex-shrink-0">
                    <FaBox className="text-xl md:text-2xl text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm text-base-content/70">Total Quantity</h3>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                      {summary?.totalQuantity || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaChartBar className="text-primary" />
                Invoice Type Distribution
              </h2>
              {stats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stats.map((stat, index) => ({
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
                      {stats.map((entry, index) => (
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

          {/* Statistics Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaFileInvoice className="text-primary" />
                Invoice Type Details
              </h2>
              <div className="overflow-x-auto">
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
                    {stats.length > 0 ? (
                      stats.map((stat) => (
                        <tr key={stat.invoiceType} className="hover">
                          <td>
                            <div className="flex items-center gap-2">
                              <FaFileInvoice className="text-primary" />
                              <span className="font-semibold">{stat.invoiceType}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1 md:gap-2">
                              <FaDollarSign className="text-warning text-sm md:text-base flex-shrink-0" />
                              <span className="text-sm sm:text-base md:text-lg font-semibold text-success break-words">
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
                                to={`/detailed-sales?invoiceType=${encodeURIComponent(stat.invoiceType)}`}
                                className="btn btn-sm btn-primary gap-2"
                              >
                                <FaChartBar />
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-8">
                          <p className="text-base-content/70">No sales data available for invoice types.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th>
                        <span className="text-sm sm:text-base md:text-lg font-semibold text-success break-words">
                          {formatCurrency(stats.reduce((sum, s) => sum + s.totalSales, 0))}
                        </span>
                      </th>
                      <th>
                        <span className="badge badge-primary badge-lg">100.00%</span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold">
                          {stats.reduce((sum, s) => sum + s.totalTransactions, 0)}
                        </span>
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesByInvoiceType;
