import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

const AdminRentalsPage = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/rentals');
      setRentals(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      setError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRentalOrder = (rental) => {
    setSelectedRental(rental);
    setShowCreateForm(true);
  };

  const handleGeneratePDF = async (rental) => {
    try {
      const response = await api.post(`/rentals/${rental.id}/generate-pdf`);
      if (response.data.success) {
        alert('PDF generated and sent to customer successfully!');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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

  const getFilteredRentals = () => {
    let filtered = rentals;
    
    if (filter !== 'all') {
      filtered = filtered.filter(rental => rental.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(rental => 
        rental.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Rental Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage rental orders and generate formal documentation.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Order
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by status:</span>
            {['all', 'PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {status !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({rentals.filter(r => r.status === status).length})
                  </span>
                )}
                {status === 'all' && (
                  <span className="ml-1 text-xs">({rentals.length})</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredRentals().map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">R{rental.id.slice(0, 6)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {rental.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{rental.userName}</div>
                        <div className="text-sm text-gray-500">{rental.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rental.product?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{rental.product?.category || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rental.totalDays} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(rental.totalPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(rental.status)}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleCreateRentalOrder(rental)}
                        className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Create Order
                      </button>
                      <button 
                        data-rental-id={rental.id}
                        onClick={() => handleGeneratePDF(rental)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Generate PDF
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(rental)}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getFilteredRentals().length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filter !== 'all' ? 'No matching rentals' : 'No rentals'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No rental orders have been placed yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Rental Order Form Modal */}
      {showCreateForm && selectedRental && (
        <RentalOrderFormModal
          rental={selectedRental}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedRental(null);
          }}
          onSuccess={() => {
            fetchRentals();
            setShowCreateForm(false);
            setSelectedRental(null);
          }}
        />
      )}
    </div>
  );
};

const RentalOrderFormModal = ({ rental, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer: rental.userName,
    invoiceAddress: '',
    deliveryAddress: '',
    rentalTemplate: 'Standard Rental',
    expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentalOrderDate: new Date().toISOString().split('T')[0],
    priceList: 'Standard',
    rentalPeriod: `${rental.totalDays} days`,
    rentalDuration: `${rental.totalDays} days`,
    termsConditions: 'Standard terms and conditions apply for this rental agreement. Product must be returned in the same condition as received. Late returns incur additional charges.',
    items: [{
      product: rental.product?.name || 'Product',
      quantity: 1,
      unitPrice: Number(rental.pricePerDay),
      tax: Math.round(Number(rental.totalPrice) * 0.18), // 18% GST
      subTotal: Number(rental.totalPrice)
    }]
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orderlines');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'tax' ? Number(value) : value
    };
    
    // Recalculate subtotal
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].subTotal = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product: 'New Product',
        quantity: 1,
        unitPrice: 100,
        tax: 18,
        subTotal: 100
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return; // Keep at least one item
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const untaxedTotal = formData.items.reduce((sum, item) => sum + item.subTotal, 0);
    const totalTax = formData.items.reduce((sum, item) => sum + item.tax, 0);
    const total = untaxedTotal + totalTax;
    
    return { untaxedTotal, tax: totalTax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { untaxedTotal, tax, total } = calculateTotals();
      
      const orderData = {
        ...formData,
        rentalId: rental.id,
        untaxedTotal,
        tax,
        total
      };

      const response = await api.post('/rentals/create-order', orderData);
      
      if (response.data.success) {
        alert('Rental order created successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create rental order:', error);
      alert('Failed to create rental order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const { untaxedTotal, tax, total } = calculateTotals();
      
      const orderData = {
        ...formData,
        rentalId: rental.id,
        untaxedTotal,
        tax,
        total
      };

      const response = await api.post(`/rentals/${rental.id}/generate-pdf`, orderData);
      
      if (response.data.success) {
        alert('PDF generated and sent to customer successfully!');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { untaxedTotal, tax, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-8">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600">
                Create
              </button>
              <span className="text-lg font-semibold text-gray-900">Rental Orders</span>
              <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                Draft
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleGeneratePDF}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                Invoice
              </button>
              <button 
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order ID */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">→R{rental.id.slice(0, 6)}</h2>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer:</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Address:</label>
                <textarea
                  value={formData.invoiceAddress}
                  onChange={(e) => handleInputChange('invoiceAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Enter invoice address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address:</label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Enter delivery address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Template:</label>
                <select
                  value={formData.rentalTemplate}
                  onChange={(e) => handleInputChange('rentalTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Standard Rental">Standard Rental</option>
                  <option value="Premium Rental">Premium Rental</option>
                  <option value="Basic Rental">Basic Rental</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration:</label>
                <input
                  type="date"
                  value={formData.expiration}
                  onChange={(e) => handleInputChange('expiration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Order Date:</label>
                <input
                  type="date"
                  value={formData.rentalOrderDate}
                  onChange={(e) => handleInputChange('rentalOrderDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price List:</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.priceList}
                    onChange={(e) => handleInputChange('priceList', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Discount">Discount</option>
                  </select>
                  <button
                    type="button"
                    className="bg-purple-500 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-600"
                  >
                    Update Prices
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period:</label>
                <input
                  type="text"
                  value={formData.rentalPeriod}
                  onChange={(e) => handleInputChange('rentalPeriod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Duration:</label>
                <input
                  type="text"
                  value={formData.rentalDuration}
                  onChange={(e) => handleInputChange('rentalDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('orderlines')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'orderlines'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Order lines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'details'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Other details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'notes'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rental Notes
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'orderlines' && (
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Unit Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tax</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Sub Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">₹{item.subTotal.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={formData.items.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
              >
                Add Item
              </button>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms:</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Immediate Payment</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method:</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Pickup</option>
                    <option>Home Delivery</option>
                    <option>Express Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</label>
              <textarea
                value={formData.termsConditions}
                onChange={(e) => handleInputChange('termsConditions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="6"
              />
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Untaxed Total:</span>
                <span className="text-sm font-medium">₹{untaxedTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax:</span>
                <span className="text-sm font-medium">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-bold">Total:</span>
                <span className="text-sm font-bold">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Rental Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRentalsPage;