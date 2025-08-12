import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './App/auth/login/page';
import SignupPage from './App/auth/signup/page';
import VerifyEmailPage from './App/auth/verify-email/page';
import ForgotPasswordPage from './App/auth/forgot-password/page';
import DashboardPage from './pages/DashBoardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Customer Components
import RentalsPage from './App/customer/rentals/page';
import RentalShopPage from './App/customer/products/page';
import ProductDetailsPage from './App/customer/products/[productId]/page';
import WishlistPage from './App/customer/wishlist/page';
import ReviewOrderPage from './App/customer/checkout/review/page';
import DeliveryPage from './App/customer/checkout/delivery/page';
import PaymentPage from './App/customer/checkout/payment/page';
import CheckoutSuccessPage from './App/customer/checkout/success/page';
import LogoutPage from './pages/LogoutPage';

// Admin Components
import AdminLayout from './App/admin/layout';
import AdminDashboard from './App/admin/dashboard/page';
import AdminUsers from './App/admin/users/page';
import AdminProducts from './App/admin/products/page';
import AdminProductNew from './App/admin/products/new/page';
import AdminOrders from './App/admin/orders/page';
import AdminRentals from './App/admin/rentals/page';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Router>
          <div className="App">
            <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Customer routes */}
            <Route
              path="/products"
              element={
                <ProtectedRoute requiredRole="customer">
                  <RentalShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:productId"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ProductDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute requiredRole="customer">
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/review"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ReviewOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/delivery"
              element={
                <ProtectedRoute requiredRole="customer">
                  <DeliveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/payment"
              element={
                <ProtectedRoute requiredRole="customer">
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  <LogoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/success"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CheckoutSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-rentals"
              element={
                <ProtectedRoute requiredRole="customer">
                  <RentalsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductNew />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="rentals" element={<AdminRentals />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
