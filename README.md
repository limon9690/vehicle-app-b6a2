# Vehicle Rental System API

A backend REST API for managing vehicles, users, and bookings with secure authentication and role-based access control.

---

## 🌐 Live URL

**Base URL:** https://vechicle-app-b6a2.vercel.app/

---

##  Features

-  JWT Authentication (Signup, Login, Role-based access)
-  User Management (Admin & Customer)
-  Vehicle Inventory Management (Add, update, delete, view)
-  Booking System (Create, cancel, return)
-  Automatic price calculation based on rental duration
-  Modular code structure (Routes → Controllers → Services)

---

##  Technology Stack

- **Node.js** + **TypeScript**
- **Express.js**
- **PostgreSQL**
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT security)

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/limon9690/vehicle-app-b6a2
cd vehicle-app-b6a2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a .env file
```bash
PORT=5000
CONNECTION_STR=postgres://user:password@host:5432/db_name
JWT_SECRET=your_secret_key
```

### 4. Start the server
```bash
npm run dev
```



