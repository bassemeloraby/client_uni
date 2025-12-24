import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams, useNavigation } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaBox,
  FaRedo,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { customFetch } from "../../utils";

const url = "baby-joy";
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
    if (params.get('Material')) queryParams.Material = params.get('Material');
    if (params.get('Brand')) queryParams.Brand = params.get('Brand');
    if (params.get('Form')) queryParams.Form = params.get('Form');
    if (params.get('search')) queryParams.search = params.get('search');
    if (params.get('description')) queryParams.description = params.get('description');
    if (params.get('minPrice')) queryParams.minPrice = params.get('minPrice');
    if (params.get('maxPrice')) queryParams.maxPrice = params.get('maxPrice');
    if (params.get('sortByPrice')) queryParams.sortByPrice = params.get('sortByPrice');
    
    // Pagination
    const page = parseInt(params.get('page')) || 1;
    queryParams.page = page;
    queryParams.limit = ITEMS_PER_PAGE;
    
    const queryString = new URLSearchParams(queryParams).toString();
    
    // Fetch both items and filter options in parallel
    const [itemsResponse, filtersResponse] = await Promise.all([
      customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`),
      customFetch.get(`${url}/filters`)
    ]);
    
    if (itemsResponse.data.success && filtersResponse.data.success) {
      return {
        items: itemsResponse.data.data,
        total: itemsResponse.data.total || itemsResponse.data.data.length,
        page: itemsResponse.data.page || page,
        pages: itemsResponse.data.pages || Math.ceil((itemsResponse.data.total || itemsResponse.data.data.length) / ITEMS_PER_PAGE),
        brands: filtersResponse.data.data.brands || [],
        forms: filtersResponse.data.data.forms || [],
      };
    }
    throw new Error("Failed to fetch baby joy items");
  } catch (error) {
    console.error("Error fetching baby joy items:", error);
    
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
      brands: [],
      forms: [],
      error: error.response?.data?.message || error.message || "Failed to fetch baby joy items",
    };
  }
};

const BabyJoy = () => {
  const { items, total, page, pages, brands: allBrands = [], forms: allForms = [], error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  
  // Check if data is being loaded
  const isLoading = navigation.state === 'loading';
  
  const currentPage = page || 1;
  const totalPages = pages || Math.ceil(total / ITEMS_PER_PAGE);
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [descriptionSearch, setDescriptionSearch] = useState(searchParams.get('description') || '');
  const [showFilters, setShowFilters] = useState(false);
  const sortByPrice = searchParams.get('sortByPrice') || '';
  const [brandSearch, setBrandSearch] = useState('');
  const [formSearch, setFormSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [filters, setFilters] = useState({
    Material: searchParams.get('Material') || '',
    Brand: searchParams.get('Brand') || '',
    Form: searchParams.get('Form') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  
  // Calculate pagination values
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Toggle sort by price (updates URL to trigger backend sorting)
  const handleSortByPrice = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByPrice');
    
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
    
    navigate(`/baby-joy?${params.toString()}`);
  };

  // Apply filters (reset to page 1)
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      // For price fields, allow "0" as a valid value, but skip empty strings
      if (key === 'minPrice' || key === 'maxPrice') {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      } else if (value) {
        params.append(key, value);
      }
    });
    
    if (searchTerm) params.append('search', searchTerm);
    if (descriptionSearch) params.append('description', descriptionSearch);
    params.append('page', '1'); // Reset to first page when applying filters
    
    setShowBrandDropdown(false);
    setShowFormDropdown(false);
    setBrandSearch('');
    setFormSearch('');
    
    navigate(`/baby-joy?${params.toString()}`);
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    navigate(`/baby-joy?${params.toString()}`);
  };

  // Clear filters and reset sort
  const clearFilters = () => {
    setFilters({
      Material: '',
      Brand: '',
      Form: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchTerm('');
    setDescriptionSearch('');
    setBrandSearch('');
    setFormSearch('');
    setShowBrandDropdown(false);
    setShowFormDropdown(false);
    navigate('/baby-joy');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val) || searchTerm || descriptionSearch;

  // Use brands and forms from backend (all unique values)
  const uniqueBrands = allBrands;
  const uniqueForms = allForms;
  
  // Filter brands and forms based on search
  const filteredBrands = uniqueBrands.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const filteredForms = uniqueForms.filter(form =>
    form.toLowerCase().includes(formSearch.toLowerCase())
  );
  
  // Handle brand selection
  const handleBrandSelect = (value) => {
    setFilters({ ...filters, Brand: value });
    setBrandSearch(value || '');
    setShowBrandDropdown(false);
  };
  
  // Handle form selection
  const handleFormSelect = (value) => {
    setFilters({ ...filters, Form: value });
    setFormSearch(value || '');
    setShowFormDropdown(false);
  };
  
  // Update state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setDescriptionSearch(searchParams.get('description') || '');
    const brand = searchParams.get('Brand') || '';
    const form = searchParams.get('Form') || '';
    setFilters({
      Material: searchParams.get('Material') || '',
      Brand: brand,
      Form: form,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    });
    // Reset search fields to show selected values
    if (!brand) setBrandSearch('');
    if (!form) setFormSearch('');
  }, [searchParams]);

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
          <h1 className='text-6xl font-bold text-blue-500'>Baby Joy</h1>
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

      {/* Search Bars */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Search Bar */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">General Search</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by material, brand, form..."
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

        {/* Description Search Bar */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description Search</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by description..."
              className="input input-bordered w-full"
              value={descriptionSearch}
              onChange={(e) => setDescriptionSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
            {descriptionSearch && (
              <button 
                className="btn btn-square btn-ghost"
                onClick={() => {
                  setDescriptionSearch('');
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
              {/* Material */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Material</span>
                </label>
                <input
                  type="number"
                  placeholder="Material code"
                  className="input input-bordered"
                  value={filters.Material}
                  onChange={(e) => setFilters({ ...filters, Material: e.target.value })}
                />
              </div>

              {/* Brand - Searchable */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Brand</span>
                </label>
                <div className="relative">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search or select brand..."
                      className="input input-bordered w-full"
                      value={brandSearch || filters.Brand || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBrandSearch(value);
                        setShowBrandDropdown(true);
                        // Clear filter if input is cleared
                        if (value === '') {
                          setFilters({ ...filters, Brand: '' });
                        }
                      }}
                      onFocus={() => {
                        setShowBrandDropdown(true);
                        // Show search term or current filter value
                        if (filters.Brand) {
                          setBrandSearch(filters.Brand);
                        }
                      }}
                      onBlur={(e) => {
                        // Only close if not clicking on dropdown
                        const relatedTarget = e.relatedTarget;
                        if (!relatedTarget || !relatedTarget.closest('.brand-dropdown')) {
                          setTimeout(() => {
                            setShowBrandDropdown(false);
                            // If no selection made, reset search to show selected value
                            if (filters.Brand && brandSearch !== filters.Brand) {
                              setBrandSearch('');
                            }
                          }, 200);
                        }
                      }}
                    />
                    {filters.Brand && (
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBrandSelect('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  {showBrandDropdown && (filteredBrands.length > 0 || !brandSearch) && (
                    <div className="brand-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-base-200"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleBrandSelect('');
                        }}
                      >
                        <span className="text-sm">All Brands</span>
                      </div>
                      {filteredBrands.map(brand => (
                        <div
                          key={brand}
                          className={`px-4 py-2 cursor-pointer hover:bg-base-200 ${
                            filters.Brand === brand ? 'bg-primary text-primary-content' : ''
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleBrandSelect(brand);
                          }}
                        >
                          <span className="text-sm">{brand}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showBrandDropdown && brandSearch && filteredBrands.length === 0 && (
                    <div className="brand-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                      <div className="px-4 py-2 text-sm text-base-content/70">
                        No brands found
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form - Searchable */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Form</span>
                </label>
                <div className="relative">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search or select form..."
                      className="input input-bordered w-full"
                      value={formSearch || filters.Form || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormSearch(value);
                        setShowFormDropdown(true);
                        // Clear filter if input is cleared
                        if (value === '') {
                          setFilters({ ...filters, Form: '' });
                        }
                      }}
                      onFocus={() => {
                        setShowFormDropdown(true);
                        // Show search term or current filter value
                        if (filters.Form) {
                          setFormSearch(filters.Form);
                        }
                      }}
                      onBlur={(e) => {
                        // Only close if not clicking on dropdown
                        const relatedTarget = e.relatedTarget;
                        if (!relatedTarget || !relatedTarget.closest('.form-dropdown')) {
                          setTimeout(() => {
                            setShowFormDropdown(false);
                            // If no selection made, reset search to show selected value
                            if (filters.Form && formSearch !== filters.Form) {
                              setFormSearch('');
                            }
                          }, 200);
                        }
                      }}
                    />
                    {filters.Form && (
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFormSelect('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  {showFormDropdown && (filteredForms.length > 0 || !formSearch) && (
                    <div className="form-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-base-200"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleFormSelect('');
                        }}
                      >
                        <span className="text-sm">All Forms</span>
                      </div>
                      {filteredForms.map(form => (
                        <div
                          key={form}
                          className={`px-4 py-2 cursor-pointer hover:bg-base-200 ${
                            filters.Form === form ? 'bg-primary text-primary-content' : ''
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormSelect(form);
                          }}
                        >
                          <span className="text-sm">{form}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showFormDropdown && formSearch && filteredForms.length === 0 && (
                    <div className="form-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                      <div className="px-4 py-2 text-sm text-base-content/70">
                        No forms found
                      </div>
                    </div>
                  )}
                </div>
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
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
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
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
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
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <span className="loading loading-ring loading-lg text-primary"></span>
          </div>
        )}
        {items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Material</th>
                <th>SAP Description</th>
                <th>Brand</th>
                <th>Material Detail</th>
                <th>Form</th>
                <th>Units in Cartoon</th>
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
                <th>Number of Backet</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="hover">
                  <td>
                    <div className="flex items-center gap-2">
                      <FaBox className="text-primary" />
                      <span className="font-mono">{item.Material}</span>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <div className="font-semibold">{item.SapDescription}</div>
                    </div>
                  </td>
                  <td>{item.Brand || '-'}</td>
                  <td>
                    <div className="max-w-xs">
                      <span className="text-sm">{item.MaterialDetail || '-'}</span>
                    </div>
                  </td>
                  <td>{item.Form || '-'}</td>
                  <td>{item.UnitsInCartoon || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span className="font-semibold">{formatCurrency(item.Price)}</span>
                    </div>
                  </td>
                  <td>{item.NumberOfBacket || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="6" className="text-right">Total:</th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.Price || 0), 0))}
                </th>
                <th colSpan="1"></th>
              </tr>
            </tfoot>
          </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl text-base-content/70 mb-4">
              {hasActiveFilters ? 'No items found matching your filters' : 'No baby joy items found'}
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

export default BabyJoy;

