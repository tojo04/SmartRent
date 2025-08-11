import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import LoginPage from './App/auth/login/page';
import SignupPage from './App/auth/signup/page';
import VerifyEmailPage from './App/auth/verify-email/page';
import ForgotPasswordPage from './App/auth/forgot-password/page';

// Public storefront (adjust detail import to your actual folder name)
import CatalogPage from './App/products/page';
// If your folder is literally "[productId]":
// import ProductDetailPage from './App/products/[productId]/page';
// If your folder is "productId":
import ProductDetailPage from './App/products/productId/page';

// Generic pages
import DashboardPage from './pages/DashBoardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin (layout file is at src/App/layout.jsx in your tree)
import AdminLayout from './App/layout.jsx';
import AdminDashboard from './App/admin/dashboard/page';
import AdminUsers from './App/admin/users/page';
import AdminProducts from './App/admin/products/page';
import AdminOrders from './App/admin/orders/page';
// If you already have a "new" page under admin/products, import it; otherwise omit
// import AdminNewProduct from './App/admin/products/new/page';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Public storefront */}
            <Route path="/products" element={<CatalogPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />

            {/* If you DON'T have src/App/orders/page.jsx yet, either remove this route… */}
            {/* <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            /> */}

            {/* …or temporarily reuse the admin orders page so the app compiles */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            {/* Generic protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
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
              {/* Uncomment when you actually add the file:
              <Route path="products/new" element={<AdminNewProduct />} /> */}
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Defaults */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
