import React, { useState } from 'react';
import { format } from 'date-fns';

const RentalOrderForm = ({ user, onCreateOrder }) => {
  const [formData, setFormData] = useState({
    customer: user?.name || '',
    invoiceAddress: '123 Main St, City, State 12345',
    deliveryAddress: '456 Oak Ave, City, State 12345',
    rentalTemplate: 'Standard Rental',
    expiration: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    rentalOrderDate: format(new Date(), 'yyyy-MM-dd'),
    rentalDuration: { months: 0, days: 0, hours: 0 },
    items: [
      {
        product: 'Product 1',
        quantity: 5,
        unitPrice: 200,
        tax: 200 * 5 * 0.18,
        subTotal: 1000
      }
    ],
    termsConditions:
      'Extra charges apply for late return. Equipment must be returned in its original condition.'
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDurationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      rentalDuration: { ...prev.rentalDuration, [field]: Number(value) }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
    };

    if (field === 'quantity' || field === 'unitPrice') {
      const subTotal = updatedItems[index].quantity * updatedItems[index].unitPrice;
      updatedItems[index].subTotal = subTotal;
      updatedItems[index].tax = subTotal * 0.18;
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: `Product ${prev.items.length + 1}`,
          quantity: 1,
          unitPrice: 100,
          subTotal: 100,
          tax: 100 * 0.18
        }
      ]
    }));
  };

  const removeItem = (index) => {
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

  const { untaxedTotal, tax, total } = calculateTotals();

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    const { months, days, hours } = formData.rentalDuration;
    const rentalDurationStr = `${months} months, ${days} days, ${hours} hours`;
    onCreateOrder({
      ...formData,
      rentalDuration: rentalDurationStr,
      untaxedTotal,
      tax,
      total
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600">
              Create
            </button>
            <span className="text-lg font-semibold text-gray-900">Rental Orders</span>
            <div className="flex items-center space-x-2">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">1/40</span>
              <button className="p-1 hover:bg-gray-200 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
              Sort
            </button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
              Print
            </button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
              Quotation
            </button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
              Cancel
            </button>
            <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500">
              Quotation →
            </button>
            <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500">
              Quotation sent →
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500"
            >
              Rental Order →
            </button>
          </div>
        </div>
      </div>

      <form className="p-6">
        {/* Order ID */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">→R0001</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Address:</label>
              <textarea
                value={formData.invoiceAddress}
                onChange={(e) => handleInputChange('invoiceAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address:</label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Template:</label>
              <select
                value={formData.rentalTemplate}
                onChange={(e) => handleInputChange('rentalTemplate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Order Date:</label>
              <input
                type="date"
                value={formData.rentalOrderDate}
                onChange={(e) => handleInputChange('rentalOrderDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Duration:</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  value={formData.rentalDuration.months}
                  onChange={(e) => handleDurationChange('months', e.target.value)}
                  placeholder="Months"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rentalDuration.days}
                  onChange={(e) => handleDurationChange('days', e.target.value)}
                  placeholder="Days"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rentalDuration.hours}
                  onChange={(e) => handleDurationChange('hours', e.target.value)}
                  placeholder="Hours"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Lines Tabs */}
        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                className="border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium"
              >
                Order lines
              </button>
              <button
                type="button"
                className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium"
              >
                Other details
              </button>
              <button
                type="button"
                className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium"
              >
                Rental Notes
              </button>
            </nav>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Quantity</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Unit Price</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tax (18%)</th>
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
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-2">{item.tax.toFixed(2)}</td>
                    <td className="px-4 py-2 font-medium">{item.subTotal}</td>
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

        {/* Terms and Conditions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</label>
          <p className="text-sm text-gray-600 mb-2">{formData.termsConditions}</p>
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            I agree to the terms and conditions
          </label>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Untaxed Total:</span>
              <span className="text-sm font-medium">{untaxedTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax:</span>
              <span className="text-sm font-medium">{tax}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-bold">Total:</span>
              <span className="text-sm font-bold">{total}</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default RentalOrderForm;