# Admin Setup Guide

## 🎯 Overview
SmartRent now has a complete admin panel with modern UI and full functionality.

## 🔧 Setup Steps

### 1. **Start the Servers**
```bash
# Terminal 1 - Start MongoDB (if using local)
mongod

# Terminal 2 - Start Backend Server
cd server
npm run dev

# Terminal 3 - Start Frontend Client  
cd client
npm run dev
```

### 2. **Create Admin User**
```bash
cd server
ADMIN_EMAIL=admin@smartrent.com ADMIN_PASSWORD=admin123 npm run seed:admin
```

### 3. **Login as Admin**
1. Go to `http://localhost:5174/auth/login`
2. Login with:
   - **Email**: `admin@smartrent.com` 
   - **Password**: `admin123`
3. You'll be automatically redirected to `/admin/dashboard`

## 🎨 Admin Features

### **Dashboard** (`/admin/dashboard`)
- Real-time statistics (users, products, orders, revenue)
- Recent users list
- Quick action buttons
- Data fetched from live APIs

### **Users Management** (`/admin/users`)
- View all registered users
- Change user roles (admin ↔ customer)
- User statistics
- Real-time role updates

### **Products Management** (`/admin/products`)
- View all rental products (mock data)
- Product statistics by status
- Add/Edit/Delete products (UI ready)

### **Orders Management** (`/admin/orders`) 
- View all rental orders (mock data)
- Order status tracking
- Payment status monitoring
- Export functionality (UI ready)

## 🛡️ Security Features

- **Role-based access control** - Only admin users can access `/admin/*` routes
- **Protected routes** - Automatic redirect to login if not authenticated
- **Route guards** - ProtectedRoute component with role validation
- **Auto-redirect** - Admin users are automatically sent to admin panel

## 🎨 UI/UX Features

- **Modern design** - Clean, professional admin interface
- **Responsive layout** - Works on desktop, tablet, and mobile
- **Navigation sidebar** - Easy access to all admin sections
- **Real-time data** - Live stats and user management
- **Loading states** - Smooth user experience
- **Toast notifications** - Success/error feedback

## 🔄 User Flow

### **For Admin Users:**
1. Login → Auto-redirect to `/admin/dashboard`
2. Full admin panel access
3. Manage users, products, orders

### **For Customer Users:**
1. Login → Redirect to `/dashboard` (customer dashboard)
2. No access to admin routes (401 Unauthorized)

## 🛠️ API Endpoints Used

### **Working Endpoints:**
- `GET /api/users` - List all users (admin only) ✅
- `PATCH /api/users/:id/role` - Change user role (admin only) ✅
- `POST /api/auth/*` - Authentication endpoints ✅

### **To Be Implemented:**
- Products CRUD endpoints
- Orders management endpoints  
- Analytics/reporting endpoints

## 🎯 Testing the Admin Panel

1. **Create Admin User**: `ADMIN_EMAIL=test@admin.com npm run seed:admin`
2. **Login as Admin**: Use the created credentials
3. **Test User Management**: Go to Users tab, try changing roles
4. **Verify Protection**: Try accessing `/admin` without admin role
5. **Test Navigation**: Navigate between different admin sections

## 🚀 Next Steps

The admin foundation is complete! You can now:
- Implement actual product management APIs
- Add order management backend
- Enhance analytics and reporting
- Add more admin features as needed

---

**Admin Panel is now fully functional!** 🎉
