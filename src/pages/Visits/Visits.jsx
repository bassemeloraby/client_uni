import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams, useNavigation } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaUser,
  FaClock,
  FaGlobe,
  FaChartBar,
  FaEye,
  FaRedo,
  FaCalendarAlt,
} from 'react-icons/fa';
import { customFetch } from "../../utils";
import { toast } from 'react-toastify';

const url = "visits";
const DEFAULT_ITEMS_PER_PAGE = 50;
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];

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
    if (params.get('userId')) queryParams.userId = params.get('userId');
    if (params.get('path')) queryParams.path = params.get('path');
    if (params.get('startDate')) queryParams.startDate = params.get('startDate');
    if (params.get('endDate')) queryParams.endDate = params.get('endDate');
    
    // Pagination
    const page = parseInt(params.get('page')) || 1;
    const limit = parseInt(params.get('limit')) || DEFAULT_ITEMS_PER_PAGE;
    queryParams.page = page;
    queryParams.limit = limit;
    
    // Sorting
    if (params.get('sortBy')) queryParams.sortBy = params.get('sortBy');
    if (params.get('sortOrder')) queryParams.sortOrder = params.get('sortOrder');
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`);
    
    if (response.data.success) {
      // Also fetch stats
      const statsResponse = await customFetch.get(`${url}/stats${queryParams.startDate || queryParams.endDate ? `?startDate=${queryParams.startDate || ''}&endDate=${queryParams.endDate || ''}` : ''}`);
      
      return {
        visits: response.data.data,
        total: response.data.total || response.data.data.length,
        page: response.data.page || page,
        limit: limit,
        pages: response.data.pages || Math.ceil((response.data.total || response.data.data.length) / limit),
        stats: statsResponse.data.success ? statsResponse.data.data : null,
      };
    }
    throw new Error("Failed to fetch visits");
  } catch (error) {
    console.error("Error fetching visits:", error);
    
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
      visits: [],
      total: 0,
      page: 1,
      limit: DEFAULT_ITEMS_PER_PAGE,
      pages: 0,
      stats: null,
      error: error.response?.data?.message || error.message || "Failed to fetch visits",
    };
  }
};

const Visits = () => {
  const { visits, total, page, limit, pages, stats, error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  
  // Check if data is being loaded
  const isLoading = navigation.state === 'loading';
  
  const [filters, setFilters] = useState({
    userId: searchParams.get('userId') || '',
    path: searchParams.get('path') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when filtering
    params.set('page', '1');
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      path: '',
      startDate: '',
      endDate: '',
    });
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newLimit) => {
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page when changing limit
    setSearchParams(params);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatUser = (user) => {
    if (!user) return 'Unknown';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold text-blue-500 flex items-center gap-3">
          <FaEye className="text-5xl" />
          Site Visits
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-primary gap-2"
          >
            <FaRedo className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn gap-2 ${showFilters ? 'btn-active' : 'btn-outline'}`}
          >
            <FaFilter className="h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/70">Total Visits</h2>
              <p className="text-3xl font-bold text-primary">{stats.totalVisits?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/70">Unique Users</h2>
              <p className="text-3xl font-bold text-secondary">{stats.uniqueUsers?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/70">Most Visited Page</h2>
              <p className="text-lg font-semibold truncate">
                {stats.mostVisitedPages?.[0]?._id || 'N/A'}
              </p>
              <p className="text-sm text-base-content/70">
                {stats.mostVisitedPages?.[0]?.count || 0} visits
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/70">Top User</h2>
              <p className="text-lg font-semibold truncate">
                {formatUser(stats.visitsByUser?.[0]?.user)}
              </p>
              <p className="text-sm text-base-content/70">
                {stats.visitsByUser?.[0]?.count || 0} visits
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">User ID</span>
                </label>
                <input
                  type="text"
                  placeholder="Filter by user ID"
                  className="input input-bordered"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Path</span>
                </label>
                <input
                  type="text"
                  placeholder="Filter by path"
                  className="input input-bordered"
                  value={filters.path}
                  onChange={(e) => handleFilterChange('path', e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">End Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={applyFilters} className="btn btn-primary">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn btn-ghost">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          <FaTimes />
          <span>{error}</span>
        </div>
      )}

      {/* Visits Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body relative">
          {isLoading && (
            <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <span className="loading loading-ring loading-lg text-primary"></span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Path</th>
                  <th>Method</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {visits && visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr key={visit._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <FaUser className="text-primary" />
                          <div>
                            <div className="font-semibold">
                              {formatUser(visit.user)}
                            </div>
                            <div className="text-sm text-base-content/70">
                              @{visit.user?.username || 'unknown'}
                            </div>
                            {visit.user?.role && (
                              <div className="badge badge-sm badge-info mt-1">
                                {visit.user.role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FaGlobe className="text-secondary" />
                          <span className="font-mono text-sm">{visit.path}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline">{visit.method || 'GET'}</span>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{visit.ipAddress || 'N/A'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-base-content/70" />
                          <span>{formatDate(visit.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <p className="text-lg text-base-content/70">No visits found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-6 space-y-4">
              {/* Items per page selector and info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-base-content/70">
                    Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                    <span className="font-semibold">{total.toLocaleString()}</span> visits
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">Items per page:</label>
                    <select
                      className="select select-bordered select-sm"
                      value={limit}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-base-content/70">
                    Page <span className="font-semibold">{page}</span> of{' '}
                    <span className="font-semibold">{pages}</span>
                  </div>
                  <div className="join">
                    {/* First page button */}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1}
                      title="First page"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    {/* Previous page button */}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      title="Previous page"
                    >
                      <FaChevronLeft />
                    </button>
                    
                    {/* Page numbers */}
                    {(() => {
                      const pageNumbers = [];
                      const maxVisible = 5;
                      
                      if (pages <= maxVisible) {
                        // Show all pages if total pages <= maxVisible
                        for (let i = 1; i <= pages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        // Always show first page
                        if (page > 3) {
                          pageNumbers.push(1);
                          if (page > 4) {
                            pageNumbers.push('ellipsis-start');
                          }
                        }
                        
                        // Show pages around current page
                        let start = Math.max(1, page - 2);
                        let end = Math.min(pages, page + 2);
                        
                        // Adjust if we're near the start
                        if (page <= 3) {
                          end = Math.min(maxVisible, pages);
                        }
                        // Adjust if we're near the end
                        if (page >= pages - 2) {
                          start = Math.max(1, pages - maxVisible + 1);
                        }
                        
                        for (let i = start; i <= end; i++) {
                          pageNumbers.push(i);
                        }
                        
                        // Always show last page
                        if (page < pages - 2) {
                          if (page < pages - 3) {
                            pageNumbers.push('ellipsis-end');
                          }
                          pageNumbers.push(pages);
                        }
                      }
                      
                      return pageNumbers.map((pageNum, index) => {
                        if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                          return (
                            <button key={`ellipsis-${index}`} className="join-item btn btn-sm btn-disabled" disabled>
                              ...
                            </button>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`join-item btn btn-sm ${page === pageNum ? 'btn-active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    
                    {/* Next page button */}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      title="Next page"
                    >
                      <FaChevronRight />
                    </button>
                    {/* Last page button */}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(pages)}
                      disabled={page === pages}
                      title="Last page"
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visits;

