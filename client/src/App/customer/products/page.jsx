import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

const RentalShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Products and filtering state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // View mode (grid or list)
  const [viewMode, setViewMode] = useState('grid');
  const [activeRental, setActiveRental] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories, brands, and active rental in parallel
      const [categoriesRes, brandsRes, activeRentalRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/brands'),
        api.get('/rentals/active').catch(() => ({ data: { rental: null } }))
      ]);

      setCategories(categoriesRes.data.categories || []);
      setBrands(brandsRes.data.brands || []);
      setActiveRental(activeRentalRes.data.rental);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Failed to load shop data');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        rentable: 'true'
      });

      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/products?${params}`);
      const data = response.data;

      setProducts(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        hasNext: data.hasNext || false,
        hasPrev: data.hasPrev || false
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Use a data URI for a default icon instead of external placeholder
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${product.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  const getAvailabilityStatus = (product) => {
    if (product.availableStock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600' };
    } else if (product.availableStock <= 2) {
      return { text: 'Low Stock', color: 'text-orange-600' };
    }
    return { text: 'Available', color: 'text-green-600' };
  };

  const handleRentProduct = (product) => {
    if (activeRental) {
      setError('You already have an active rental. Only one item can be rented at a time.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (product.availableStock < 1) {
      setError('This product is currently out of stock.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    // Navigate to product details page
    navigate(`/products/${product.id}`);
  };

  const conditionOptions = ['New', 'Good', 'Fair', 'Poor'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-900 hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <span className="font-semibold text-blue-600">Rental Shop</span>
              <button 
                onClick={() => navigate('/wishlist')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Wishlist
              </button>
            </nav>

            {/* User info and cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </div>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !filters.category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Attributes</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Brand</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Condition</h4>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Conditions</option>
                  {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="createdAt-desc">Latest</option>
                    <option value="createdAt-asc">Oldest</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="pricePerDay-asc">Price Low-High</option>
                    <option value="pricePerDay-desc">Price High-Low</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Rental Alert */}
            {activeRental && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 font-medium">You have an active rental</p>
                    <p className="text-blue-600 text-sm">
                      {activeRental.product?.name} - Return by {new Date(activeRental.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                }`}>
                  {products.map((product) => {
                    const availability = getAvailabilityStatus(product);
                    
                    return (
                      <div 
                        key={product.id} 
                        className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'}`}>
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className={`object-cover ${viewMode === 'list' ? 'h-32' : 'h-48 w-full'}`}
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${product.name?.charAt(0) || 'P'}</text></svg>`)}`;
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">{product.category}</span>
                            {product.brand && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-600">{product.brand}</span>
                              </>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-green-600">
                              ₹{product.pricePerDay}/day
                            </span>
                            <span className={`text-sm font-medium ${availability.color}`}>
                              {availability.text}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRentProduct(product)}
                            disabled={product.availableStock < 1 || !!activeRental}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors"
                          >
                            {product.availableStock < 1 ? 'Out of Stock' : 'Rent Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.total > pagination.limit && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(Math.ceil(pagination.total / pagination.limit)).keys()].map((num) => {
                      const pageNum = num + 1;
                      if (pageNum === pagination.page || 
                          Math.abs(pageNum - pagination.page) <= 2 || 
                          pageNum === 1 || 
                          pageNum === Math.ceil(pagination.total / pagination.limit)) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (Math.abs(pageNum - pagination.page) === 3) {
                        return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* No Results */}
                {products.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalShopPage;
