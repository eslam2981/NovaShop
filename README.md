# 🌟 NovaShop: Premium E-Commerce Platform

![NovaShop Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop)

**A futuristic, enterprise-grade e-commerce storefront built with state-of-the-art web technologies.**

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/) 
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/) 
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/) 
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/) 
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

---

---

## 🚀 Overview
**NovaShop** is a cutting-edge full-stack e-commerce project designed with an absolute focus on **Premium User Experience** and **Absolute Security**. Featuring a stunning dark-mode-first glassmorphic UI, fluid micro-animations, and a highly secure Role-Based Access Control (RBAC) architecture, NovaShop bridges the gap between aesthetic brilliance and robust commercial functionality.

<br />

## 🔥 Core Features

### 🛒 For Shoppers
* **Immersive Visual Experience:** Smooth page transitions, parallax scrolling, and dynamic data rendering powered by Framer Motion.
* **Smart Cart & Wishlist:** Persistent local & server-synced cart state management using Zustand.
* **Modern Product Discovery:** Multi-layered categorization, dynamic "Hot Deals", and real-time inventory checks.
* **Checkout & Coupons:** Intelligent discount engine supporting percentage and fixed-rate promo codes.
* **Order Tracking:** Complete timeline tracking from `PENDING` to `DELIVERED`.

### 🛡️ For Administration (RBAC)
* **Owner Absolute Authority:** Exclusive rights to delete orders permanently, manage user roles, and generate global marketing coupons.
* **Admin Store Operations:** Streamlined product uploading, stock management, order progression, and category organization.
* **Dynamic Analytics Dashboard:** Live-synced database metrics directly showcased on the landing page hero section.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| ------ | ------ | ------ |
| **Frontend UI** | React, Vite | Ultra-fast client-side rendering & component architecture. |
| **Styling** | Tailwind CSS (Zinc/Glassmorphism) | Highly customizable, utility-first CSS framework. |
| **Animation** | Framer Motion | Physics-based, declarative animations and gesture handling. |
| **State Management** | Zustand | Clean, Redux-free global state container. |
| **Validation** | Zod & React Hook Form | Strict typings and client/server validation pipelines. |
| **Backend REST**| Node.js & Express | Scalable, un-opinionated API architecture. |
| **Database ORM** | Prisma | Typesafe database interfacing (SQLite/PostgreSQL). |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Git

### 1. Clone & Install Dependencies
First, install the required packages for both the frontend and backend.

```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the **backend** directory:
```env
PORT=5000
DATABASE_URL="file:./dev.db" # Default SQLite Config
JWT_SECRET="generate_a_super_secret_key_here"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Initialization
Run the Prisma migrations to generate the database schema.
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Run the Platform
Start both servers simultaneously using split terminals:

**Terminal 1 (Backend - API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Web Client):**
```bash
cd frontend
npm run dev
```
*Visit `http://localhost:5173` to explore NovaShop.*

---

## 🎨 Design Philosophy
NovaShop embraces a **"Dark Mode First"** philosophy utilizing tailored neutral color palettes (`zinc-950`), subtle neon glowing drop-shadows (`primary/20`), and frosted glassmorphism elements (`backdrop-blur-xl`). 
All UI elements adhere to rigorous accessibility guidelines while providing tactile feedback through micro-animations (`hover:scale`, `active:scale`).

---

## 👨‍💻 Developer
Developed with ❤️ by **Eslam Gamil**
* Full-Stack Developer specializing in high-performance Web Applications.

---
> *© 2026 NovaShop. All logic, architecture, and UI implementations are crafted to demonstrate enterprise-level best practices.*
