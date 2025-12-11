import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaFileInvoice, FaStore, FaUser, FaUsers, FaCalendarAlt, FaBox, FaDollarSign } from 'react-icons/fa';
import { customFetch } from '../utils';

const InsurancePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState('');
  const pageSize = 50;

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await customFetch.get('detailed-sales/insurance-detailed', {
        params: {
          limit: pageSize,
          skip: (page - 1) * pageSize,
          ...(month
            ? {
                year: month.split('-')[0],
                month: month.split('-')[1],
              }
            : {}),
        },
      });
      if (res.data?.success) {
        setSales(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.data?.message || 'Failed to load insurance sales');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load insurance sales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, month]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/detailed-sales" className="btn btn-ghost gap-2">
          <FaArrowLeft className="h-4 w-4" />
          Back to Detailed Sales
        </Link>
        <Link to="/insurance/statistics" className="btn btn-primary btn-sm ml-2">
          Insurance Statistics
        </Link>
        <Link to="/insurance/sales-by-name" className="btn btn-primary btn-sm ml-2">
          Insurance by Sales Person
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-3xl text-primary" />
            <h1 className="text-3xl font-bold text-primary">Insurance Sales</h1>
          </div>
          <p className="text-base-content/70 mb-4">
            Showing detailed sales for insurance transactions.
          </p>

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="form-control w-full md:w-auto">
                  <label className="label">
                    <span className="label-text font-semibold">Filter by Month</span>
                  </label>
                  <input
                    type="month"
                    className="input input-bordered w-full md:w-60"
                    value={month}
                    onChange={(e) => {
                      setPage(1);
                      setMonth(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Branch</th>
                    <th>Invoice Type</th>
                    <th>Sales Person</th>
                    <th>Customer Name</th>
                    <th>Product</th>
                    <th>Material #</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Net Price</th>
                    <th>Net Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale._id} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <FaFileInvoice className="text-primary" />
                            <span className="font-mono text-xs">{sale.InvoiceNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            <span>{formatDate(sale.InvoiceDate)}</span>
                          </div>
                        </td>
                        <td>{sale.InvoiceTime}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaStore className="text-primary" />
                            <span>{sale.BranchCode}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-warning">{sale.InvoiceType}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaUser className="text-primary" />
                            <span>{sale.SalesName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaUsers className="text-info" />
                            <span>{sale.CustomerName || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="max-w-xs">
                            <div className="font-semibold truncate">{sale.Name}</div>
                            <div className="text-xs text-base-content/70">{sale.UnitOfMeasurement}</div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaBox className="text-primary" />
                            <span>{sale.MaterialNumber}</span>
                          </div>
                        </td>
                        <td>{sale.Quantity}</td>
                        <td>
                          <span className="text-success font-semibold">
                            {formatCurrency(sale.ItemUnitPrice)}
                          </span>
                        </td>
                        <td>
                          <span className="text-success font-semibold">
                            {formatCurrency(sale.ItemsNetPrice)}
                          </span>
                        </td>
                        <td>
                          <span className="text-success font-semibold">
                            {formatCurrency(sale.NetTotal)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" className="text-center py-8">
                        <p className="text-base-content/70">No insurance sales found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="9">Totals (this page)</th>
                    <th>
                      <span className="text-lg font-semibold">
                        {sales.reduce((sum, sale) => sum + (sale.Quantity || 0), 0)}
                      </span>
                    </th>
                    <th></th>
                    <th>
                      <span className="text-lg font-semibold text-success">
                        {formatCurrency(sales.reduce((sum, sale) => sum + (sale.ItemsNetPrice || 0), 0))}
                      </span>
                    </th>
                    <th>
                      <span className="text-lg font-semibold text-success">
                        {formatCurrency(sales.reduce((sum, sale) => sum + (sale.NetTotal || 0), 0))}
                      </span>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && !error && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <div className="text-sm text-base-content/70">
                Page {page} of {Math.max(1, Math.ceil(total / pageSize))} · Showing{' '}
                {sales.length > 0 ? (page - 1) * pageSize + 1 : 0}-
                {(page - 1) * pageSize + sales.length} of {total}
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
                  disabled={page * pageSize >= total}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;

