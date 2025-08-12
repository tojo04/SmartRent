<div align="center">

# 🚀 SmartRent

### *Real-Time Rental Management Platform*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Built with Node.js](https://img.shields.io/badge/Built%20with-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20MongoDB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*Streamlining the entire rental lifecycle — from product listing to payment, delivery, and return*

---

</div>

## 👥 **Team Soul_Society**

<table align="center">
<tr>
<td align="center"><strong>🎯 Teijas Saini</strong><br><em>Team Lead</em></td>
<td align="center"><strong>💻 Rushil Jain</strong><br><em>Developer</em></td>
<td align="center"><strong>⚡ Vikash</strong><br><em>Developer</em></td>
<td align="center"><strong>🔧 Nitish Choubey</strong><br><em>Developer</em></td>
</tr>
</table>

---

## 📌 **Project Overview**

**SmartRent** is a comprehensive full-stack rental management platform that revolutionizes how businesses and customers interact in the rental ecosystem. Built with modern technologies, it provides real-time inventory management, seamless booking experiences, and automated workflows.

### **Video Link** - 
https://youtu.be/l3mLkUDyNRA

### **🎯 What Makes SmartRent Special?**

✅ **Dual-Role Architecture** - Separate experiences for customers and admins  
✅ **Real-Time Availability** - Prevents double-bookings with live inventory tracking  
✅ **Flexible Pricing** - Hourly, daily, weekly, and monthly rental options  
✅ **Secure Payments** - Integrated Razorpay payment gateway  
✅ **Automated Workflows** - Email notifications and scheduling automation  
✅ **Advanced Analytics** - Revenue tracking and detailed reporting  

---

## 🛠️ **Technology Stack**

<div align="center">

### **Frontend Ecosystem**
![React](https://img.shields.io/badge/React%2019.1.1-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite%207.1.0-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%203.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router%207.8-CA4245?style=flat&logo=reactrouter&logoColor=white)

### **Backend Infrastructure**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express%205.1-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB%208.17-47A248?style=flat&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%206.13-2D3748?style=flat&logo=prisma&logoColor=white)

### **Development & Tools**
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)

</div>

---

## ⚡ **Core Features**

<div align="center">

| 🔐 **Authentication & Security** | 🏪 **Product Management** | 💳 **Payment Integration** |
|:---:|:---:|:---:|
| JWT-based authentication | Real-time inventory tracking | Secure Razorpay integration |
| Role-based access control | Multi-category product catalog | Multiple payment methods |
| Email verification & OTP | Image upload & management | Automated invoice generation |

| 📅 **Booking System** | 📊 **Analytics & Reports** | 🔔 **Notifications** |
|:---:|:---:|:---:|
| Date range selection | Revenue analytics | Email notifications |
| Availability checking | Customer insights | Automated reminders |
| Booking confirmations | Export capabilities | Order status updates |

</div>

### **🎯 User Experiences**

**👤 Customer Journey:**
- 🔍 Browse comprehensive product catalog with advanced filtering
- 📅 Select rental dates with real-time availability checking
- 💰 Get instant pricing calculations for different durations
- 💳 Secure online payment processing
- 📱 Track orders and manage rental history
- 📧 Receive automated notifications and reminders

**👨‍💼 Admin Dashboard:**
- 📦 Complete product lifecycle management
- 💹 Dynamic pricing and discount configuration
- 📋 Order processing and fulfillment tracking
- 👥 Customer relationship management
- 📈 Comprehensive analytics and reporting
- ⚙️ System configuration and settings

---

## 📁 **Project Architecture**

```
SmartRent/
 │
 ├── Client
 │   ├── App
 │   │   ├── (admin)
 │   │   │   ├── dashboard
 │   │   │   │   └── page.jsx
 │   │   │   ├── products
 │   │   │   │   ├── new
 │   │   │   │   │   └── page.jsx
 │   │   │   │   └── page.jsx    
 │   │   │   ├── orders
 │   │   │   │   └── page.jsx    
 │   │   │   └── layout.jsx      
 │   │   │
 │   │   ├── (auth)      
 │   │   │   ├── login
 │   │   │   │   └── page.jsx
 │   │   │   ├── signup
 │   │   │   │   └── page.jsx
 │   │   │   └── layout.jsx
 │   │   │
 │   │   ├── (customer)
 │   │   │   ├── products
 │   │   │   │   └── [productId]
 │   │   │   │       └── page.jsx
 │   │   │   ├── cart
 │   │   │   │   └── page.jsx        
 │   │   │   ├── my-rentals
 │   │   │   │   └── page.jsx        
 │   │   │   └── layout.jsx       
 │   │   │
 │   │   ├── favicon.ico
 │   │   ├── globals.css
 │   │   ├── layout.jsx             
 │   │   └── page.jsx                
 │   │
 │   ├── components              
 │   │   ├── ui                  
 │   │   ├── icons               
 │   │   └── ProductCard.jsx         
 │   │
 │   ├── lib                     
 │   │   └── api.js                  
 │   │
 │   ├── hooks                   
 │   │
 │   ├── package.json
 │   └── tsconfig.json
 │
 │
 ├── server
 │   ├── src
 │   │   ├── auth
 │   │   │   ├── auth.controller.js
 │   │   │   ├── auth.service.js
 │   │   │   └── auth.module.js
 │   │   │
 │   │   ├── users
 │   │   │   ├── users.controller.js
 │   │   │   ├── users.service.js
 │   │   │   └── users.module.js
 │   │   │
 │   │   ├── products
 │   │   │   ├── products.controller.js
 │   │   │   ├── products.service.js
 │   │   │   └── products.module.js
 │   │   │
 │   │   ├── orders
 │   │   │   ├── orders.controller.js
 │   │   │   ├── orders.service.js
 │   │   │   └── orders.module.js
 │   │   │
 │   │   ├── payments
 │   │   │   ├── payments.controller.js
 │   │   │   └── payments.service.js
 │   │   │
 │   │   ├── pricing             
 │   │   │   ├── pricing.service.js
 │   │   │   └── pricing.module.js
 │   │   │
 │   │   ├── notifications
 │   │   │   └── notifications.service.js
 │   │   │
 │   │   ├── reports
 │   │   │   ├── reports.controller.js
 │   │   │   └── reports.service.js
 │   │   │
 │   │   ├── config
 │   │   │   └── configuration.js
 │   │   │
 │   │   ├── app.module.js
 │   │   └── main.js
 │   │
 │   ├── .eslintrc.js
 │   └── package.json
 │
 ├── .gitignore
 └── README.md
```

