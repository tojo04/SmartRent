import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useWishlist } from '../../../../contexts/WishlistContext';
import api from '../../../../lib/api';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  // Product and rental state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRental, setActiveRental] = useState(null);
  
  // Cart state (for this single-item system, cart is just the current rental form)
  const [cartItem, setCartItem] = useState(null);
  
  // Rental form state
  const [rentalForm, setRentalForm] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    notes: ''
  });
  
  // Calculated pricing
  const [pricing, setPricing] = useState({
    totalDays: 0,
    pricePerDay: 0,
    subtotal: 0,
    deliveryCharge: 0,
    taxes: 0,
    total: 0
  });
  
  // UI state
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showDateValidation, setShowDateValidation] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      checkActiveRental();
    }
  }, [productId]);

  useEffect(() => {
    calculatePricing();
  }, [rentalForm.startDate, rentalForm.endDate, rentalForm.quantity, product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveRental = async () => {
    try {
      const response = await api.get('/rentals/active');
      setActiveRental(response.data.rental);
    } catch (error) {
      // No active rental is fine
      setActiveRental(null);
    }
  };

  const calculatePricing = () => {
    if (!product || !rentalForm.startDate || !rentalForm.endDate) {
      setPricing({
        totalDays: 0,
        pricePerDay: 0,
        subtotal: 0,
        deliveryCharge: 0,
        taxes: 0,
        total: 0
      });
      return;
    }

    const startDate = new Date(rentalForm.startDate);
    const endDate = new Date(rentalForm.endDate);
    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    const pricePerDay = product.pricePerDay;
    const subtotal = totalDays * pricePerDay * rentalForm.quantity;
    const deliveryCharge = 0; // Free delivery for now
    const taxRate = 0.0075; // 0.75% tax
    const taxes = Math.round(subtotal * taxRate);
    const total = subtotal + deliveryCharge + taxes;

    setPricing({
      totalDays,
      pricePerDay,
      subtotal,
      deliveryCharge,
      taxes,
      total
    });
  };

  const handleFormChange = (field, value) => {
    setRentalForm(prev => ({
      ...prev,
      [field]: value
    }));
    setShowDateValidation(false);
  };

  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(rentalForm.startDate);
    const endDate = new Date(rentalForm.endDate);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }

    if (pricing.totalDays > 30) {
      setError('Maximum rental period is 30 days');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddToCart = async () => {
    if (activeRental) {
      setError('You already have an active rental. Only one item can be rented at a time.');
      return;
    }

    if (!rentalForm.startDate || !rentalForm.endDate) {
      setShowDateValidation(true);
      setError('Please select rental dates');
      return;
    }

    if (!validateDates()) {
      return;
    }

    if (product.availableStock < rentalForm.quantity) {
      setError('Not enough stock available');
      return;
    }

    // In this single-item system, "adding to cart" means setting up the rental data
    const cartData = {
      product: product,
      startDate: rentalForm.startDate,
      endDate: rentalForm.endDate,
      quantity: rentalForm.quantity,
      notes: rentalForm.notes,
      pricing: pricing
    };

    setCartItem(cartData);
    setIsAddingToCart(true);

    // Show success feedback
    setTimeout(() => {
      setIsAddingToCart(false);
      // Navigate to review order page
      navigate('/checkout/review', { 
        state: { cartItem: cartData } 
      });
    }, 1000);
  };

  const handleWishlist = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const getProductImage = (product, index = 0) => {
    if (product?.images && product.images.length > index) {
      return product.images[index];
    }
    // Use a data URI for a default icon instead of external placeholder
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="120" font-weight="bold">${product?.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // 6 months from now
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-900 hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <span className="text-gray-400">/</span>
              <button 
                onClick={() => navigate('/products')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                All Products
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product?.name}</span>
            </nav>

            {/* User info and actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Image */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={getProductImage(product)}
                alt={product?.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = getProductImage(product);
                }}
              />
              
              {/* Wishlist Button */}
              <div className="p-4">
                <button
                  onClick={handleWishlist}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-full font-medium hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg
                    className={`w-5 h-5 ${isWishlisted(product?.id) ? 'text-red-500 fill-current' : ''}`}
                    fill={isWishlisted(product?.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{isWishlisted(product?.id) ? 'Remove from wish list' : 'Add to wish list'}</span>
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product?.description || 'No description available for this product.'}
              </p>
              {product?.brand && (
                <div className="mt-4 text-sm text-gray-500">
                  <strong>Brand:</strong> {product.brand}
                </div>
              )}
              {product?.model && (
                <div className="mt-1 text-sm text-gray-500">
                  <strong>Model:</strong> {product.model}
                </div>
              )}
              {product?.condition && (
                <div className="mt-1 text-sm text-gray-500">
                  <strong>Condition:</strong> {product.condition}
                </div>
              )}
            </div>
          </div>

          {/* Product Details and Rental Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Product Info */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product?.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(product?.pricePerDay || 0)}
                  <span className="text-lg text-gray-600 font-normal">/day</span>
                </span>
                <span className="text-sm text-gray-500">
                  ({product?.availableStock || 0} available)
                </span>
              </div>

              {/* Active Rental Warning */}
              {activeRental && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-yellow-800 font-medium">Active Rental</p>
                      <p className="text-yellow-700 text-sm">
                        You currently have "{activeRental.product?.name}" rented until {new Date(activeRental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rental Form */}
              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Rental Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From
                      </label>
                      <input
                        type="date"
                        value={rentalForm.startDate}
                        onChange={(e) => handleFormChange('startDate', e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          showDateValidation && !rentalForm.startDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <input
                        type="date"
                        value={rentalForm.endDate}
                        onChange={(e) => handleFormChange('endDate', e.target.value)}
                        min={rentalForm.startDate || getMinDate()}
                        max={getMaxDate()}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          showDateValidation && !rentalForm.endDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {pricing.totalDays > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Rental period: {pricing.totalDays} day{pricing.totalDays !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleFormChange('quantity', Math.max(1, rentalForm.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{rentalForm.quantity}</span>
                    <button
                      onClick={() => handleFormChange('quantity', Math.min(product?.availableStock || 1, rentalForm.quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={rentalForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions for your rental..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !!activeRental || (product?.availableStock || 0) < 1}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding to Cart...</span>
                    </>
                  ) : activeRental ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <span>Cannot Rent (Active Rental)</span>
                    </>
                  ) : (product?.availableStock || 0) < 1 ? (
                    <span>Out of Stock</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5-5M14 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing Summary */}
            {pricing.totalDays > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(pricing.pricePerDay)} × {pricing.totalDays} day{pricing.totalDays !== 1 ? 's' : ''} × {rentalForm.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium text-green-600">
                      {pricing.deliveryCharge === 0 ? 'Free' : formatCurrency(pricing.deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">{formatCurrency(pricing.taxes)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(pricing.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Product must be returned in the same condition as received</li>
                <li>• Late returns incur additional charges</li>
                <li>• Security deposit may be required for high-value items</li>
                <li>• Cancellation is free up to 24 hours before rental start</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
