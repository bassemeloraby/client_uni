import React, { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FaShieldAlt, FaDollarSign, FaFileInvoice, FaBox, FaArrowLeft, FaChartBar } from 'react-icons/fa';
import { customFetch } from '../../utils';

const url = "detailed-sales/insurance/by-customer";

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

    const response = await customFetch.get(url);
    if (response.data.success) {
      return {
        data: response.data.data || [],
        count: response.data.count || 0,
      };
    }
    throw new Error("Failed to fetch insurance sales by customer");
  } catch (error) {
    console.error("Error fetching insurance sales by customer:", error);
    
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
    
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch insurance sales by customer");
  }
};

const InsuranceByCustomer = () => {
  const { data: initialData, count: initialCount } = useLoaderData();
  const [data, setData] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await customFetch.get(url);
      if (res.data?.success) {
        setData(res.data.data || []);
        setCount(res.data.count || 0);
      } else {
        setError(res.data?.message || 'Failed to load insurance sales by customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load insurance sales by customer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  // Calculate grand total
  const grandTotal = data.reduce((sum, item) => sum + (item.totalNetPrice || 0), 0);
  const grandTotalItemsNetPrice = data.reduce((sum, item) => sum + (item.totalItemsNetPrice || 0), 0);
  const grandTotalVAT = data.reduce((sum, item) => sum + (item.totalVAT || 0), 0);
  const grandTotalDiscount = data.reduce((sum, item) => sum + (item.totalDiscount || 0), 0);
  const grandTotalQuantity = data.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  const grandTotalTransactions = data.reduce((sum, item) => sum + (item.transactionCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/insurance" className="btn btn-ghost gap-2">
          <FaArrowLeft className="h-4 w-4" />
          Back to Insurance Sales
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaChartBar className="text-4xl text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            Insurance by Customer Name
          </h1>
        </div>
        <p className="text-base-content/70">
          Total Net Price summary for each insurance company
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
          {/* Summary Stats */}
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaShieldAlt className="text-3xl" />
              </div>
              <div className="stat-title">Total Insurance Companies</div>
              <div className="stat-value text-primary">{count}</div>
              <div className="stat-desc">Companies with sales records</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-success">
                <FaDollarSign className="text-3xl" />
              </div>
              <div className="stat-title">Grand Total Net Price</div>
              <div className="stat-value text-success">{formatCurrency(grandTotal)}</div>
              <div className="stat-desc">Total across all companies</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-info">
                <FaFileInvoice className="text-3xl" />
              </div>
              <div className="stat-title">Total Transactions</div>
              <div className="stat-value text-info">{grandTotalTransactions.toLocaleString()}</div>
              <div className="stat-desc">All insurance transactions</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-warning">
                <FaBox className="text-3xl" />
              </div>
              <div className="stat-title">Total Quantity</div>
              <div className="stat-value text-warning">{grandTotalQuantity.toLocaleString()}</div>
              <div className="stat-desc">Items sold</div>
            </div>
          </div>

          {/* Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Insurance Company</th>
                      <th className="text-right">Total Net Price</th>
                      <th className="text-right">Items Net Price</th>
                      <th className="text-right">Total VAT</th>
                      <th className="text-right">Total Discount</th>
                      <th className="text-right">Total Quantity</th>
                      <th className="text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, index) => (
                        <tr key={index} className="hover">
                          <td className="font-semibold">{index + 1}</td>
                          <td className="font-semibold">{item.customerName || 'N/A'}</td>
                          <td className="text-right font-bold text-primary">
                            {formatCurrency(item.totalNetPrice)}
                          </td>
                          <td className="text-right">
                            {formatCurrency(item.totalItemsNetPrice)}
                          </td>
                          <td className="text-right text-success">
                            {formatCurrency(item.totalVAT)}
                          </td>
                          <td className="text-right text-warning">
                            {formatCurrency(item.totalDiscount)}
                          </td>
                          <td className="text-right">
                            {item.totalQuantity.toLocaleString()}
                          </td>
                          <td className="text-right">
                            {item.transactionCount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-8">
                          <p className="text-base-content/70">No insurance sales found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-base-200">
                      <td colSpan="2" className="text-right">Grand Total:</td>
                      <td className="text-right text-primary text-lg">
                        {formatCurrency(grandTotal)}
                      </td>
                      <td className="text-right text-lg">
                        {formatCurrency(grandTotalItemsNetPrice)}
                      </td>
                      <td className="text-right text-success text-lg">
                        {formatCurrency(grandTotalVAT)}
                      </td>
                      <td className="text-right text-warning text-lg">
                        {formatCurrency(grandTotalDiscount)}
                      </td>
                      <td className="text-right text-lg">
                        {grandTotalQuantity.toLocaleString()}
                      </td>
                      <td className="text-right text-lg">
                        {grandTotalTransactions.toLocaleString()}
                      </td>
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

export default InsuranceByCustomer;

