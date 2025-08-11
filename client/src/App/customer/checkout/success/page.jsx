import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const CheckoutSuccessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const rental = location.state?.rental;
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    if (!rental) {
      // No rental data, redirect to products
      navigate('/products');
      return;
    }
  }, [rental, navigate]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    // Use a data URI for a default icon instead of external placeholder
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="30" font-weight="bold">${product?.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <span className="text-gray-900 font-medium">Order Confirmation</span>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your rental order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order ID</h3>
                <p className="text-lg font-semibold text-gray-900">{rental.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
                <p className="text-lg font-semibold text-gray-900">{formatDate(rental.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Rental Period</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {rental.status}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rented Item</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={getProductImage(rental.product)}
                  alt={rental.product?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = getProductImage(rental.product);
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{rental.product?.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rental.product?.category}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {formatCurrency(rental.pricePerDay)}/day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(rental.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {rental.notes && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Instructions</h3>
                <p className="text-gray-600">{rental.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        {orderDetails?.deliveryAddress && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
                  <div className="text-gray-900">
                    <p className="font-semibold">{orderDetails.deliveryAddress.fullName}</p>
                    <p>{orderDetails.deliveryAddress.addressLine1}</p>
                    {orderDetails.deliveryAddress.addressLine2 && (
                      <p>{orderDetails.deliveryAddress.addressLine2}</p>
                    )}
                    <p>
                      {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} {orderDetails.deliveryAddress.pincode}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Phone: {orderDetails.deliveryAddress.phoneNumber}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Method</h3>
                  <p className="text-gray-900 capitalize">
                    {orderDetails.deliveryMethod?.replace('_', ' ') || 'Standard Delivery'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>We'll review your order and confirm availability</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>You'll receive email updates about your rental status</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>We'll arrange pickup/delivery as per your selected method</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Remember to return the item by {formatDate(rental.endDate)}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-rentals')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium transition-colors"
          >
            View My Rentals
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-8 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
