# 🚀 TradeSphere – Unified Trading Platform

A full-stack unified trading platform that allows users to track assets, view live prices, manage portfolios, set alerts, and perform simulated trading operations.
The system is built using a microservice-style architecture with multiple backends and a modern React frontend.

---

## 📌 Project Overview

TradeSphere is designed to provide a single platform for monitoring and interacting with multiple financial assets such as crypto and stocks.
It integrates external market APIs and supports user management, admin controls, alerts, and dashboard analytics.

---

## 🧱 Architecture

Frontend and backend are separated and communicate through REST APIs.

* React frontend consumes APIs from backend services
* Spring Boot and .NET services handle business logic
* MySQL is used for persistent storage
* External APIs are used for live asset price data

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript / JSX
* CSS + Media Queries (Responsive design)
* Axios
* Chart.js

### Backend Services

**Spring Boot Service**

* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* REST Controllers
* Global Exception Handling
* Role-based APIs

**.NET Service**

* ASP.NET Core Web API
* Entity Framework Core
* LINQ
* REST endpoints
* DTO pattern

### Database

* MySQL
* Relational schema for users, assets, alerts, trades, portfolio

### External Integrations

* CoinGecko API (crypto prices)
* Market price APIs
* SMTP Email service (for alerts/notifications)

---

## ✨ Features

* 👤 User Registration & Login
* 🔐 Role-based access (User / Admin)
* 📊 Live asset price tracking
* 💼 Portfolio management
* 🔔 Price alerts
* 📈 Dashboard charts & analytics
* 🛒 Buy / Sell simulation
* 🤖 Chatbot module (microservice integration)
* 🧑‍💼 Admin dashboard
* CRUD operations for users/assets
* 📱 Responsive UI

---

## 🔄 API Flow

React Frontend → REST API Calls → Backend Controllers → Services → Database / External APIs → Response → UI Update

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
```

---

### 2️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

### 3️⃣ Spring Boot Backend

Configure database in:

```
application.properties
```

Run:

```bash
mvn spring-boot:run
```

---

### 4️⃣ .NET Backend

Update connection string in:

```
appsettings.json
```

Run:

```bash
dotnet run
```

---

### 5️⃣ Database Setup

Create MySQL database and update credentials in both backend configs.

---

## 📁 Modules

* Authentication Module
* Asset Module
* Portfolio Module
* Alert Module
* Admin Module
* Chatbot Service

---

## 🧪 Testing

* API tested using Postman
* Frontend tested with live API responses
* Error handling via global exception handlers

---

## 📌 Future Enhancements

* Real trade execution integration
* Advanced analytics
* WebSocket live updates
* Mobile app version

---

## 👨‍💻 Author

Developed as a Full Stack Major Project using Spring Boot, .NET, React, and MySQL.

---

## 📜 License

For academic and demonstration purposes.
