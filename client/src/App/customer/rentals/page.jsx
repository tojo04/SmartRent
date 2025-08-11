import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

const RentalsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [activeRental, setActiveRental] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalFormData, setRentalFormData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch available products
      const productsResponse = await api.get('/products?rentable=true');
      setProducts(productsResponse.data.items || []);
      
      // Fetch user's active rental
      const activeRentalResponse = await api.get('/rentals/active');
      setActiveRental(activeRentalResponse.data.rental);
      
      // Fetch rental history
      const historyResponse = await api.get('/rentals/my-rentals');
      setRentalHistory(historyResponse.data.items || []);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load rental data');
    } finally {
      setLoading(false);
    }
  };

  const handleRentProduct = (product) => {
    if (activeRental) {
      setError('You already have an active rental. Only one item can be rented at a time.');
      return;
    }
    
    if (product.availableStock < 1) {
      setError('This product is currently out of stock.');
      return;
    }
    
    setSelectedProduct(product);
    setShowRentalForm(true);
    setError('');
  };

  const calculateTotalDays = () => {
    if (!rentalFormData.startDate || !rentalFormData.endDate) return 0;
    const start = new Date(rentalFormData.startDate);
    const end = new Date(rentalFormData.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    return days * (selectedProduct?.pricePerDay || 0);
  };

  const submitRental = async () => {
    try {
      if (!rentalFormData.startDate || !rentalFormData.endDate) {
        setError('Please select both start and end dates');
        return;
      }

      const startDate = new Date(rentalFormData.startDate);
      const endDate = new Date(rentalFormData.endDate);
      
      if (endDate <= startDate) {
        setError('End date must be after start date');
        return;
      }

      const rentalData = {
        productId: selectedProduct.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: rentalFormData.notes
      };

      await api.post('/rentals', rentalData);
      
      // Refresh data
      await fetchData();
      
      // Close form and reset
      setShowRentalForm(false);
      setSelectedProduct(null);
      setRentalFormData({ startDate: '', endDate: '', notes: '' });
      setError('');
      
    } catch (error) {
      console.error('Failed to create rental:', error);
      setError(error.response?.data?.message || 'Failed to create rental');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP':
        return 'bg-green-100 text-green-800';
      case 'RETURNED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return `https://via.placeholder.com/200x150?text=${product.name.charAt(0)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rental Products</h1>
        <p className="mt-2 text-gray-600">
          Browse available products and manage your rentals
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Active Rental Alert */}
      {activeRental && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Active Rental</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You currently have "{activeRental.product?.name}" rented.</p>
                <p>Return date: {new Date(activeRental.endDate).toLocaleDateString()}</p>
                <p>Status: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(activeRental.status)}`}>
                  {activeRental.status}
                </span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Products */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/200x150?text=${product.name.charAt(0)}`;
                }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600">${product.pricePerDay}/day</span>
                  <span className="text-sm text-gray-500">{product.availableStock} available</span>
                </div>
                <button
                  onClick={() => handleRentProduct(product)}
                  disabled={product.availableStock < 1 || !!activeRental}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    product.availableStock < 1 || !!activeRental
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {product.availableStock < 1 ? 'Out of Stock' : !!activeRental ? 'Already Renting' : 'Rent Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rental History */}
      {rentalHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Rental History</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentalHistory.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={getProductImage(rental.product)}
                            alt={rental.product?.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {rental.product?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">{rental.totalDays} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${rental.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rental Form Modal */}
      {showRentalForm && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Rent {selectedProduct.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={rentalFormData.startDate}
                    onChange={(e) => setRentalFormData({...rentalFormData, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={rentalFormData.endDate}
                    onChange={(e) => setRentalFormData({...rentalFormData, endDate: e.target.value})}
                    min={rentalFormData.startDate || new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea
                    value={rentalFormData.notes}
                    onChange={(e) => setRentalFormData({...rentalFormData, notes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
                
                {/* Rental Summary */}
                {rentalFormData.startDate && rentalFormData.endDate && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Rental Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{calculateTotalDays()} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per day:</span>
                        <span>${selectedProduct.pricePerDay}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="items-center px-4 py-3 mt-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRentalForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRental}
                    disabled={!rentalFormData.startDate || !rentalFormData.endDate}
                    className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Rental
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsPage;