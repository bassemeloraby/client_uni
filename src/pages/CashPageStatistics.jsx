import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaArrowLeft, FaUsers, FaDollarSign, FaShoppingCart, FaBox } from 'react-icons/fa';
import { customFetch } from '../utils';

const CashPageStatistics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await customFetch.get('detailed-sales/cash-detailed/statistics', {
        params: month
          ? {
              year: month.split('-')[0],
              month: month.split('-')[1],
            }
          : {},
      });
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
  }, [month]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/cash" className="btn btn-ghost gap-2">
          <FaArrowLeft className="h-4 w-4" />
          Back to Cash Page
        </Link>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FaMoneyBillWave className="text-primary" />
          Cash Sales Statistics
        </h1>
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
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text font-semibold">Filter by Month</span>
                </label>
                <input
                  type="month"
                  className="input input-bordered w-full md:w-60"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total Customers</div>
                <div className="stat-value text-2xl">{summary?.totalCustomers || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total Sales</div>
                <div className="stat-value text-2xl">{formatCurrency(summary?.totalSales || 0)}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total Transactions</div>
                <div className="stat-value text-2xl">{summary?.totalTransactions || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total Units Quantity</div>
                <div className="stat-value text-2xl">{summary?.totalQuantity || 0}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Total Sales</th>
                    <th>Transactions</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length > 0 ? (
                    stats.map((stat) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <p className="text-base-content/70">No cash customer statistics available.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>
                      <span className="text-lg font-semibold text-success">
                        {formatCurrency(stats.reduce((sum, s) => sum + s.totalSales, 0))}
                      </span>
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
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashPageStatistics;