---

## 🚀 **Quick Start Guide**

### **📋 Prerequisites**
```bash
Node.js >= 18.0.0
MongoDB >= 5.0
PostgreSQL >= 13.0
npm >= 8.0.0
```

### **⚙️ Environment Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/tojo04/SmartRent.git
   cd SmartRent
   ```

2. **Backend Configuration**
   ```bash
   cd server
   cp config.example.env .env
   # Edit .env with your database credentials
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```

4. **Database Initialization**
   ```bash
   cd server
   npm run complete-fix    # Sets up both databases
   npm run test-backend    # Verifies setup
   ```

### **🚀 Launch Application**

**Start Backend (Port 4000):**
```bash
cd server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

**🎉 Access the application:**
- **Frontend:** `http://localhost:5173`
- **Admin Login:** `admin@smartrent.com` / `admin123`

---

## 🎯 **Development Roadmap**

<div align="center">

| Phase | Feature | Status |
|:---:|:---|:---:|
| **Phase 1** | 🔐 Authentication & User Management | ✅ Complete |
| **Phase 2** | 📦 Product Catalog & Inventory | ✅ Complete |
| **Phase 3** | 🛒 Booking & Cart System | ✅ Complete |
| **Phase 4** | 💳 Payment Integration (Razorpay) | ✅ Complete |
| **Phase 5** | 📊 Analytics & Reporting | 🔜 In Progress|
| **Phase 6** | 🔔 Notification System | 🔜 In Progress |
| **Phase 7** | 📱 Mobile Responsiveness | 🔜 In Progress |
| **Phase 8** | 🧪 Testing & Bug Fixes | 🔜 In Progress |

</div>

<!-- ---

## 📊 **Performance Metrics**

<div align="center">

| Metric | Value | Target |
|:---|:---:|:---:|
| 🚀 **Page Load Time** | < 2s | ✅ |
| 📱 **Mobile Responsive** | 100% | ✅ |
| 🔍 **SEO Score** | 95/100 | ✅ |
| 🛡️ **Security Grade** | A+ | ✅ |
| ⚡ **API Response Time** | < 500ms | ✅ |

</div> -->

---

## 🎨 **Key Functionality Highlights**

### **🔧 Admin Features**
- **Product Management**: Create, edit, delete products with image uploads
- **Order Management**: View, process, and track customer orders
- **User Management**: Manage customer accounts and permissions
- **Analytics Dashboard**: Real-time metrics and revenue tracking
- **Pricing Control**: Dynamic pricing rules and discount management

### **👤 Customer Features**
- **Product Browsing**: Advanced search and filtering capabilities
- **Rental Booking**: Date selection with availability checking
- **Secure Checkout**: Multiple payment options via Razorpay
- **Order Tracking**: Real-time status updates and history
- **Wishlist**: Save products for future consideration

### **🔒 Security Features**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permission control
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: API abuse prevention
- **Secure Payments**: PCI-compliant payment processing

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow:**
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

---

## 📞 **Support & Documentation**

- 📖 **Setup Guide:** [`COMPLETE_SETUP_GUIDE.md`](COMPLETE_SETUP_GUIDE.md)
- 🔧 **Troubleshooting:** [`FIXES_SUMMARY.md`](FIXES_SUMMARY.md)
- 🔐 **Authentication:** [`AUTH_FLOW_GUIDE.md`](AUTH_FLOW_GUIDE.md)
- 🩺 **Diagnostics:** [`LOGIN_DIAGNOSIS.md`](LOGIN_DIAGNOSIS.md)

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### **🌟 Star this repository if you found it helpful!**

**Built with ❤️ by Team Soul_Society**

*Transforming the rental industry, one line of code at a time*

---

[![GitHub stars](https://img.shields.io/github/stars/tojo04/SmartRent?style=social)](https://github.com/tojo04/SmartRent/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/tojo04/SmartRent?style=social)](https://github.com/tojo04/SmartRent/network/members)
[![GitHub issues](https://img.shields.io/github/issues/tojo04/SmartRent)](https://github.com/tojo04/SmartRent/issues)

</div>
