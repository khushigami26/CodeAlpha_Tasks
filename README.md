# 🚀 ProjectX - Enterprise Team Collaboration Platform

> A professional-grade, full-stack MERN application for seamless project management, real-time activity tracking, and intelligent team collaboration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-architecture--design)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment-on-render)
- [Screenshots](#-screenshots)

---

## 🎯 Overview

**ProjectX** is a high-performance collaboration platform designed to streamline team workflows. Inspired by industry leaders like ProjextX and Jira, it offers a rich, interactive experience for managing boards, lists, and tasks. Built with the **MERN stack**, it features a real-time activity engine, global theme management, and enterprise-level security.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login/register with Bcrypt password hashing |
| 📋 **Dynamic Boards** | Create and manage horizontal ProjextX-style boards with drag-and-drop feel |
| ⚡ **Real-time Activity** | Live tracking of all workspace actions (card additions, completions, deletions) |
| 🌙 **Adaptive Theme** | One-click toggle between **Light** and **Dark** modes (persisted in local storage) |
| 🤝 **Member Management** | Invite users to your workspace and manage roles within a unified interface |
| 🚀 **Workspace Settings** | Toggle AI capabilities, visibility policies, and restriction levels |
| 📤 **Data Export** | Export your project data in multiple formats: **JSON, CSV, PDF, Text** |
| 👤 **Full Profile Suite** | Manage profiles, cover photos, password changes, and 2FA security |
| 🔔 **Notification System** | Interactive dropdown for recent activity and board updates |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile workflows with a slick sidebar |

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework:** React 19 (via Vite 6)
- **Styling:** Tailwind CSS v4.0 (Custom Utility Classes, Dark Mode via class variables)
- **Routing:** React Router v7
- **State Management:** React Context API (AuthContext, ThemeContext, UIContext)
- **HTTP Client:** Axios (Custom interceptor instance)
- **Icons & Typography:** Lucide React, Google Inter Font
- **Animations:** CSS Keyframes & Tailwind Custom Variants
- **Drag & Drop:** `@hello-pangea/dnd` for fluid task management
- **Notifications:** `react-hot-toast` for highly customizable toast prompts

### Backend Architecture
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js 4.x
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
- **Security:** CORS, Helmet, Rate Limiting & Environment Isolation
- **API Structuring:** MVC Architecture (Models, Views/Routes, Controllers)

### Key Integrations
- **Images:** Dynamic Unsplash backgrounds for stunning boards
- **Data Export:** Built-in JSON data dump system for full workspace exports

---

## 🤖 System Structure

**ProjectX** is architected for scalability, utilizing the **MERN** stack for high performance and **Tailwind CSS 4** for a premium, low-latency UI components.

| Component | Responsibility |
|---|---|
| ✅ **Auth Context** | Manages user sessions, registration, and secure logout |
| ✅ **Theme Context** | Handles global Light/Dark mode state and transitions |
| ✅ **UI Context** | Centralized confirmation modals and interactive global elements |
| ✅ **Activity Logger** | Backend utility for tracking workspace-wide interactions |

---

## 📁 Project Structure

```text
Project_Management/
├── backend/                # Node.js & Express API
│   ├── config/             # DB Connection Config
│   ├── controllers/        # Route Logic (Auth, Projects, Tasks, Activity)
│   ├── models/             # Mongoose Schemas (User, Project, Task, Activity)
│   ├── routes/             # API Endpoints
│   ├── utils/              # Global Loggers & Helpers
│   └── server.js           # Entry point
├── frontend/               # React 19 SPA (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Modals, Layouts
│   │   ├── pages/          # Dashboard, ProjectBoard, Profile, Activity
│   │   ├── context/        # Auth, Theme, and UI Global States
│   │   ├── services/       # Axios API Instance
│   │   └── App.jsx         # Routes & Global Providers
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/khushigami262/ProjectX.git
cd Project_Management
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```bash
PORT=5000
MONGODB_URI="your_mongodb_atlas_url"
JWT_SECRET="your_secure_random_string"
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Start the frontend server:
```bash
npm run dev
```

Visit: **http://localhost:5173** (Vite default port)

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas Cluster connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for signing authentication tokens | ✅ Yes |
| `PORT` | Backend server port (defaults to 5000) | ❌ Optional |

---

## ☁️ Deployment on Render

1. Push your repository to GitHub.
2. Log in to [Render](https://render.com).
3. Create a **New Static Site** for the `frontend/` (or use a mono-repo config).
4. Create a **New Web Service** for the `backend/`.
5. Configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add Environment Variables in the Render dashboard (Settings -> Environment).

---

## 📸 Screenshots

| View | Features |
|---|---|
| 🏠 **Boards View** | Grid view of all projects with dynamic cards and trash icons. |
| 🛡️ **Activity Feed** | Global workspace history with user avatars and timestamps. |
| 📋 **Project Board** | Horizontal lists, task cards with color labels, and status checks. |
| 👤 **User Profile** | Cover photo customization, 2FA settings, and password reset. |
| 🌙 **Dark Mode** | Full dark-themed immersion for night-time productivity. |
| 📤 **Export Panel** | Professional icons and download options for data migration. |

---

## 👩💻 Author

**Khushi** — [@khushigami262](https://github.com/khushigami262)


---

<p align="center">🚀 Built with using MERN Stack & Tailwind CSS 4</p>
