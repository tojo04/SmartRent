import React from 'react';

const ConfirmedRentalForm = ({ order }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleInvoice = () => {
    // Simulate invoice generation
    alert('Invoice generated successfully!');
  };

  const handleQuotation = () => {
    // Simulate quotation generation
    alert('Quotation generated successfully!');
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
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {order.deliveryStatus}
            </div>
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
            <button 
              onClick={handleInvoice}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Invoice
            </button>
            <button 
              onClick={handleQuotation}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Quotation
            </button>
            <button 
              onClick={handlePrint}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Print
            </button>
            <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500">
              Quotation →
            </button>
            <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500">
              Quotation sent →
            </button>
            <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded text-sm font-medium hover:bg-yellow-500">
              Rental Order →
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Order ID and Status */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">→{order.id}</h2>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Confirmed
          </div>
        </div>

        {/* Form Fields - Read Only */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.customer}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Address:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.invoiceAddress}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.deliveryAddress}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Template:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.rentalTemplate}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.expiration}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Order Date:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.rentalOrderDate}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price List:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.priceList}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.rentalPeriod}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Duration:</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {order.rentalDuration}
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

        {/* Items Table - Read Only */}
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
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 bg-gray-50">{item.product}</td>
                    <td className="px-4 py-2 bg-gray-50">{item.quantity}</td>
                    <td className="px-4 py-2 bg-gray-50">{item.unitPrice}</td>
                    <td className="px-4 py-2 bg-gray-50">{item.tax}</td>
                    <td className="px-4 py-2 bg-gray-50 font-medium">{item.subTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions - Read Only */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</label>
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 min-h-[80px]">
            {order.termsConditions}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Untaxed Total:</span>
              <span className="text-sm font-medium">{order.untaxedTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax:</span>
              <span className="text-sm font-medium">{order.tax}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-bold">Total:</span>
              <span className="text-sm font-bold">{order.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleInvoice}
            className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Generate Invoice
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedRentalForm;