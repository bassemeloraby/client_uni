import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaStore, 
  FaArrowLeft,
  FaHashtag,
  FaBuilding,
  FaDollarSign,
  FaUser,
  FaShoppingCart,
  FaBox
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "detailed-sales/stats/pharmacies-by-branch";
const salesByNameUrl = "detailed-sales/stats/sales-by-name";

export const loader = async () => {
  try {
    const [pharmacyStatsResponse, salesByNameResponse] = await Promise.all([
      customFetch.get(url),
      customFetch.get(salesByNameUrl),
    ]);
    
    if (pharmacyStatsResponse.data.success && salesByNameResponse.data.success) {
      return {
        pharmacyStats: pharmacyStatsResponse.data.data,
        salesByNameStats: salesByNameResponse.data.data,
      };
    }
    throw new Error("Failed to fetch statistics");
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch statistics");
  }
};

const DetailedSalesStatistics = () => {
  const { pharmacyStats, salesByNameStats } = useLoaderData();
  const { statistics, summary } = pharmacyStats || {};
  const { statistics: salesByNameStatistics, summary: salesByNameSummary } = salesByNameStats || {};

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
          <h2 className="card-title mb-4">
            <FaUser className="text-primary" />
            Sales by Sales Person
          </h2>
          
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
                  <div className="stat-title text-xs">Total Quantity</div>
                  <div className="stat-value text-2xl">{salesByNameSummary?.totalQuantity || 0}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Sales Person</th>
                      <th>Total Sales</th>
                      <th>% of Total</th>
                      <th>Transactions</th>
                      <th>Total Quantity</th>
                      <th>Net Total</th>
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
                          <div className="flex items-center gap-2">
                            <FaBox className="text-primary" />
                            <span className="font-semibold">{stat.totalQuantity}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-success" />
                            <span className="font-semibold text-success">
                              {formatCurrency(stat.totalNetTotal)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/detailed-sales?salesName=${encodeURIComponent(stat.salesName)}`}
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
                        <span className="text-lg font-semibold">
                          {salesByNameStatistics.reduce((sum, stat) => sum + stat.totalQuantity, 0)}
                        </span>
                      </th>
                      <th>
                        <span className="text-lg font-semibold text-success">
                          {formatCurrency(salesByNameStatistics.reduce((sum, stat) => sum + stat.totalNetTotal, 0))}
                        </span>
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-base-content/70 mb-4">
                No sales person statistics available
              </p>
              <p className="text-base-content/50">
                No sales records found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedSalesStatistics;

