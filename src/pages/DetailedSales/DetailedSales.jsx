import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaCalendarAlt,
  FaStore,
  FaFileInvoice,
  FaBox,
  FaDollarSign,
  FaTimes
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "detailed-sales";

export const loader = async ({ request }) => {
  try {
    const params = new URL(request.url).searchParams;
    const queryParams = {};
    
    // Build query string from URL params
    if (params.get('branchCode')) queryParams.branchCode = params.get('branchCode');
    if (params.get('invoiceNumber')) queryParams.invoiceNumber = params.get('invoiceNumber');
    if (params.get('startDate')) queryParams.startDate = params.get('startDate');
    if (params.get('endDate')) queryParams.endDate = params.get('endDate');
    if (params.get('invoiceType')) queryParams.invoiceType = params.get('invoiceType');
    if (params.get('salesName')) queryParams.salesName = params.get('salesName');
    if (params.get('materialNumber')) queryParams.materialNumber = params.get('materialNumber');
    if (params.get('search')) queryParams.search = params.get('search');
    if (params.get('limit')) queryParams.limit = params.get('limit');
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`);
    
    if (response.data.success) {
      return {
        sales: response.data.data,
        total: response.data.total || response.data.data.length,
      };
    }
    throw new Error("Failed to fetch detailed sales");
  } catch (error) {
    console.error("Error fetching detailed sales:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch detailed sales");
  }
};

const DetailedSales = () => {
  const { sales, total } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    branchCode: searchParams.get('branchCode') || '',
    invoiceNumber: searchParams.get('invoiceNumber') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    invoiceType: searchParams.get('invoiceType') || '',
    salesName: searchParams.get('salesName') || '',
    materialNumber: searchParams.get('materialNumber') || '',
  });

  // Update state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setFilters({
      branchCode: searchParams.get('branchCode') || '',
      invoiceNumber: searchParams.get('invoiceNumber') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      invoiceType: searchParams.get('invoiceType') || '',
      salesName: searchParams.get('salesName') || '',
      materialNumber: searchParams.get('materialNumber') || '',
    });
  }, [searchParams]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (searchTerm) params.append('search', searchTerm);
    
    navigate(`/detailed-sales?${params.toString()}`);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      branchCode: '',
      invoiceNumber: '',
      startDate: '',
      endDate: '',
      invoiceType: '',
      salesName: '',
      materialNumber: '',
    });
    setSearchTerm('');
    navigate('/detailed-sales');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val) || searchTerm;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-6xl font-bold text-blue-500'>Detailed Sales</h1>
        <div className="flex items-center gap-4">
          <button
            className="btn btn-outline gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="h-5 w-5" />
            Filters
          </button>
          <button
            className="btn btn-outline gap-2"
            onClick={() => window.print()}
          >
            <FaDownload className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by product name, invoice number, or sales name..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
            <button 
              className="btn btn-square"
              onClick={applyFilters}
            >
              <FaSearch className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Filter Options</h2>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowFilters(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Branch Code */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Branch Code</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter branch code"
                  className="input input-bordered"
                  value={filters.branchCode}
                  onChange={(e) => setFilters({ ...filters, branchCode: e.target.value })}
                />
              </div>

              {/* Invoice Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Invoice Number</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  className="input input-bordered"
                  value={filters.invoiceNumber}
                  onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                />
              </div>

              {/* Start Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              {/* End Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">End Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              {/* Invoice Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Invoice Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.invoiceType}
                  onChange={(e) => setFilters({ ...filters, invoiceType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="Normal">Normal</option>
                  <option value="Return">Return</option>
                  <option value="Exchange">Exchange</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Sales Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sales Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter sales name"
                  className="input input-bordered"
                  value={filters.salesName}
                  onChange={(e) => setFilters({ ...filters, salesName: e.target.value })}
                />
              </div>

              {/* Material Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Material Number</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter material number"
                  className="input input-bordered"
                  value={filters.materialNumber}
                  onChange={(e) => setFilters({ ...filters, materialNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-primary"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 text-sm text-base-content/70">
        Showing {sales.length} of {total} sales records
      </div>

      {/* Sales Table */}
      {sales && sales.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Time</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Sales Name</th>
                <th>Product</th>
                <th>Material #</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>VAT</th>
                <th>Net Total</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
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
                    <span className={`badge ${
                      sale.InvoiceType === 'Normal' ? 'badge-success' :
                      sale.InvoiceType === 'Return' ? 'badge-error' :
                      sale.InvoiceType === 'Exchange' ? 'badge-warning' :
                      'badge-ghost'
                    }`}>
                      {sale.InvoiceType}
                    </span>
                  </td>
                  <td>{sale.SalesName}</td>
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
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span>{formatCurrency(sale.ItemUnitPrice)}</span>
                    </div>
                  </td>
                  <td>{formatCurrency(sale.TotalDiscount)}</td>
                  <td>{formatCurrency(sale.TotalVAT)}</td>
                  <td>
                    <div className="font-semibold text-success">
                      {formatCurrency(sale.NetTotal)}
                    </div>
                  </td>
                  <td>{formatCurrency(sale.DeliveryFees)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="12" className="text-right">Total:</th>
                <th className="text-success">
                  {formatCurrency(sales.reduce((sum, sale) => sum + (sale.NetTotal || 0), 0))}
                </th>
                <th>
                  {formatCurrency(sales.reduce((sum, sale) => sum + (sale.DeliveryFees || 0), 0))}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">
            {hasActiveFilters ? 'No sales found matching your filters' : 'No sales records found'}
          </p>
          {hasActiveFilters && (
            <button
              className="btn btn-outline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedSales;

