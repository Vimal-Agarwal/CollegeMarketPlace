# CollegeMarketPlace

A platform for college students to buy and sell products within their campus. Built with MERN stack as part of FULL STACK DEVELOPMENT at SKIT, Jaipur.

## Tech Stack
- **Frontend** — React.js, React Router v6
- **Backend** — Node.js, Express.js
- **Database** — MongoDB + Mongoose
- **Auth** — JWT + bcryptjs

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Vimal-Agarwal/CollegeMarketPlace.git
cd CollegeMarketPlace
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` folder:
```dotenv


# Option 1: Local MongoDB
MONGO_URI=mongodb://localhost:27017/collegemarketplace

# Option 2: MongoDB Atlas (Cloud) — replace with your connection string
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/college-marketplace

# Server port
PORT=5000

# JWT Secret — change this to any long random string
JWT_SECRET=collegemarket_secret_key_2026


```

> The `.env` file is not pushed to GitHub. Every team member needs to create it manually.

> Not sure if MongoDB is installed? Run `mongod --version` in terminal.
> If you get an error, use Option 2 (MongoDB Atlas) — free and no installation needed.

### 3. Frontend Setup
```bash

cd ../frontend
npm install
```

### 4. Run the App
```bash

# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

## URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |

## Features
- Register/Login with JWT authentication
- List, browse, search and filter products
- Place orders and manage wishlist
- Sellers can delete their own listings
- Self-purchase prevention

---
