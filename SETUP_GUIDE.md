# SmartRent Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Gmail account (for OTP emails)

### 1. Environment Configuration

**Backend Setup:**
```bash
cd server
cp config.example.env .env
```

Edit the `.env` file with your configuration:

```env
# Database - Update with your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/smartrent

# JWT Secrets - Generate secure random strings for production
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Email - Use Gmail App Password for GMAIL_PASS
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASS=your-gmail-app-password

# Admin User
ADMIN_EMAIL=admin@smartrent.com
ADMIN_PASSWORD=admin123
```

**Frontend Setup:**
```bash
cd client
npm install
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend  
cd client
npm install
```

### 3. Database Setup

Start MongoDB locally or use MongoDB Atlas.

Create admin user:
```bash
cd server
npm run seed:admin
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (runs on :4000)
cd server
npm run dev

# Terminal 2 - Frontend (runs on :5173 or :5174)
cd client  
npm run dev
```

### 5. Login

Go to `http://localhost:5173/auth/login` and use:
- **Email**: admin@smartrent.com
- **Password**: admin123

## 🔧 Configuration Details

### JWT Secrets
Generate secure secrets for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Gmail Setup
1. Enable 2FA on your Gmail account
2. Generate an App Password: Gmail Settings → Security → App passwords
3. Use the App Password (not your regular password) for GMAIL_PASS

### MongoDB Setup
- **Local**: Install MongoDB Community Server
- **Cloud**: Use MongoDB Atlas (free tier available)

## 🐛 Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Copy `config.example.env` to `.env` in the server folder
- Fill in all required values

**"MongooseError: Connection failed"**
- Ensure MongoDB is running locally OR
- Update MONGO_URI with your MongoDB Atlas connection string

**OTP emails not sending**
- Check GMAIL_USER and GMAIL_PASS in .env
- Ensure you're using Gmail App Password, not regular password

**"Cannot read properties of null (reading 'role')"**
- Run the admin seed script: `npm run seed:admin`
- Ensure the admin user is created and email verified

**Admin can't access /admin routes**
- Check user role in database - should be 'admin'
- Ensure isEmailVerified is true for admin user

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `POST /auth/verify-email` - Email verification
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Admin
- `GET /users` - List users (admin only)
- `PATCH /users/:id/role` - Change user role (admin only)

## 📁 Project Structure

```
SmartRent/
├── client/          # React frontend
├── server/          # Node.js backend
│   ├── src/
│   │   ├── auth/    # Authentication logic
│   │   ├── users/   # User management
│   │   └── config/  # Configuration
│   └── scripts/     # Database seeds
└── README.md
```
