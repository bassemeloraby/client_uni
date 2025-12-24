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
  FaTag,
  FaBox,
  FaLayerGroup,
  FaSortAmountDown,
  FaRedo,
  FaImage,
  FaExternalLinkAlt,
  FaArrowUp,
  FaArrowDown,
  FaFileExcel,
  FaPrint
} from 'react-icons/fa';
import { customFetch } from "../../utils";
import * as XLSX from 'xlsx';

const url = "incentive-items";
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
    if (params.get('Class')) queryParams.Class = params.get('Class');
    if (params.get('Category')) queryParams.Category = params.get('Category');
    // Backend expects 'Sub category' with space in query string
    const subCategory = params.get('Sub_category') || params.get('Sub category');
    if (subCategory) queryParams['Sub category'] = subCategory;
    if (params.get('Division')) queryParams.Division = params.get('Division');
    if (params.get('search')) queryParams.search = params.get('search');
    if (params.get('description')) queryParams.description = params.get('description');
    if (params.get('minPrice')) queryParams.minPrice = params.get('minPrice');
    if (params.get('maxPrice')) queryParams.maxPrice = params.get('maxPrice');
    if (params.get('activeIngredients')) queryParams.activeIngredients = params.get('activeIngredients');
    if (params.get('sortByIncentiveValue')) queryParams.sortByIncentiveValue = params.get('sortByIncentiveValue');
    if (params.get('sortByPrice')) queryParams.sortByPrice = params.get('sortByPrice');
    
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
    throw new Error("Failed to fetch incentive items");
  } catch (error) {
    console.error("Error fetching incentive items:", error);
    
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
      error: error.response?.data?.message || error.message || "Failed to fetch incentive items",
    };
  }
};

