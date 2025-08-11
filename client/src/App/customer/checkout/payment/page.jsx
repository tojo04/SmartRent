import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart item from navigation state
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: user?.name || '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    saveCard: false
  });
  
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get cart item from location state or localStorage
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    
    if (!item || !item.deliveryAddress) {
      // No cart item or missing delivery details, redirect to appropriate page
      navigate('/products');
      return;
    }
    
    setCartItem(item);
  }, [location.state, navigate]);

  const handleCardDetailsChange = (field, value) => {
    let processedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (processedValue.length > 19) processedValue = processedValue.slice(0, 19);
    }
    
    // Format expiry date with slash
    if (field === 'expiryDate') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length >= 2) {
        processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2, 4);
      }
      if (processedValue.length > 5) processedValue = processedValue.slice(0, 5);
    }
    
    // Limit security code to 3-4 digits
    if (field === 'securityCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.nameOnCard.trim()) {
        newErrors.nameOnCard = 'Name on card is required';
      }
      
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (!cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardNumber.length < 13 || cardNumber.length > 19) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!cardDetails.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else {
        const [month, year] = cardDetails.expiryDate.split('/');
        const currentDate = new Date();
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
          newErrors.expiryDate = 'Invalid expiry month';
        } else if (expiryDate < currentDate) {
          newErrors.expiryDate = 'Card has expired';
        }
      }
      
      if (!cardDetails.securityCode) {
        newErrors.securityCode = 'Security code is required';
      } else if (cardDetails.securityCode.length < 3) {
        newErrors.securityCode = 'Invalid security code';
      }
    } else if (paymentMethod === 'upi') {
      // Validate UPI ID
      if (!upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        newErrors.upiId = 'Invalid UPI ID format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validatePaymentForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-300');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare rental data for backend
      const rentalData = {
        productId: cartItem.product.id,
        startDate: cartItem.startDate,
        endDate: cartItem.endDate,
        notes: cartItem.notes || '',
        paymentMethod: paymentMethod,
        deliveryAddress: cartItem.deliveryAddress,
        invoiceAddress: cartItem.invoiceAddress,
        deliveryMethod: cartItem.deliveryMethod,
        appliedCoupon: cartItem.appliedCoupon,
        finalTotal: cartItem.finalTotal || cartItem.pricing.total
      };
      
      // Create the rental order
      const response = await api.post('/rentals', rentalData);
      
      // Clear pending rental from localStorage
      localStorage.removeItem('pendingRental');
      
      // Show success and redirect
      console.log('Rental created successfully:', response.data.rental);
      
      // Simulate payment processing
      setTimeout(() => {
        navigate('/checkout/success', { 
          state: { 
            rental: response.data.rental,
            orderDetails: cartItem
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create rental:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToDelivery = () => {
    navigate('/checkout/delivery', { state: { cartItem } });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'card';
  };

  if (!cartItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <span className="text-gray-900 font-medium">Payment</span>
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
              onClick={() => navigate('/checkout/review', { state: { cartItem } })}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              Review Order
            </button>
            <span className="text-gray-400">›</span>
            <button 
              onClick={handleBackToDelivery}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              Delivery
            </button>
            <span className="text-gray-400">›</span>
            <span className="font-medium text-blue-600">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Confirm Order</h2>
                <p className="text-sm text-gray-600 mt-1">Choose a payment method</p>
              </div>
              
              <div className="p-6">
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <label className={`flex-1 cursor-pointer ${paymentMethod === 'card' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <div className="text-sm font-medium text-gray-900">Credit Card</div>
                      </div>
                    </label>
                    
                    <label className={`flex-1 cursor-pointer ${paymentMethod === 'debit' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input
                        type="radio"
                        value="debit"
                        checked={paymentMethod === 'debit'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <div className="text-sm font-medium text-gray-900">Debit Card</div>
                      </div>
                    </label>
                    
                    <label className={`flex-1 cursor-pointer ${paymentMethod === 'upi' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input
                        type="radio"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <div className="text-sm font-medium text-gray-900">UPI Pay</div>
                      </div>
                    </label>
                    
                    <label className={`flex-1 cursor-pointer ${paymentMethod === 'paypal' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input
                        type="radio"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <div className="text-sm font-medium text-gray-900">PayPal</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Card Payment Form */}
                {(paymentMethod === 'card' || paymentMethod === 'debit') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="Placeholder"
                        value={cardDetails.nameOnCard}
                        onChange={(e) => handleCardDetailsChange('nameOnCard', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.nameOnCard ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.nameOnCard && <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="•••• •••• •••• ••••"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                          className={`w-full px-3 py-2 pr-12 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {cardDetails.cardNumber && (
                          <div className="absolute right-3 top-2.5">
                            <div className={`w-6 h-4 rounded text-xs text-white text-center leading-4 ${
                              getCardType(cardDetails.cardNumber) === 'visa' ? 'bg-blue-600' :
                              getCardType(cardDetails.cardNumber) === 'mastercard' ? 'bg-red-600' :
                              getCardType(cardDetails.cardNumber) === 'amex' ? 'bg-green-600' : 'bg-gray-600'
                            }`}>
                              {getCardType(cardDetails.cardNumber).slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Security Code
                        </label>
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardDetails.securityCode}
                          onChange={(e) => handleCardDetailsChange('securityCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.securityCode ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.securityCode && <p className="text-red-500 text-xs mt-1">{errors.securityCode}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="saveCard"
                        type="checkbox"
                        checked={cardDetails.saveCard}
                        onChange={(e) => handleCardDetailsChange('saveCard', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                        Save my card details
                      </label>
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (errors.upiId) {
                          setErrors(prev => ({ ...prev, upiId: '' }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.upiId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                  </div>
                )}

                {/* PayPal */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <div className="text-gray-600 mb-4">
                      You will be redirected to PayPal to complete your payment
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Secure payment processing via PayPal
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}
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
                      {cartItem.pricing.deliveryCharge === 0 ? '-' : formatCurrency(cartItem.pricing.deliveryCharge)}
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

                {/* Pay Now Button */}
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>Pay Now</span>
                  )}
                </button>
                
                {/* Back to Delivery */}
                <button
                  onClick={handleBackToDelivery}
                  disabled={loading}
                  className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2 disabled:text-gray-400"
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

export default PaymentPage;
