import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../../lib/api';

const Reports = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [statsRes, categoriesRes, productsRes, customersRes, revenueRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/reports/top-categories'),
        api.get('/reports/top-products'),
        api.get('/reports/top-customers'),
        api.get('/reports/revenue-trends')
      ]);

      setDashboardStats(statsRes.data);
      setTopCategories(categoriesRes.data);
      setTopProducts(productsRes.data);
      setTopCustomers(customersRes.data);
      setRevenueData(revenueRes.data);
    } catch (err) {
      setError('Failed to fetch reports data');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-10 bg-gray-200 rounded-lg w-80 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-36 animate-pulse"></div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-lg mb-4 w-24"></div>
                    <div className="h-8 bg-gray-200 rounded-lg mb-2 w-20"></div>
                  </div>
                  <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded-lg w-32"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-pulse">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-8 bg-gray-200 rounded-lg w-40"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                </div>
                <div className="h-80 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Tables Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-100 px-8 py-6">
                  <div className="h-8 bg-gray-200 rounded-lg w-48 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
                </div>
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Reports</h2>
            <p className="text-gray-600 mb-6">We encountered an error while fetching your analytics data. Please try again.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
            <button 
              onClick={() => {
                setError(null);
                fetchReportsData();
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600 text-lg">Comprehensive insights into your rental business performance</p>
          </div>
          <button 
            onClick={fetchReportsData}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl border border-blue-200 p-8 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Products</p>
                <p className="text-3xl font-bold">{dashboardStats.totalProducts}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-xl p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Available for rent</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl border border-green-200 p-8 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">Total Rentals</p>
                <p className="text-3xl font-bold">{dashboardStats.totalRentals}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-xl p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm">All time orders</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl border border-yellow-200 p-8 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-2">Active Rentals</p>
                <p className="text-3xl font-bold">{dashboardStats.activeRentals}</p>
              </div>
              <div className="bg-yellow-400 bg-opacity-30 rounded-xl p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-yellow-100 text-sm">Currently ongoing</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl border border-purple-200 p-8 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-2">Total Revenue</p>
                <p className="text-3xl font-bold">₹{dashboardStats.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-xl p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm">Lifetime earnings</p>
          </div>
        </div>
      )}

      {/* Revenue Trends Chart */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Revenue Trends</h2>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
            Monthly View
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <Tooltip 
              formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']} 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Top Categories</h2>
            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium">
              By Count
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={topCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                stroke="#fff"
                strokeWidth={2}
              >
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Top Rented Products</h2>
            <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium">
              Top 5
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topProducts.slice(0, 5)} layout="horizontal">
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="rentalCount" 
                fill="#8B5CF6" 
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Top Products</h2>
            <p className="text-gray-600 mt-1">Most rented items by revenue</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rentals
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topProducts.slice(0, 5).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {product.rentalCount}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Top Customers</h2>
            <p className="text-gray-600 mt-1">Most valuable customers by spending</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rentals
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topCustomers.slice(0, 5).map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {customer.rentalCount}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{customer.totalSpent?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
