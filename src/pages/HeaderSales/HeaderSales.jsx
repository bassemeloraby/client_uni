import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaStore,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaRedo,
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "header-sales";
const ITEMS_PER_PAGE = 50;

export const loader = async ({ request }) => {
  try {
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.jwt) {
      throw new Response("Unauthorized", { 
        status: 401,
        statusText: "Authentication required"
      });
    }

    const params = new URL(request.url).searchParams;
    const queryParams = {};
    
    // Build query string from URL params
    if (params.get('StoreCode')) queryParams.StoreCode = params.get('StoreCode');
    if (params.get('InvoiceNumber')) queryParams.InvoiceNumber = params.get('InvoiceNumber');
    if (params.get('Year')) queryParams.Year = params.get('Year');
    if (params.get('Month')) queryParams.Month = params.get('Month');
    if (params.get('Date')) queryParams.Date = params.get('Date');
    if (params.get('InvoiceType')) queryParams.InvoiceType = params.get('InvoiceType');
    if (params.get('UserName')) queryParams.UserName = params.get('UserName');
    if (params.get('CustomerName')) queryParams.CustomerName = params.get('CustomerName');
    if (params.get('ConsumerName')) queryParams.ConsumerName = params.get('ConsumerName');
    if (params.get('minAmount')) queryParams.minAmount = params.get('minAmount');
    if (params.get('maxAmount')) queryParams.maxAmount = params.get('maxAmount');
    if (params.get('sortByDate')) queryParams.sortByDate = params.get('sortByDate');
    if (params.get('sortByAmount')) queryParams.sortByAmount = params.get('sortByAmount');
    
    // Pagination
    const page = parseInt(params.get('page')) || 1;
    queryParams.page = page;
    queryParams.limit = ITEMS_PER_PAGE;
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`);
    
    if (response.data.success) {
      return {
        items: response.data.data,
        total: response.data.total || response.data.data.length,
        page: response.data.page || page,
        pages: response.data.pages || Math.ceil((response.data.total || response.data.data.length) / ITEMS_PER_PAGE),
      };
    }
    throw new Error("Failed to fetch header sales");
  } catch (error) {
    console.error("Error fetching header sales:", error);
    
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
    
    return {
      items: [],
      total: 0,
      page: 1,
      pages: 0,
      error: error.response?.data?.message || error.message || "Failed to fetch header sales",
    };
  }
};

const HeaderSales = () => {
  const { items, total, page, pages, error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentPage = page || 1;
  const totalPages = pages || Math.ceil(total / ITEMS_PER_PAGE);
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('InvoiceNumber') || '');
  const [showFilters, setShowFilters] = useState(false);
  const sortByDate = searchParams.get('sortByDate') || '';
  const sortByAmount = searchParams.get('sortByAmount') || '';
  const [filters, setFilters] = useState({
    StoreCode: searchParams.get('StoreCode') || '',
    Year: searchParams.get('Year') || '',
    Month: searchParams.get('Month') || '',
    InvoiceType: searchParams.get('InvoiceType') || '',
    UserName: searchParams.get('UserName') || '',
    CustomerName: searchParams.get('CustomerName') || '',
    ConsumerName: searchParams.get('ConsumerName') || '',
    minAmount: searchParams.get('minAmount') || '',
    maxAmount: searchParams.get('maxAmount') || '',
  });
  
  // Calculate pagination values
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

  // Update state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('InvoiceNumber') || '');
    setFilters({
      StoreCode: searchParams.get('StoreCode') || '',
      Year: searchParams.get('Year') || '',
      Month: searchParams.get('Month') || '',
      InvoiceType: searchParams.get('InvoiceType') || '',
      UserName: searchParams.get('UserName') || '',
      CustomerName: searchParams.get('CustomerName') || '',
      ConsumerName: searchParams.get('ConsumerName') || '',
      minAmount: searchParams.get('minAmount') || '',
      maxAmount: searchParams.get('maxAmount') || '',
    });
  }, [searchParams]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Toggle sort by date (updates URL to trigger backend sorting)
  const handleSortByDate = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByDate');
    
    // Clear Amount sort when sorting by Date
    params.delete('sortByAmount');
    
    // Cycle through: no sort -> desc -> asc -> no sort
    if (!currentSort || currentSort === '') {
      params.set('sortByDate', 'desc');
    } else if (currentSort === 'desc') {
      params.set('sortByDate', 'asc');
    } else {
      params.delete('sortByDate');
    }
    
    // Reset to page 1 when changing sort
    params.set('page', '1');
    
    navigate(`/header-sales?${params.toString()}`);
  };

  // Toggle sort by amount (updates URL to trigger backend sorting)
  const handleSortByAmount = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByAmount');
    
    // Clear Date sort when sorting by Amount
    params.delete('sortByDate');
    
    // Cycle through: no sort -> desc -> asc -> no sort
    if (!currentSort || currentSort === '') {
      params.set('sortByAmount', 'desc');
    } else if (currentSort === 'desc') {
      params.set('sortByAmount', 'asc');
    } else {
      params.delete('sortByAmount');
    }
    
    // Reset to page 1 when changing sort
    params.set('page', '1');
    
    navigate(`/header-sales?${params.toString()}`);
  };

  // Apply filters (reset to page 1)
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (searchTerm) params.append('InvoiceNumber', searchTerm);
    params.append('page', '1'); // Reset to first page when applying filters
    
    navigate(`/header-sales?${params.toString()}`);
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    navigate(`/header-sales?${params.toString()}`);
  };

  // Clear filters and reset sort
  const clearFilters = () => {
    setFilters({
      StoreCode: '',
      Year: '',
      Month: '',
      InvoiceType: '',
      UserName: '',
      CustomerName: '',
      ConsumerName: '',
      minAmount: '',
      maxAmount: '',
    });
    setSearchTerm('');
    navigate('/header-sales');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val) || searchTerm;

  // Get unique values for filter dropdowns
  const uniqueStoreCodes = [...new Set(items.map(item => item.StoreCode).filter(Boolean))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(items.map(item => item.Year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const uniqueInvoiceTypes = [...new Set(items.map(item => item.InvoiceType).filter(Boolean))].sort();
  const uniqueUserNames = [...new Set(items.map(item => item.UserName).filter(Boolean))].sort();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className='text-6xl font-bold text-blue-500'>Header Sales</h1>
          <p className="text-lg text-base-content/70 mt-2">
            {hasActiveFilters 
              ? `Showing ${items.length} of ${total} items`
              : `${total} ${total === 1 ? 'item' : 'items'}`
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <button
              className="btn btn-error gap-2"
              onClick={clearFilters}
              title="Reset all filters and sorting"
            >
              <FaRedo className="h-5 w-5" />
              Reset Filters
            </button>
          )}
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
          <label className="label">
            <span className="label-text">Search by Invoice Number</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Search invoice number..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
            {searchTerm && (
              <button 
                className="btn btn-square btn-ghost"
                onClick={() => {
                  setSearchTerm('');
                  applyFilters();
                }}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}
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
              {/* Store Code */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Store Code</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.StoreCode}
                  onChange={(e) => setFilters({ ...filters, StoreCode: e.target.value })}
                >
                  <option value="">All Store Codes</option>
                  {uniqueStoreCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Year</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Year}
                  onChange={(e) => setFilters({ ...filters, Year: e.target.value })}
                >
                  <option value="">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Month</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Month}
                  onChange={(e) => setFilters({ ...filters, Month: e.target.value })}
                >
                  <option value="">All Months</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Invoice Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.InvoiceType}
                  onChange={(e) => setFilters({ ...filters, InvoiceType: e.target.value })}
                >
                  <option value="">All Types</option>
                  {uniqueInvoiceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* User Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">User Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Search user name..."
                  className="input input-bordered"
                  value={filters.UserName}
                  onChange={(e) => setFilters({ ...filters, UserName: e.target.value })}
                />
              </div>

              {/* Customer Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Customer Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Search customer name..."
                  className="input input-bordered"
                  value={filters.CustomerName}
                  onChange={(e) => setFilters({ ...filters, CustomerName: e.target.value })}
                />
              </div>

              {/* Consumer Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Consumer Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Search consumer name..."
                  className="input input-bordered"
                  value={filters.ConsumerName}
                  onChange={(e) => setFilters({ ...filters, ConsumerName: e.target.value })}
                />
              </div>

              {/* Min Amount */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Amount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                />
              </div>

              {/* Max Amount */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Amount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
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
          Showing {startIndex} to {endIndex} of {total} items
        </div>
        {totalPages > 1 && (
          <div className="text-sm text-base-content/70">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Items Table */}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Store Code</th>
                <th>Invoice Number</th>
                <th>Year</th>
                <th>Month</th>
                <th 
                  className="cursor-pointer hover:bg-base-200 select-none"
                  onClick={handleSortByDate}
                  title="Click to sort by Date"
                >
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                    <div className="flex flex-col">
                      {sortByDate === 'asc' ? (
                        <FaArrowUp className="text-primary text-xs" />
                      ) : sortByDate === 'desc' ? (
                        <FaArrowDown className="text-primary text-xs" />
                      ) : (
                        <div className="flex flex-col gap-0.5 opacity-30">
                          <FaArrowUp className="text-xs" />
                          <FaArrowDown className="text-xs -mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th>Time</th>
                <th>Invoice Type</th>
                <th>User Name</th>
                <th>Customer Name</th>
                <th>Consumer Name</th>
                <th 
                  className="cursor-pointer hover:bg-base-200 select-none"
                  onClick={handleSortByAmount}
                  title="Click to sort by Amount"
                >
                  <div className="flex items-center gap-2">
                    <span>Total Amount</span>
                    <div className="flex flex-col">
                      {sortByAmount === 'asc' ? (
                        <FaArrowUp className="text-primary text-xs" />
                      ) : sortByAmount === 'desc' ? (
                        <FaArrowDown className="text-primary text-xs" />
                      ) : (
                        <div className="flex flex-col gap-0.5 opacity-30">
                          <FaArrowUp className="text-xs" />
                          <FaArrowDown className="text-xs -mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="hover">
                  <td>
                    <div className="flex items-center gap-2">
                      <FaStore className="text-primary" />
                      <span className="font-semibold">{item.StoreCode || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaFileInvoice className="text-info" />
                      <span className="font-mono text-sm">{item.InvoiceNumber || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold">{item.Year || '-'}</span>
                  </td>
                  <td>
                    <span className="font-semibold">{item.Month || '-'}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-success" />
                      <span>{formatDate(item.Date)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-warning" />
                      <span>{item.Time || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-outline">{item.InvoiceType || '-'}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary" />
                      <span>{item.UserName || '-'}</span>
                    </div>
                  </td>
                  <td>{item.CustomerName || '-'}</td>
                  <td>{item.ConsumerName || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span className="font-semibold">{formatCurrency(item.TotalAmountAfterDiscount)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="9" className="text-right">Total:</th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.TotalAmountAfterDiscount || 0), 0))}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">
            {hasActiveFilters ? 'No items found matching your filters' : 'No header sales found'}
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
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                );
              })
              .map((page, index, array) => {
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

export default HeaderSales;

