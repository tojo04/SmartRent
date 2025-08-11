import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const DeliveryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart item from navigation state
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [invoiceAddress, setInvoiceAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get cart item from location state or localStorage
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    
    if (!item) {
      // No cart item, redirect to products
      navigate('/products');
      return;
    }
    
    setCartItem(item);
  }, [location.state, navigate]);

  const handleDeliveryAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // If same address is checked, update invoice address too
    if (useSameAddress) {
      setInvoiceAddress(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInvoiceAddressChange = (field, value) => {
    setInvoiceAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[`invoice_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`invoice_${field}`]: ''
      }));
    }
  };

  const handleSameAddressToggle = () => {
    const newValue = !useSameAddress;
    setUseSameAddress(newValue);
    
    if (newValue) {
      // Copy delivery address to invoice address
      setInvoiceAddress({ ...deliveryAddress });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate delivery address
    const requiredDeliveryFields = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode'];
    requiredDeliveryFields.forEach(field => {
      if (!deliveryAddress[field].trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });
    
    // Validate pincode format
    if (deliveryAddress.pincode && !/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    // Validate phone number format
    if (deliveryAddress.phoneNumber && !/^\d{10}$/.test(deliveryAddress.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    // Validate invoice address if different
    if (!useSameAddress) {
      const requiredInvoiceFields = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode'];
      requiredInvoiceFields.forEach(field => {
        if (!invoiceAddress[field].trim()) {
          newErrors[`invoice_${field}`] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        }
      });
      
      if (invoiceAddress.pincode && !/^\d{6}$/.test(invoiceAddress.pincode)) {
        newErrors.invoice_pincode = 'Pincode must be 6 digits';
      }
      
      if (invoiceAddress.phoneNumber && !/^\d{10}$/.test(invoiceAddress.phoneNumber)) {
        newErrors.invoice_phoneNumber = 'Phone number must be 10 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-300');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    
    // Prepare order data
    const orderData = {
      ...cartItem,
      deliveryAddress,
      invoiceAddress: useSameAddress ? deliveryAddress : invoiceAddress,
      deliveryMethod,
      useSameAddress
    };
    
    // Save to localStorage
    localStorage.setItem('pendingRental', JSON.stringify(orderData));
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      navigate('/checkout/payment', { state: { cartItem: orderData } });
    }, 1000);
  };

  const handleBackToCart = () => {
    navigate('/checkout/review', { state: { cartItem } });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (!cartItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const deliveryMethods = [
    { id: 'pickup', name: 'Pickup from Store', price: 0, description: 'Free pickup from our store location' },
    { id: 'delivery', name: 'Home Delivery', price: 50, description: 'Delivered to your doorstep' },
    { id: 'express', name: 'Express Delivery', price: 100, description: 'Same day delivery' }
  ];

  const finalTotal = cartItem.finalTotal || cartItem.pricing.total;

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
              <span className="text-gray-900 font-medium">Delivery</span>
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
            <button 
              onClick={handleBackToCart}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              Review Order
            </button>
            <span className="text-gray-400">›</span>
            <span className="font-medium text-blue-600">Delivery</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Address Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.fullName}
                      onChange={(e) => handleDeliveryAddressChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={deliveryAddress.phoneNumber}
                      onChange={(e) => handleDeliveryAddressChange('phoneNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine1}
                      onChange={(e) => handleDeliveryAddressChange('addressLine1', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine2}
                      onChange={(e) => handleDeliveryAddressChange('addressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleDeliveryAddressChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => handleDeliveryAddressChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => handleDeliveryAddressChange('pincode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={(e) => handleDeliveryAddressChange('landmark', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Address */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Invoice Address</h2>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={handleSameAddressToggle}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Billing address same as delivery address</span>
                  </label>
                </div>
              </div>
              
              {!useSameAddress && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.fullName}
                        onChange={(e) => handleInvoiceAddressChange('fullName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_fullName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_fullName && <p className="text-red-500 text-xs mt-1">{errors.invoice_fullName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={invoiceAddress.phoneNumber}
                        onChange={(e) => handleInvoiceAddressChange('phoneNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_phoneNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.invoice_phoneNumber}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.addressLine1}
                        onChange={(e) => handleInvoiceAddressChange('addressLine1', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_addressLine1 ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.invoice_addressLine1}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.addressLine2}
                        onChange={(e) => handleInvoiceAddressChange('addressLine2', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.city}
                        onChange={(e) => handleInvoiceAddressChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_city && <p className="text-red-500 text-xs mt-1">{errors.invoice_city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.state}
                        onChange={(e) => handleInvoiceAddressChange('state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_state ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_state && <p className="text-red-500 text-xs mt-1">{errors.invoice_state}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.pincode}
                        onChange={(e) => handleInvoiceAddressChange('pincode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoice_pincode ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.invoice_pincode && <p className="text-red-500 text-xs mt-1">{errors.invoice_pincode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={invoiceAddress.landmark}
                        onChange={(e) => handleInvoiceAddressChange('landmark', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Choose Delivery Method</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {deliveryMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        deliveryMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        checked={deliveryMethod === method.id}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <span className="text-sm font-bold text-green-600">
                            {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-600">
                  {cartItem.quantity} Item{cartItem.quantity !== 1 ? 's' : ''} - {formatCurrency(finalTotal)}
                </p>
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
                  
                  {cartItem.appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({cartItem.appliedCoupon.code})</span>
                      <span>-{formatCurrency(cartItem.pricing.total - finalTotal)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
                
                {/* Back to Cart */}
                <button
                  onClick={handleBackToCart}
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

export default DeliveryPage;
