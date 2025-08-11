# 🎯 SmartRent Complete Setup Guide

## ✅ **What's Been Implemented**

### **Backend (Node.js + Express)**
✅ **MongoDB for Users & Authentication**
✅ **PostgreSQL for Products & Rentals** 
✅ **Complete Admin CRUD for Products**
✅ **Rental System with One-Item-Per-Customer Restriction**
✅ **Admin Customer Removal Functionality**
✅ **Full Authentication System**

### **Frontend (React + Vite)**
✅ **Admin Product Management (Create/Read/Update/Delete)**
✅ **Admin User Management (View/Delete Customers)**
✅ **Admin Orders/Rentals Management**
✅ **Customer Rental Interface**
✅ **One Rental Restriction UI**

---

## 🚀 **Quick Setup Instructions**

### **1. Database Setup**

**MongoDB (for Users/Auth):**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Default connection: mongodb://localhost:27017/smartrent
```

**PostgreSQL (for Products/Rentals):**
```bash
# Install PostgreSQL locally
# Create database: smartrent_products
createdb smartrent_products
```

### **2. Environment Configuration**

**Backend Environment:**
```bash
cd server
cp config.example.env .env
```

**Edit `.env` file:**
```env
# Required for MongoDB
MONGO_URI=mongodb://localhost:27017/smartrent

# Required for PostgreSQL  
POSTGRES_URL=postgresql://postgres:password@localhost:5432/smartrent_products

# Required for JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Optional for email (OTP will show in terminal if not set)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### **3. Install Dependencies & Setup Database**

```bash
# Backend setup
cd server
npm install
npm run migrate    # Sets up PostgreSQL tables + sample data
npm run seed:admin # Creates admin user

# Frontend setup
cd client
npm install
```

### **4. Start Development Servers**

```bash
# Terminal 1 - Backend (:4000)
cd server
npm run dev

# Terminal 2 - Frontend (:5173/:5174)
cd client
npm run dev
```

### **5. Access the Application**

**Admin Access:**
- URL: `http://localhost:5173/auth/login`
- Email: `admin@smartrent.com`
- Password: `admin123`
- Redirects to: `/admin/dashboard`

**Customer Access:**
- Register new account via `/auth/signup`
- Verify email with OTP (shown in server terminal)
- Access: `/rentals` for product browsing

---

## 🎨 **Features Overview**

### **Admin Capabilities**
1. **Products Management** (`/admin/products`)
   - ✅ View all products with real-time availability
   - ✅ Create new products with full details
   - ✅ Edit existing products
   - ✅ Delete products (with confirmation)
   - ✅ Stock management (total/available)

2. **User Management** (`/admin/users`)
   - ✅ View all registered users
   - ✅ Change user roles (admin ↔ customer)
   - ✅ Delete customer accounts (safety: can't delete admins)

3. **Rental Management** (`/admin/orders`)
   - ✅ View all rental orders
   - ✅ Update rental status (Pending → Confirmed → Picked Up → Returned)
   - ✅ Cancel orders
   - ✅ Real-time stats (total, active, completed, revenue)

### **Customer Capabilities**
1. **Product Browsing** (`/rentals`)
   - ✅ View all available products
   - ✅ Real-time stock information
   - ✅ Product details (price, category, description)

2. **Rental Process**
   - ✅ **One-item restriction**: Can only rent 1 item at a time
   - ✅ Date picker for rental period
   - ✅ Total cost calculation
   - ✅ Notes/special requirements

3. **Rental History**
   - ✅ View past rentals
   - ✅ Current rental status
   - ✅ Return date tracking

---

## 📊 **Database Schema**

### **PostgreSQL (Products & Rentals)**
```sql
-- Products Table
- id, name, description, images[]
- category, brand, model, condition
- pricePerDay, stock, availableStock
- isRentable, createdAt, updatedAt

-- Rentals Table  
- id, userId (MongoDB ref), userEmail, userName
- productId, startDate, endDate, totalDays
- pricePerDay, totalPrice, status, notes
- pickupDate, returnDate, createdAt, updatedAt

-- Rental Status Enum
PENDING, CONFIRMED, PICKED_UP, RETURNED, CANCELLED, OVERDUE
```

### **MongoDB (Users & Auth)**
```javascript
// Users Collection
{
  email, name, role, passwordHash,
  refreshTokenHash, isEmailVerified,
  emailVerificationToken, passwordResetToken,
  passwordResetExpires, createdAt, updatedAt
}
```

---

## 🔄 **Rental Workflow**

### **Customer Flow:**
1. **Browse Products** → Select available item
2. **Check Restriction** → Ensure no active rental
3. **Choose Dates** → Pick start/end dates  
4. **Submit Rental** → Status: PENDING
5. **Wait for Approval** → Admin confirms
6. **Pick Up Item** → Status: PICKED_UP
7. **Return Item** → Status: RETURNED

### **Admin Flow:**
1. **Receive Order** → Status: PENDING
2. **Review & Confirm** → Status: CONFIRMED
3. **Customer Pickup** → Status: PICKED_UP
4. **Customer Return** → Status: RETURNED
5. **Stock Updated** → Item available again

---

## 🛠️ **API Endpoints**

### **Products** (`/products`)
- `GET /` - List all products (public)
- `GET /:id` - Get single product (public)
- `POST /` - Create product (admin only)
- `PATCH /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

### **Rentals** (`/rentals`)
- `GET /` - List rentals (own for customers, all for admin)
- `POST /` - Create rental (customers)
- `GET /active` - Get active rental (customers)
- `GET /my-rentals` - Get rental history (customers)
- `PATCH /:id/status` - Update status (admin only)

### **Users** (`/users`)
- `GET /` - List users (admin only)
- `PATCH /:id/role` - Change role (admin only)
- `DELETE /:id` - Delete user (admin only)

---

## 🔐 **Security Features**

✅ **JWT Authentication** with refresh tokens
✅ **Role-based access control** (admin/customer)
✅ **Protected routes** with middleware
✅ **Input validation** with Zod schemas
✅ **Password hashing** with bcrypt
✅ **OTP email verification**

---

## 🧪 **Testing Commands**

```bash
# Test complete authentication flow
cd server
npm run test-auth

# Verify system setup
npm run verify

# Clean up test users
npm run cleanup-user test@example.com

# Check database connection
npm run migrate
```

---

## 🎉 **Success Indicators**

### **Frontend Working:**
- ✅ Admin can create/edit/delete products
- ✅ Admin can manage users and delete customers
- ✅ Admin can view and manage rental orders
- ✅ Customers can browse and rent products
- ✅ One-rental restriction enforced in UI

### **Backend Working:**
- ✅ PostgreSQL storing products and rentals
- ✅ MongoDB storing users and sessions
- ✅ Real-time stock management
- ✅ Rental status workflow
- ✅ Cross-database user references working

### **Integration Working:**
- ✅ Full CRUD operations connected
- ✅ Real-time data updates
- ✅ Proper error handling
- ✅ Authentication working end-to-end

---

## 🚨 **Troubleshooting**

### **"Missing environment variables"**
- Ensure `.env` file exists in `/server`
- Copy from `config.example.env` template
- Set all required variables

### **"Database connection failed"**
- **MongoDB**: Ensure MongoDB is running locally
- **PostgreSQL**: Create database and update POSTGRES_URL

### **"Products not loading"** 
- Run `npm run migrate` to set up tables
- Check PostgreSQL connection
- Verify API endpoints with browser network tab

### **"Can't delete customers"**
- Feature only available to admin users
- Can't delete other admin users (safety)
- Check user roles in admin panel

---

## 🎯 **You're All Set!**

**Your SmartRent platform now has:**
- ✅ Complete admin product & user management
- ✅ Full rental system with restrictions
- ✅ Dual database architecture (MongoDB + PostgreSQL)
- ✅ Modern React UI with real-time updates
- ✅ Secure authentication & authorization

**Start managing your rental business today!** 🚀
