# SmartRent
Real time rental management platform

## Team - Soul_Society

### Members: 

- Teijas Saini (Team Lead)
- Rushil Jain
- Vikash
- Nitish Choubey


## Folder Structure -
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