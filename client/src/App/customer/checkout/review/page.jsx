import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const ReviewOrderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart item from navigation state
  const [cartItem, setCartItem] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  useEffect(() => {
    // Get cart item from location state or localStorage
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    
    if (!item) {
      // No cart item, redirect to products
      navigate('/products');
      return;
    }
    
    setCartItem(item);
    
    // Save to localStorage in case user refreshes
    localStorage.setItem('pendingRental', JSON.stringify(item));
  }, [location.state, navigate]);

  const handleQuantityChange = (newQuantity) => {
    if (!cartItem || newQuantity < 1 || newQuantity > cartItem.product.availableStock) {
      return;
    }
    
    // Recalculate pricing with new quantity
    const updatedItem = {
      ...cartItem,
      quantity: newQuantity,
      pricing: {
        ...cartItem.pricing,
        subtotal: cartItem.pricing.totalDays * cartItem.pricing.pricePerDay * newQuantity,
        total: cartItem.pricing.totalDays * cartItem.pricing.pricePerDay * newQuantity + cartItem.pricing.deliveryCharge + Math.round((cartItem.pricing.totalDays * cartItem.pricing.pricePerDay * newQuantity) * 0.0075)
      }
    };
    
    setCartItem(updatedItem);
    localStorage.setItem('pendingRental', JSON.stringify(updatedItem));
  };

  const handleApplyCoupon = () => {
    // Mock coupon validation
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Mock coupon codes
    const mockCoupons = {
      'SAVE10': { discount: 10, type: 'percentage', description: '10% off' },
      'FIRST50': { discount: 50, type: 'fixed', description: '₹50 off' },
      'WELCOME': { discount: 5, type: 'percentage', description: '5% off' }
    };
    
    const coupon = mockCoupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        ...coupon
      });
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleRemoveItem = () => {
    // Remove item from cart
    setCartItem(null);
    localStorage.removeItem('pendingRental');
    navigate('/products');
  };

  const calculateFinalTotal = () => {
    if (!cartItem) return 0;
    
    let total = cartItem.pricing.total;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        total = total * (1 - appliedCoupon.discount / 100);
      } else {
        total = Math.max(0, total - appliedCoupon.discount);
      }
    }
    
    return Math.round(total);
  };

  const handleProceedToCheckout = () => {
    const finalCartItem = {
      ...cartItem,
      appliedCoupon,
      finalTotal: calculateFinalTotal()
    };
    
    localStorage.setItem('pendingRental', JSON.stringify(finalCartItem));
    navigate('/checkout/delivery', { state: { cartItem: finalCartItem } });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    // Use a data URI for a default icon instead of external placeholder
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="40" font-weight="bold">${product?.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  if (!cartItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const finalTotal = calculateFinalTotal();
  const savings = appliedCoupon ? cartItem.pricing.total - finalTotal : 0;

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
                Rental Shop
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Review Order</span>
            </nav>

            {/* User info */}
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

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium text-blue-600">Review Order</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Delivery</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Overview</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <img
                    src={getProductImage(cartItem.product)}
                    alt={cartItem.product.name}
                    className="w-24 h-24 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = getProductImage(cartItem.product);
                    }}
                  />
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{cartItem.product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{cartItem.product.category}</p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      {formatCurrency(cartItem.pricing.pricePerDay)}/day
                    </p>
                    
                    {/* Rental Dates */}
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>From:</strong> {new Date(cartItem.startDate).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(cartItem.endDate).toLocaleDateString()}</p>
                      <p><strong>Duration:</strong> {cartItem.pricing.totalDays} day{cartItem.pricing.totalDays !== 1 ? 's' : ''}</p>
                    </div>
                    
                    {/* Notes */}
                    {cartItem.notes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Notes:</strong> {cartItem.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Qty:</span>
                      <button
                        onClick={() => handleQuantityChange(cartItem.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium w-8 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(cartItem.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleRemoveItem}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-600">1 Item - {cartItem.pricing.totalDays} day{cartItem.pricing.totalDays !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium">{formatCurrency(cartItem.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium text-green-600">
                      {cartItem.pricing.deliveryCharge === 0 ? 'Free' : formatCurrency(cartItem.pricing.deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">{formatCurrency(cartItem.pricing.taxes)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{formatCurrency(savings)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Apply Coupon</h4>
                  
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-green-800">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Proceed to checkout
                </button>
                
                {/* Back to Cart */}
                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  ← back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderPage;