const IncentiveItems = () => {
  const { items, total, page, pages, error } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  
  // State for all unique active ingredients (fetched separately)
  const [allUniqueActiveIngredients, setAllUniqueActiveIngredients] = useState([]);
  
  // Check if data is being loaded
  const isLoading = navigation.state === 'loading';
  
  const currentPage = page || 1;
  const totalPages = pages || Math.ceil(total / ITEMS_PER_PAGE);
  
  // Fetch all unique active ingredients on component mount
  useEffect(() => {
    const fetchAllActiveIngredients = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !user.jwt) return;
        
        // Fetch all items (with high limit) to get all unique active ingredients
        const response = await customFetch.get(`${url}?limit=10000&page=1`);
        
        if (response.data.success && response.data.data) {
          const allItems = response.data.data;
          const allIngredients = allItems
            .flatMap(item => item.activeIngredients || [])
            .filter(Boolean);
          const uniqueIngredients = [...new Set(allIngredients)].sort();
          setAllUniqueActiveIngredients(uniqueIngredients);
        }
      } catch (error) {
        console.error("Error fetching all active ingredients:", error);
      }
    };
    
    fetchAllActiveIngredients();
  }, []);
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [descriptionSearch, setDescriptionSearch] = useState(searchParams.get('description') || '');
  const [showFilters, setShowFilters] = useState(false);
  const sortByIncentiveValue = searchParams.get('sortByIncentiveValue') || '';
  const sortByPrice = searchParams.get('sortByPrice') || '';
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [activeIngredientsSearch, setActiveIngredientsSearch] = useState('');
  const [showActiveIngredientsDropdown, setShowActiveIngredientsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    Class: searchParams.get('Class') || '',
    Category: searchParams.get('Category') || '',
    Sub_category: searchParams.get('Sub_category') || '',
    Division: searchParams.get('Division') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    activeIngredients: searchParams.get('activeIngredients') || '',
  });
  
  // Calculate pagination values
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

  // Helper function to get subcategories for a category
  const getSubCategoriesForCategory = (category) => {
    if (!category) {
      // If no category selected, show all subcategories
      return [...new Set(items.map(item => item.Sub_category).filter(Boolean))].sort();
    }
    // Filter items by category, then get unique subcategories
    return [...new Set(
      items
        .filter(item => item.Category === category)
        .map(item => item.Sub_category)
        .filter(Boolean)
    )].sort();
  };

  // Update state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setDescriptionSearch(searchParams.get('description') || '');
    const category = searchParams.get('Category') || '';
    // Handle both Sub_category (new) and Sub category (old) for backward compatibility
    const subCategory = searchParams.get('Sub_category') || searchParams.get('Sub category') || '';
    
    // Validate that subcategory belongs to the selected category
    let validSubCategory = subCategory;
    if (category && subCategory) {
      const validSubCategories = getSubCategoriesForCategory(category);
      if (!validSubCategories.includes(subCategory)) {
        validSubCategory = ''; // Reset if subcategory doesn't belong to category
      }
    }
    
    setFilters({
      Class: searchParams.get('Class') || '',
      Category: category,
      Sub_category: validSubCategory,
      Division: searchParams.get('Division') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      activeIngredients: searchParams.get('activeIngredients') || '',
    });
  }, [searchParams, items]);

  // Validate subcategory when category changes (handles programmatic changes)
  useEffect(() => {
    if (filters.Category && filters.Sub_category) {
      const validSubCategories = getSubCategoriesForCategory(filters.Category);
      if (!validSubCategories.includes(filters.Sub_category)) {
        // Reset subcategory if it doesn't belong to the selected category
        setFilters(prev => ({ ...prev, Sub_category: '' }));
        setSubCategorySearch('');
      }
    }
  }, [filters.Category, items]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Open Google image search for description
  const openGoogleImageSearch = (description) => {
    if (!description) return;
    const searchQuery = encodeURIComponent(description);
    const googleImageUrl = `https://www.google.com/search?tbm=isch&q=${searchQuery}`;
    window.open(googleImageUrl, '_blank', 'noopener,noreferrer');
  };

  // Toggle sort by incentive value (updates URL to trigger backend sorting)
  const handleSortByIncentiveValue = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByIncentiveValue');
    
    // Clear Price sort when sorting by Incentive Value
    params.delete('sortByPrice');
    
    // Cycle through: no sort -> desc -> asc -> no sort
    if (!currentSort || currentSort === '') {
      params.set('sortByIncentiveValue', 'desc');
    } else if (currentSort === 'desc') {
      params.set('sortByIncentiveValue', 'asc');
    } else {
      params.delete('sortByIncentiveValue');
    }
    
    // Reset to page 1 when changing sort
    params.set('page', '1');
    
    navigate(`/incentive-items?${params.toString()}`);
  };

  // Toggle sort by price (updates URL to trigger backend sorting)
  const handleSortByPrice = () => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sortByPrice');
    
    // Clear Incentive Value sort when sorting by Price
    params.delete('sortByIncentiveValue');
    
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
    
    navigate(`/incentive-items?${params.toString()}`);
  };

  // Apply filters (reset to page 1)
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        // Backend expects 'Sub category' with space in query string
        if (key === 'Sub_category') {
          params.append('Sub category', value);
        } else {
          params.append(key, value);
        }
      }
    });
    
    if (searchTerm) params.append('search', searchTerm);
    if (descriptionSearch) params.append('description', descriptionSearch);
    params.append('page', '1'); // Reset to first page when applying filters
    
    setShowSubCategoryDropdown(false);
    setSubCategorySearch('');
    setShowActiveIngredientsDropdown(false);
    setActiveIngredientsSearch('');
    navigate(`/incentive-items?${params.toString()}`);
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    navigate(`/incentive-items?${params.toString()}`);
  };

  // Clear filters and reset sort
  const clearFilters = () => {
    setFilters({
      Class: '',
      Category: '',
      Sub_category: '',
      Division: '',
      minPrice: '',
      maxPrice: '',
      activeIngredients: '',
    });
    setSearchTerm('');
    setDescriptionSearch('');
    setSubCategorySearch('');
    setShowSubCategoryDropdown(false);
    setActiveIngredientsSearch('');
    setShowActiveIngredientsDropdown(false);
    navigate('/incentive-items');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val) || searchTerm || descriptionSearch;

  // Get unique values for filter dropdowns
  const uniqueClasses = [...new Set(items.map(item => item.Class).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(items.map(item => item.Category).filter(Boolean))].sort();
  const uniqueDivisions = [...new Set(items.map(item => item.Division).filter(Boolean))].sort();
  
  // Get subcategories filtered by selected category
  const uniqueSubCategories = getSubCategoriesForCategory(filters.Category);
  
  // Filter sub categories based on search
  const filteredSubCategories = uniqueSubCategories.filter(subCat =>
    subCat.toLowerCase().includes(subCategorySearch.toLowerCase())
  );
  
  // Use all unique active ingredients from the fetched data, fallback to current page items
  const uniqueActiveIngredients = allUniqueActiveIngredients.length > 0 
    ? allUniqueActiveIngredients 
    : [...new Set(items.flatMap(item => item.activeIngredients || []).filter(Boolean))].sort();
  
  // Get selected active ingredients as array
  const selectedActiveIngredients = filters.activeIngredients
    ? filters.activeIngredients.split(',').map(ing => ing.trim()).filter(Boolean)
    : [];
  
  // Filter active ingredients based on search
  const filteredActiveIngredients = uniqueActiveIngredients.filter(ing =>
    ing.toLowerCase().includes(activeIngredientsSearch.toLowerCase()) &&
    !selectedActiveIngredients.includes(ing)
  );
  
  // Handle sub category selection
  const handleSubCategorySelect = (value) => {
    setFilters({ ...filters, Sub_category: value });
    setSubCategorySearch(value || '');
    setShowSubCategoryDropdown(false);
  };
  
  // Handle active ingredient selection (add to list)
  const handleActiveIngredientSelect = (ingredient) => {
    const currentIngredients = selectedActiveIngredients;
    if (!currentIngredients.includes(ingredient)) {
      const updatedIngredients = [...currentIngredients, ingredient];
      setFilters({ ...filters, activeIngredients: updatedIngredients.join(', ') });
    }
    setActiveIngredientsSearch('');
    setShowActiveIngredientsDropdown(false);
  };
  
  // Handle active ingredient removal
  const handleActiveIngredientRemove = (ingredient) => {
    const updatedIngredients = selectedActiveIngredients.filter(ing => ing !== ingredient);
    setFilters({ 
      ...filters, 
      activeIngredients: updatedIngredients.length > 0 ? updatedIngredients.join(', ') : '' 
    });
  };
  
  // Clear all active ingredients
  const handleClearActiveIngredients = () => {
    setFilters({ ...filters, activeIngredients: '' });
    setActiveIngredientsSearch('');
    setShowActiveIngredientsDropdown(false);
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      setShowExportDropdown(false);

      // Build query params from current filters
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'minPrice' || key === 'maxPrice') {
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
          }
        } else if (key === 'Sub_category') {
          if (value) params.append('Sub category', value);
        } else if (value) {
          params.append(key, value);
        }
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (descriptionSearch) params.append('description', descriptionSearch);
      if (sortByIncentiveValue) params.append('sortByIncentiveValue', sortByIncentiveValue);
      if (sortByPrice) params.append('sortByPrice', sortByPrice);
      
      // Fetch all data (no pagination limit)
      params.append('limit', '10000');
      params.append('page', '1');

      const queryString = params.toString();
      const response = await customFetch.get(`${url}${queryString ? `?${queryString}` : ''}`);
      
      if (response.data.success) {
        const allItems = response.data.data;
        
        // Prepare data for Excel
        const excelData = allItems.map(item => ({
          'SAP Code': item.SAP_Code || '',
          'Description': item.Description || '',
          'Division': item.Division || '',
          'Category': item.Category || '',
          'Sub Category': item.Sub_category || '',
          'Active Ingredients': item.activeIngredients && item.activeIngredients.length > 0 
            ? item.activeIngredients.join(', ') 
            : '',
          'Price': item.Price || 0,
          'Incentive %': item.IncentivePercentage ? (item.IncentivePercentage * 100).toFixed(2) + '%' : '',
          'Incentive Value': item.incentive_value || 0,
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Incentive Items');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `IncentiveItems_Export_${timestamp}.xlsx`;

        // Write file
        XLSX.writeFile(wb, filename);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
          <h1 className='text-6xl font-bold text-blue-500'>Incentive Items</h1>
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
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline gap-2"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              <FaDownload className="h-5 w-5" />
              Export
              {isExporting && <span className="loading loading-spinner loading-sm"></span>}
            </div>
            {showExportDropdown && (
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
                onBlur={() => setTimeout(() => setShowExportDropdown(false), 200)}
              >
                <li>
                  <a onClick={exportToExcel} className="gap-2">
                    <FaFileExcel className="h-4 w-4 text-green-600" />
                    Export to Excel
                  </a>
                </li>
                <li>
                  <a onClick={() => { window.print(); setShowExportDropdown(false); }} className="gap-2">
                    <FaPrint className="h-4 w-4" />
                    Print
                  </a>
                </li>
              </ul>
            )}
          </div>
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
              placeholder="Search by category, SAP code, active ingredients..."
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
              {/* Class */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Class</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Class}
                  onChange={(e) => setFilters({ ...filters, Class: e.target.value })}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
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
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    // Reset subcategory when category changes
                    setFilters({ 
                      ...filters, 
                      Category: newCategory,
                      Sub_category: '' // Reset subcategory when category changes
                    });
                    setSubCategorySearch('');
                    setShowSubCategoryDropdown(false);
                  }}
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub Category - Searchable */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sub Category</span>
                </label>
                <div className="relative">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search or select sub category..."
                      className="input input-bordered w-full"
                      value={subCategorySearch || filters.Sub_category || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSubCategorySearch(value);
                        setShowSubCategoryDropdown(true);
                        // Clear filter if input is cleared
                        if (value === '') {
                          setFilters({ ...filters, Sub_category: '' });
                        }
                      }}
                      onFocus={() => {
                        setShowSubCategoryDropdown(true);
                        // Show search term or current filter value
                        if (filters.Sub_category) {
                          setSubCategorySearch(filters.Sub_category);
                        }
                      }}
                      onBlur={(e) => {
                        // Only close if not clicking on dropdown
                        const relatedTarget = e.relatedTarget;
                        if (!relatedTarget || !relatedTarget.closest('.sub-category-dropdown')) {
                          setTimeout(() => {
                            setShowSubCategoryDropdown(false);
                            // If no selection made, reset search to show selected value
                            if (filters.Sub_category && subCategorySearch !== filters.Sub_category) {
                              setSubCategorySearch('');
                            }
                          }, 200);
                        }
                      }}
                    />
                    {filters.Sub_category && (
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubCategorySelect('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  {showSubCategoryDropdown && (filteredSubCategories.length > 0 || !subCategorySearch) && (
                    <div className="sub-category-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-base-200"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSubCategorySelect('');
                        }}
                      >
                        <span className="text-sm">All Sub Categories</span>
                      </div>
                      {filteredSubCategories.map(subCat => (
                        <div
                          key={subCat}
                          className={`px-4 py-2 cursor-pointer hover:bg-base-200 ${
                            filters.Sub_category === subCat ? 'bg-primary text-primary-content' : ''
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSubCategorySelect(subCat);
                          }}
                        >
                          <span className="text-sm">{subCat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showSubCategoryDropdown && subCategorySearch && filteredSubCategories.length === 0 && (
                    <div className="sub-category-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                      <div className="px-4 py-2 text-sm text-base-content/70">
                        No sub categories found
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Division */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Division</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.Division}
                  onChange={(e) => setFilters({ ...filters, Division: e.target.value })}
                >
                  <option value="">All Divisions</option>
                  {uniqueDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
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

              {/* Active Ingredients - Searchable Multi-Select */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Active Ingredients</span>
                </label>
                <div className="relative">
                  {/* Selected Ingredients Badges */}
                  {selectedActiveIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedActiveIngredients.map(ingredient => (
                        <div
                          key={ingredient}
                          className="badge badge-primary badge-lg gap-2"
                        >
                          <span>{ingredient}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle p-0 h-4 w-4 min-h-0"
                            onClick={() => handleActiveIngredientRemove(ingredient)}
                            title={`Remove ${ingredient}`}
                          >
                            <FaTimes className="h-2 w-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search or select active ingredients..."
                      className="input input-bordered w-full"
                      value={activeIngredientsSearch}
                      onChange={(e) => {
                        const value = e.target.value;
                        setActiveIngredientsSearch(value);
                        setShowActiveIngredientsDropdown(true);
                      }}
                      onFocus={() => {
                        setShowActiveIngredientsDropdown(true);
                      }}
                      onBlur={(e) => {
                        // Only close if not clicking on dropdown
                        const relatedTarget = e.relatedTarget;
                        if (!relatedTarget || !relatedTarget.closest('.active-ingredients-dropdown')) {
                          setTimeout(() => {
                            setShowActiveIngredientsDropdown(false);
                            setActiveIngredientsSearch('');
                          }, 200);
                        }
                      }}
                    />
                    {selectedActiveIngredients.length > 0 && (
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClearActiveIngredients();
                        }}
                        title="Clear all selected ingredients"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  
                  {showActiveIngredientsDropdown && (
                    <div className="active-ingredients-dropdown absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredActiveIngredients.length > 0 ? (
                        filteredActiveIngredients.map(ingredient => (
                          <div
                            key={ingredient}
                            className="px-4 py-2 cursor-pointer hover:bg-base-200"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleActiveIngredientSelect(ingredient);
                            }}
                          >
                            <span className="text-sm">{ingredient}</span>
                          </div>
                        ))
                      ) : uniqueActiveIngredients.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-base-content/70">
                          No active ingredients found in database
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-sm text-base-content/70">
                          {activeIngredientsSearch ? `No ingredients found matching "${activeIngredientsSearch}"` : 'All ingredients are already selected'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Select multiple ingredients to filter
                  </span>
                </label>
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
                <th>SAP Code</th>
                <th>Description</th>
                <th>Division</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Active Ingredients</th>
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
                <th>Incentive %</th>
                <th 
                  className="cursor-pointer hover:bg-base-200 select-none"
                  onClick={handleSortByIncentiveValue}
                  title="Click to sort by Incentive Value"
                >
                  <div className="flex items-center gap-2">
                    <span>Incentive Value</span>
                    <div className="flex flex-col">
                      {sortByIncentiveValue === 'asc' ? (
                        <FaArrowUp className="text-primary text-xs" />
                      ) : sortByIncentiveValue === 'desc' ? (
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
                      <FaBox className="text-primary" />
                      <span className="font-mono">{item.SAP_Code}</span>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{item.Description}</div>
                        {item.Description && (
                          <button
                            onClick={() => openGoogleImageSearch(item.Description)}
                            className="btn btn-ghost btn-xs p-1 h-auto min-h-0"
                            title={`Search images for: ${item.Description}`}
                          >
                            <FaImage className="text-primary text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FaLayerGroup className="text-primary" />
                      <span className="text-sm">{item.Division || '-'}</span>
                    </div>
                  </td>
                  <td>{item.Category || '-'}</td>
                  <td>{item.Sub_category || '-'}</td>
                  <td>
                    {item.activeIngredients && item.activeIngredients.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.activeIngredients.map((ingredient, index) => (
                          <span 
                            key={index}
                            className="badge badge-primary badge-sm"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/50">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-success" />
                      <span className="font-semibold">{formatCurrency(item.Price)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <FaTag className="text-info" />
                      <span>{formatPercentage(item.IncentivePercentage || 0)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-success">
                      {formatCurrency(item.incentive_value || 0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="6" className="text-right">Total:</th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.Price || 0), 0))}
                </th>
                <th></th>
                <th className="text-success">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.incentive_value || 0), 0))}
                </th>
              </tr>
            </tfoot>
          </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl text-base-content/70 mb-4">
              {hasActiveFilters ? 'No items found matching your filters' : 'No incentive items found'}
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

export default IncentiveItems;
