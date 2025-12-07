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
  FaTag,
  FaBuilding,
  FaSortAmountDown,
  FaRedo,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "contests";
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
    if (params.get('Company')) queryParams.Company = params.get('Company');
    if (params.get('Category')) queryParams.Category = params.get('Category');
    if (params.get('search')) queryParams.search = params.get('search');
    if (params.get('minPrice')) queryParams.minPrice = params.get('minPrice');
    if (params.get('maxPrice')) queryParams.maxPrice = params.get('maxPrice');
    if (params.get('minIncentive')) queryParams.minIncentive = params.get('minIncentive');
    if (params.get('maxIncentive')) queryParams.maxIncentive = params.get('maxIncentive');
    if (params.get('sortByPrice')) queryParams.sortByPrice = params.get('sortByPrice');
    if (params.get('sortByIncentive')) queryParams.sortByIncentive = params.get('sortByIncentive');
    
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
    throw new Error("Failed to fetch contests");
  } catch (error) {
    console.error("Error fetching contests:", error);
    
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
      error: error.response?.data?.message || error.message || "Failed to fetch contests",
    };
  }
};

const Contests = () => {
  const { items, total, page, pages, error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentPage = page || 1;
  const totalPages = pages || Math.ceil(total / ITEMS_PER_PAGE);
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const sortByPrice = searchParams.get('sortByPrice') || '';
  const sortByIncentive = searchParams.get('sortByIncentive') || '';
  const [filters, setFilters] = useState({
    Company: searchParams.get('Company') || '',
    Category: searchParams.get('Category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minIncentive: searchParams.get('minIncentive') || '',
    maxIncentive: searchParams.get('maxIncentive') || '',
  });
  
  // Calculate pagination values
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

  // Update state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setFilters({
      Company: searchParams.get('Company') || '',
      Category: searchParams.get('Category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minIncentive: searchParams.get('minIncentive') || '',
      maxIncentive: searchParams.get('maxIncentive') || '',
    });
  }, [searchParams]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value}%`;
  };

  // Toggle sort by price (updates URL to trigger backend sorting)
  const handleSortByPrice = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByPrice');
    
    // Clear Incentive sort when sorting by Price
    params.delete('sortByIncentive');
    
    // Cycle through: no sort -> desc -> asc -> no sort
    if (!currentSort || currentSort === '') {
      params.set('sortByPrice', 'desc');
    } else if (currentSort === 'desc') {
      params.set('sortByPrice', 'asc');
    } else {
      params.delete('sortByPrice');
    }
    
    // Reset to page 1 when changing sort
    params.set('page', '1');
    
    navigate(`/contests?${params.toString()}`);
  };

  // Toggle sort by incentive (updates URL to trigger backend sorting)
  const handleSortByIncentive = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByIncentive');
    
    // Clear Price sort when sorting by Incentive
    params.delete('sortByPrice');
    
    // Cycle through: no sort -> desc -> asc -> no sort
    if (!currentSort || currentSort === '') {
      params.set('sortByIncentive', 'desc');
    } else if (currentSort === 'desc') {
      params.set('sortByIncentive', 'asc');
    } else {
      params.delete('sortByIncentive');
    }
    
    // Reset to page 1 when changing sort
    params.set('page', '1');
    
    navigate(`/contests?${params.toString()}`);
  };

  // Apply filters (reset to page 1)
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', '1'); // Reset to first page when applying filters
    
    navigate(`/contests?${params.toString()}`);
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    navigate(`/contests?${params.toString()}`);
  };

  // Clear filters and reset sort
  const clearFilters = () => {
    setFilters({
      Company: '',
      Category: '',
      minPrice: '',
      maxPrice: '',
      minIncentive: '',
      maxIncentive: '',
    });
    setSearchTerm('');
    navigate('/contests');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val) || searchTerm;

  // Get unique values for filter dropdowns
  const uniqueCompanies = [...new Set(items.map(item => item.Company).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(items.map(item => item.Category).filter(Boolean))].sort();

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
          <h1 className='text-6xl font-bold text-blue-500'>Contests</h1>
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
            <span className="label-text">Search</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by SAP code, company, category, WH description..."
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
              {/* Company */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Company}
                  onChange={(e) => setFilters({ ...filters, Company: e.target.value })}
                >
                  <option value="">All Companies</option>
                  {uniqueCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Category}
                  onChange={(e) => setFilters({ ...filters, Category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Price</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>

              {/* Max Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Price</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>

              {/* Min Incentive */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Min Incentive</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.minIncentive}
                  onChange={(e) => setFilters({ ...filters, minIncentive: e.target.value })}
                />
              </div>

              {/* Max Incentive */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Incentive</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={filters.maxIncentive}
                  onChange={(e) => setFilters({ ...filters, maxIncentive: e.target.value })}
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
                <th>Company</th>
                <th>SAP Code</th>
                <th>WH Description</th>
                <th>Category</th>
                <th 
                  className="cursor-pointer hover:bg-base-200 select-none"
                  onClick={handleSortByPrice}
                  title="Click to sort by Price"
                >
                  <div className="flex items-center gap-2">
                    <span>Price</span>
                    <div className="flex flex-col">
                      {sortByPrice === 'asc' ? (
                        <FaArrowUp className="text-primary text-xs" />
                      ) : sortByPrice === 'desc' ? (
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
                <th>Total Incentive</th>
                <th 
                  className="cursor-pointer hover:bg-base-200 select-none"
                  onClick={handleSortByIncentive}
                  title="Click to sort by Incentive"
                >
                  <div className="flex items-center gap-2">
                    <span>Incentive</span>
                    <div className="flex flex-col">
                      {sortByIncentive === 'asc' ? (
                        <FaArrowUp className="text-primary text-xs" />
                      ) : sortByIncentive === 'desc' ? (
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
                      <FaBuilding className="text-primary" />
                      <span className="font-semibold">{item.Company || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono">{item.SAP_Code || '-'}</span>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <span className="font-semibold">{item['WH Description'] || '-'}</span>
                    </div>
                  </td>
                  <td>{item.Category || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span className="font-semibold">{formatCurrency(item.Price)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaTag className="text-info" />
                      <span>{formatPercentage(item['Total Incentive'])}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-success">
                      {formatCurrency(item.Incentive || 0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="4" className="text-right">Total:</th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.Price || 0), 0))}
                </th>
                <th></th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.Incentive || 0), 0))}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl text-base-content/70 mb-4">
            {hasActiveFilters ? 'No items found matching your filters' : 'No contests found'}
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

export default Contests;
