import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaArrowLeft, FaBuilding, FaDollarSign, FaShoppingCart, FaBox, FaChartBar, FaHashtag } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { customFetch } from '../../utils';

const SalesByPharmacies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await customFetch.get('detailed-sales/stats/sales-by-pharmacies');
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
    fetchStats();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Prepare chart data
  const chartData = stats.map((stat) => {
    const totalSales = summary?.totalSales || 0;
    const percentage = totalSales > 0 ? (stat.totalSales / totalSales) * 100 : 0;
    return {
      name: stat.pharmacyName,
      value: stat.totalSales,
      percentage: percentage,
      transactions: stat.totalTransactions,
      quantity: stat.totalQuantity,
    };
  });

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
          <FaStore className="text-4xl text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            Sales by Pharmacies
          </h1>
        </div>
        <p className="text-base-content/70">
          Statistics showing sales data for each individual pharmacy
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FaBuilding className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-base-content/70">Total Pharmacies</h3>
                    <p className="text-3xl font-bold">{summary?.totalPharmacies || 0}</p>
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
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-info/10 rounded-lg">
                    <FaShoppingCart className="text-2xl text-info" />
                  </div>
                  <div>
                    <h3 className="text-sm text-base-content/70">Total Transactions</h3>
                    <p className="text-3xl font-bold">{summary?.totalTransactions || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <FaBox className="text-2xl text-warning" />
                  </div>
                  <div>
                    <h3 className="text-sm text-base-content/70">Total Quantity</h3>
                    <p className="text-3xl font-bold">{summary?.totalQuantity || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaChartBar className="text-primary" />
                Sales Distribution by Pharmacy
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
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
                        if (name === 'value') {
                          return [
                            `${formatCurrency(value)} (${formatPercentage(props.payload.percentage)}%)`,
                            'Sales'
                          ];
                        }
                        return [value, name];
                      }}
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
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

          {/* Statistics Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaStore className="text-primary" />
                Pharmacy Sales Details
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Pharmacy Name</th>
                      <th>Branch Code</th>
                      <th>Total Sales</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.length > 0 ? (
                      stats.map((stat) => (
                        <tr key={stat.pharmacyId} className="hover">
                          <td>
                            <div className="flex items-center gap-2">
                              <FaBuilding className="text-primary" />
                              <span className="font-semibold">{stat.pharmacyName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <FaHashtag className="text-primary" />
                              <span className="font-mono font-semibold">{stat.branchCode}</span>
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
                            <div className="flex items-center gap-2">
                              <FaBox className="text-success" />
                              <span className="font-semibold">{stat.totalQuantity}</span>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-8">
                          <p className="text-base-content/70">No sales data available for pharmacies.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th></th>
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
                      <th>
                        <span className="text-lg font-semibold">
                          {stats.reduce((sum, s) => sum + s.totalQuantity, 0)}
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

export default SalesByPharmacies;
