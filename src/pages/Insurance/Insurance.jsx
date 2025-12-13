import React, { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FaShieldAlt, FaStore, FaUser, FaCalendarAlt, FaBox, FaDollarSign, FaSearch, FaFilter, FaArrowLeft } from 'react-icons/fa';
import { customFetch } from '../../utils';

const url = "detailed-sales/insurance";

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

    const params = new URL(request.url).searchParams;
    const queryParams = {};
    
    if (params.get('branchCode')) queryParams.branchCode = params.get('branchCode');
    if (params.get('invoiceNumber')) queryParams.invoiceNumber = params.get('invoiceNumber');
    if (params.get('invoiceDate')) queryParams.invoiceDate = params.get('invoiceDate');
    if (params.get('invoiceType')) queryParams.invoiceType = params.get('invoiceType');
    if (params.get('salesName')) queryParams.salesName = params.get('salesName');
    if (params.get('materialNumber')) queryParams.materialNumber = params.get('materialNumber');
    if (params.get('search')) queryParams.search = params.get('search');
    if (params.get('limit')) queryParams.limit = params.get('limit');
    if (params.get('skip')) queryParams.skip = params.get('skip');

    const response = await customFetch.get(url, { params: queryParams });
    if (response.data.success) {
      return {
        sales: response.data.data || [],
        total: response.data.total || 0,
        count: response.data.count || 0,
      };
    }
    throw new Error("Failed to fetch insurance sales");
  } catch (error) {
    console.error("Error fetching insurance sales:", error);
    
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
    
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch insurance sales");
  }
};

const Insurance = () => {
  const { sales: initialSales, total: initialTotal } = useLoaderData();
  const [sales, setSales] = useState(initialSales);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Filters
  const [branchCode, setBranchCode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('');
  const [salesName, setSalesName] = useState('');
  const [materialNumber, setMaterialNumber] = useState('');
  const [search, setSearch] = useState('');

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
      };

      if (branchCode) params.branchCode = branchCode;
      if (invoiceNumber) params.invoiceNumber = invoiceNumber;
      if (invoiceDate) params.invoiceDate = invoiceDate;
      if (invoiceType) params.invoiceType = invoiceType;
      if (salesName) params.salesName = salesName;
      if (materialNumber) params.materialNumber = materialNumber;
      if (search) params.search = search;

      const res = await customFetch.get(url, { params });
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
  }, [page, branchCode, invoiceNumber, invoiceDate, invoiceType, salesName, materialNumber, search]);

  const handleResetFilters = () => {
    setBranchCode('');
    setInvoiceNumber('');
    setInvoiceDate('');
    setInvoiceType('');
    setSalesName('');
    setMaterialNumber('');
    setSearch('');
    setPage(1);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="btn btn-ghost gap-2">
          <FaArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-4xl text-primary" />
            <h1 className="text-4xl font-bold text-primary">
              Insurance Sales
            </h1>
          </div>
          <Link
            to="/insurance/by-customer"
            className="btn btn-primary gap-2"
          >
            <FaShieldAlt className="h-4 w-4" />
            Insurance by Customer Name
          </Link>
        </div>
        <p className="text-base-content/70">
          View and filter sales records for insurance companies
        </p>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <FaFilter className="text-primary" />
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaStore className="text-primary" />
                  Branch Code
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                placeholder="Enter branch code"
                value={branchCode}
                onChange={(e) => {
                  setBranchCode(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaDollarSign className="text-primary" />
                  Invoice Number
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Enter invoice number"
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" />
                  Invoice Date
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., 3/24/2025"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Invoice Type</span>
              </label>
              <select
                className="select select-bordered"
                value={invoiceType}
                onChange={(e) => {
                  setInvoiceType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="Normal">Normal</option>
                <option value="Return">Return</option>
                <option value="Exchange">Exchange</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaUser className="text-primary" />
                  Sales Name
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Enter sales person name"
                value={salesName}
                onChange={(e) => {
                  setSalesName(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaBox className="text-primary" />
                  Material Number
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                placeholder="Enter material number"
                value={materialNumber}
                onChange={(e) => {
                  setMaterialNumber(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FaSearch className="text-primary" />
                  Search
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <button className="btn btn-outline" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
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
          {/* Summary */}
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaShieldAlt className="text-3xl" />
              </div>
              <div className="stat-title">Total Insurance Records</div>
              <div className="stat-value text-primary">{total}</div>
              <div className="stat-desc">Showing {sales.length} on this page</div>
            </div>
          </div>

          {/* Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Insurance Company</th>
                      <th>Sales Person</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Net Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length > 0 ? (
                      sales.map((sale) => (
                        <tr key={sale._id} className="hover">
                          <td>{sale.BranchCode}</td>
                          <td className="font-mono text-sm">{sale.InvoiceNumber}</td>
                          <td>{sale.InvoiceDate}</td>
                          <td>{sale.InvoiceTime}</td>
                          <td>
                            <span className={`badge ${
                              sale.InvoiceType === 'Normal' ? 'badge-success' :
                              sale.InvoiceType === 'Return' ? 'badge-error' :
                              sale.InvoiceType === 'Exchange' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {sale.InvoiceType}
                            </span>
                          </td>
                          <td className="font-semibold">{sale.CustomerName || 'N/A'}</td>
                          <td>{sale.SalesName}</td>
                          <td>
                            <div className="max-w-xs truncate" title={sale.Name}>
                              {sale.Name}
                            </div>
                            <div className="text-xs text-base-content/60">
                              Material: {sale.MaterialNumber}
                            </div>
                          </td>
                          <td>{sale.Quantity} {sale.UnitOfMeasurement}</td>
                          <td>{formatCurrency(sale.ItemUnitPrice)}</td>
                          <td className="font-semibold text-success">
                            {formatCurrency(sale.ItemsNetPrice)}
                          </td>
                          <td className="font-semibold text-primary">
                            {formatCurrency(sale.NetTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center py-8">
                          <p className="text-base-content/70">No insurance sales found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
};

export default Insurance;

