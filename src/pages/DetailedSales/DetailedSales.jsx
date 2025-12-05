import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaCalendarAlt,
  FaStore,
  FaFileInvoice,
  FaBox,
  FaDollarSign,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaChartBar,
  FaExclamationTriangle,
  FaLock
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "detailed-sales";
const ITEMS_PER_PAGE = 100;

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
    
    // Build query string from URL params
    if (params.get('branchCode')) queryParams.branchCode = params.get('branchCode');
    if (params.get('invoiceNumber')) queryParams.invoiceNumber = params.get('invoiceNumber');
    if (params.get('startDate')) queryParams.startDate = params.get('startDate');
    if (params.get('endDate')) queryParams.endDate = params.get('endDate');
    if (params.get('invoiceType')) queryParams.invoiceType = params.get('invoiceType');
    if (params.get('salesName')) queryParams.salesName = params.get('salesName');
    if (params.get('materialNumber')) queryParams.materialNumber = params.get('materialNumber');
    if (params.get('search')) queryParams.search = params.get('search');
    
    // Pagination
    const page = parseInt(params.get('page')) || 1;
    queryParams.limit = ITEMS_PER_PAGE;
    queryParams.skip = (page - 1) * ITEMS_PER_PAGE;
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`);
    
    if (response.data.success) {
      return {
        sales: response.data.data,
        total: response.data.total || response.data.data.length,
        page,
      };
    }
    throw new Error("Failed to fetch detailed sales");
  } catch (error) {
    console.error("Error fetching detailed sales:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      hasResponse: !!error.response
    });
    
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
    
    // Handle 403 errors - permission denied
    if (error.response?.status === 403 || error.status === 403) {
      console.log("403 Permission denied - returning error data");
      return {
        sales: [],
        total: 0,
        page: 1,
        permissionError: error.response?.data?.message || error.response?.data?.error || 'Access denied. You are not authorized to view these reports.',
        permissionReason: error.response?.data?.reason || 'You are not assigned as a supervisor for this pharmacy. Only the assigned supervisor or an administrator can view pharmacy reports.',
      };
    }
    
    // For any other error, return empty data instead of throwing to prevent navigation
    console.warn("Unexpected error in detailed sales loader:", error);
    return {
      sales: [],
      total: 0,
      page: 1,
      permissionError: error.response?.data?.message || error.message || "Failed to fetch detailed sales",
      permissionReason: "An unexpected error occurred while loading the data.",
    };
  }
};

const DetailedSales = () => {
  const { sales, total, page, permissionError, permissionReason } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentPage = page || 1;
  
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
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

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

  // Apply filters (reset to page 1)
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', '1'); // Reset to first page when applying filters
    
    navigate(`/detailed-sales?${params.toString()}`);
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
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

  // Handle permission error
  if (permissionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/pharmacies"
            className="btn btn-ghost gap-2"
          >
            <FaChevronLeft className="h-4 w-4" />
            Back to Pharmacies
          </Link>
        </div>

        <div className="card bg-base-100 shadow-xl border-2 border-error">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="text-4xl text-error" />
              <h1 className="text-3xl font-bold text-error">
                Access Denied
              </h1>
            </div>
            
            <div className="divider"></div>
            
            <div className="alert alert-error">
              <FaExclamationTriangle className="text-2xl" />
              <div>
                <h3 className="font-bold">Permission Error</h3>
                <div className="text-sm mt-2">
                  {permissionError}
                </div>
                {permissionReason && (
                  <div className="text-sm mt-2">
                    <strong>Reason:</strong> {permissionReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-6xl font-bold text-blue-500'>Detailed Sales</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/detailed-sales/statistics"
            className="btn btn-primary gap-2"
          >
            <FaChartBar className="h-5 w-5" />
            Statistics
          </Link>
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
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-base-content/70">
          Showing {startIndex} to {endIndex} of {total} sales records
        </div>
        {totalPages > 1 && (
          <div className="text-sm text-base-content/70">
            Page {currentPage} of {totalPages}
          </div>
        )}
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
                <th>Items Net Price</th>
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
                  <td>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-info" />
                      <span>{formatCurrency(sale.ItemsNetPrice)}</span>
                    </div>
                  </td>
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
                <th colSpan="13" className="text-right">Total:</th>
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
            Previous
          </button>
          
          <div className="join">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                );
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <button className="join-item btn btn-sm btn-disabled" disabled>
                        ...
                      </button>
                    )}
                    <button
                      className={`join-item btn btn-sm ${
                        currentPage === page ? 'btn-active' : ''
                      }`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedSales;

