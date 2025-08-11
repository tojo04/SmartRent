import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import RentalOrderForm from '../../../components/RentalOrderForm';
import ConfirmedRentalForm from '../../../components/ConfirmedRentalForm';

const RentalsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [confirmedOrders, setConfirmedOrders] = useState([
    {
      id: 'R0001',
      customer: user?.name || 'John Doe',
      invoiceAddress: '123 Main St, City, State 12345',
      deliveryAddress: '456 Oak Ave, City, State 12345',
      rentalTemplate: 'Standard Rental',
      expiration: '2024-02-15',
      rentalOrderDate: '2024-01-15',
      priceList: 'Standard',
      rentalPeriod: '30 days',
      rentalDuration: '1 month',
      items: [
        {
          product: 'Product 1',
          quantity: 5,
          unitPrice: 200,
          tax: 0,
          subTotal: 1000
        }
      ],
      termsConditions: 'Standard terms and conditions apply for this rental agreement.',
      untaxedTotal: 1000,
      tax: 0,
      total: 1000,
      status: 'confirmed',
      deliveryStatus: '2. Delivery'
    }
  ]);

  const handleCreateOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `R${String(confirmedOrders.length + 1).padStart(4, '0')}`,
      status: 'confirmed',
      deliveryStatus: '2. Delivery'
    };
    setConfirmedOrders([...confirmedOrders, newOrder]);
    setActiveTab('confirmed');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
          <p className="mt-2 text-gray-600">Create and manage your rental orders</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Rental Order
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Confirmed Rentals ({confirmedOrders.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <RentalOrderForm 
            user={user} 
            onCreateOrder={handleCreateOrder}
          />
        )}

        {activeTab === 'confirmed' && (
          <div className="space-y-6">
            {confirmedOrders.map((order) => (
              <ConfirmedRentalForm 
                key={order.id} 
                order={order}
              />
            ))}
            {confirmedOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No confirmed rentals yet</div>
                <p className="text-gray-500 mt-2">Create your first rental order to see it here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalsPage;