# 🚨 **LOGIN ISSUE - QUICK FIX GUIDE**

## **🔍 Problem Diagnosed:**
- Frontend trying to hit wrong API URL (`localhost:5173` instead of `localhost:4000`)
- Database configuration issues
- Admin user might not exist or be properly configured

---

## **⚡ IMMEDIATE FIX - Follow These Steps:**

### **Step 1: Check Database Configuration**
```bash
cd server
npm run check-db
```
This will tell you exactly what's wrong with your database setup.

### **Step 2: Fix Database URL**
**Your `.env` file has been updated. If you're using different PostgreSQL credentials, update this line:**
```env
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartrent_products
```

### **Step 3: Fix Login Issues**
```bash
cd server
npm run fix-login
```
This will:
- ✅ Test both database connections
- ✅ Create/fix admin user
- ✅ Verify login credentials
- ✅ Set up missing database tables

### **Step 4: Restart Your Servers**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

---

## **🎯 LOGIN CREDENTIALS:**
After running the fix script, use these credentials:

**Admin Login:**
- **URL:** `http://localhost:5173/auth/login`
- **Email:** `admin@smartrent.com`
- **Password:** `admin123`

---

## **🔧 If Still Having Issues:**

### **Issue: "PostgreSQL connection failed"**
**Solution:**
1. Install PostgreSQL: https://postgresql.org/download/
2. Start PostgreSQL service
3. Create database:
   ```bash
   createdb smartrent_products
   ```
4. Update `.env` with correct credentials

### **Issue: "MongoDB connection failed"**
**Solution:**
1. Install MongoDB: https://mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   mongod
   ```

### **Issue: "API requests still failing"**
**Solution:**
1. Ensure backend is running on port 4000
2. Ensure frontend is running on port 5173
3. Clear browser cache and restart

### **Issue: "Admin user login still fails"**
**Manual fix:**
```bash
cd server
npm run cleanup-user admin@smartrent.com
npm run seed:admin
```

---

## **✅ Success Indicators:**

**Backend Working:**
- ✅ Console shows: "API running on http://localhost:4000"
- ✅ No database connection errors
- ✅ "npm run check-db" shows all green checkmarks

**Frontend Working:**
- ✅ Login page loads at `http://localhost:5173/auth/login`
- ✅ No console errors about API calls
- ✅ Can successfully login with admin credentials

**Login Working:**
- ✅ Admin login redirects to `/admin/dashboard`
- ✅ Can see products, users, and orders management
- ✅ No 401 Unauthorized errors

---

## **🚀 After Login Works:**

**Test These Features:**
1. **Admin Panel** → View products, users, orders
2. **Create Product** → Add a new rental item
3. **Customer Registration** → Create a test customer account
4. **Rental Flow** → Browse and rent products as customer

---

## **📞 Still Need Help?**

Run this comprehensive diagnostic:
```bash
cd server
npm run check-db
npm run fix-login
npm run verify
```

This will give you a complete system health check and auto-fix most issues.

**The system is designed to work out of the box once databases are properly connected!** 🎉
