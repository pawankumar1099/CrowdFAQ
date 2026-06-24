<div align="center">

# CrowdFAQ

<p>Live Link :  <a href="https://crowdfaq-frontend.onrender.com/">https://crowdfaq-frontend.onrender.com/</a></p>

**Community-powered Q&A. Reliable answers, built together.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Deployment](#-deploying-to-render) · [API Reference](#-api-reference) · [Contributing](#-contributing)

---
<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/fa8acf0a-bc1a-407f-969f-9eff9c3186c9" />


</div>

## What is CrowdFAQ?

CrowdFAQ is an open-source community Q&A platform where users ask questions, contribute answers, and vote on the most helpful content. Admins and moderators curate an **Official FAQ** knowledge base — giving your community a single source of truth alongside organic, crowd-sourced discussion.

Think Stack Overflow meets your internal knowledge base.

---

## ✨ Features

### For Community Members
| Feature | Description |
|---|---|
| 📝 **Ask Questions** | Post questions with rich descriptions and topic tags |
| 💬 **Answer & Discuss** | Reply to any question; original authors can accept the best answer |
| 👍 **Vote** | Upvote or downvote questions and answers; votes are toggleable |
| 🔍 **Search** | Full-text search across questions, answers, and official FAQs simultaneously |
| 🏷️ **Tag Browsing** | Filter the question feed by technology or topic tags |
| 👤 **Public Profiles** | View any user's reputation, question count, answer count, and activity history |

### For Admins & Moderators
| Feature | Description |
|---|---|
| 📊 **Dashboard** | Platform-wide stats — total users, questions, answers, and FAQs |
| 🏆 **Leaderboard** | Top contributors ranked by reputation |
| 📋 **Official FAQs** | Curated, categorized knowledge base separate from community questions |
| 🔎 **Trending Tags** | See which topics your community is most active in |
| 👥 **Recent Registrations** | Monitor new user sign-ups in real time |
| 🗑️ **Moderation** | Admins can delete any question on the platform |

### For Everyone
- ⚡ **Reputation System** — Earn points for upvotes received. Climb from *Beginner* → *Contributor* → *Expert*
- 🔐 **JWT Authentication** — Secure, stateless auth with 7-day token expiry
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile
- 🚦 **Duplicate Detection** — Fuzzy similarity check warns before posting duplicate questions

---

## 🛠 Tech Stack

### Frontend
- **[React 19](https://react.dev)** — UI library
- **[Vite 7](https://vitejs.dev)** — Build tool & dev server
- **[React Router 7](https://reactrouter.com)** — Client-side routing
- **[Tailwind CSS 4](https://tailwindcss.com)** — Utility-first styling
- **[Axios](https://axios-http.com)** — HTTP client with auth interceptors

### Backend
- **[Node.js 20](https://nodejs.org)** — Runtime
- **[Express 5](https://expressjs.com)** — REST API framework
- **[Mongoose 9](https://mongoosejs.com)** — MongoDB ODM
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Password hashing
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** — JWT signing & verification

### Infrastructure
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** — Cloud database
- **[Render](https://render.com)** — Hosting (backend web service + frontend static site)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/crowdfaq.git
cd crowdfaq
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/crowdfaq
JWT_SECRET=your-long-random-secret-here
PORT=3001
```

Start the backend:

```bash
node app.js
# → Backend running on port 3001
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
# → Local dev server on http://localhost:5000
```

> **How the proxy works in dev:** Vite proxies all `/api/*` requests from the frontend to `localhost:3001` automatically. No extra config needed locally.

### 4. (Optional) Seed sample data

```bash
cd backend
node seed.js
```

This populates your database with sample users, questions, answers, and FAQs so you can explore the platform immediately.

---

## ☁️ Deploying to Render

CrowdFAQ is designed to run as **two separate services** on Render — a Node.js backend and a static frontend. Follow these steps in order.

### Step 1 — Deploy the Backend

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your repository, set **Root Directory** → `backend`
3. Configure the service:

   | Setting | Value |
   |---|---|
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

4. Add these environment variables:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long, random secret string |
   | `FRONTEND_URL` | *(leave blank for now)* |

5. Click **Deploy** and copy your backend URL once it's live
   (e.g. `https://crowdfaq-backend.onrender.com`)

### Step 2 — Deploy the Frontend

1. Go to Render → **New → Static Site**
2. Connect your repository, set **Root Directory** → `frontend`
3. Configure the site:

   | Setting | Value |
   |---|---|
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

4. Add this environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://crowdfaq-backend.onrender.com/api` ← your backend URL + `/api` |

5. Click **Deploy** and copy your frontend URL
   (e.g. `https://crowdfaq-frontend.onrender.com`)

### Step 3 — Link the services

1. Go back to your **Backend** service on Render
2. Add the remaining env var:

   | Key | Value |
   |---|---|
   | `FRONTEND_URL` | `https://crowdfaq-frontend.onrender.com` |

3. Redeploy the backend — CORS is now locked to your frontend domain.

> **Why `VITE_API_URL`?** In development, Vite proxies `/api` calls to `localhost:3001`. A built static site has no proxy — the frontend needs the backend's full URL baked in at build time. `VITE_API_URL` provides that.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login, receive JWT |
| `GET` | `/auth/me` | ✅ | Get current user |

### Questions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/questions` | — | List questions (sort, tag, pagination) |
| `GET` | `/questions/:id` | — | Get question detail |
| `POST` | `/questions` | ✅ | Create a question |
| `PUT` | `/questions/:id` | ✅ | Edit question (owner or admin) |
| `DELETE` | `/questions/:id` | ✅ | Delete question (owner or admin) |
| `GET` | `/questions/check-duplicate` | — | Fuzzy duplicate check by title |

### Answers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/answers?questionId=` | — | List answers for a question |
| `POST` | `/answers` | ✅ | Post an answer |
| `PUT` | `/answers/:id/accept` | ✅ | Accept an answer (question owner) |
| `DELETE` | `/answers/:id` | ✅ | Delete an answer |

### Votes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/votes` | ✅ | Cast or toggle a vote (up/down) |

### Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search?q=` | — | Search questions and FAQs |

### FAQs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/faq` | — | List all official FAQs |
| `POST` | `/faq` | ✅ Admin | Create an official FAQ |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | — | Get public user profile |
| `GET` | `/users` | ✅ Admin | List all users |

---

## 🗂 Project Structure

```
crowdfaq/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT middleware (auth, optionalAuth)
│   ├── models/
│   │   ├── User.js          # User schema (name, email, password, role, reputation)
│   │   ├── Question.js      # Question schema (title, description, tags, views)
│   │   ├── Answer.js        # Answer schema (body, accepted flag)
│   │   ├── Vote.js          # Vote schema (targetType, targetId, type)
│   │   └── FAQ.js           # Official FAQ schema (question, answer, category)
│   ├── routes/
│   │   ├── auth.js          # /api/auth
│   │   ├── questions.js     # /api/questions
│   │   ├── answers.js       # /api/answers
│   │   ├── votes.js         # /api/votes
│   │   ├── faq.js           # /api/faq
│   │   ├── search.js        # /api/search
│   │   └── users.js         # /api/users
│   ├── app.js               # Express entry point
│   ├── seed.js              # Database seeder
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── lib/
│   │   │   └── axios.js         # Axios instance with auth interceptor
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Questions.jsx
│   │   │   ├── QuestionDetail.jsx
│   │   │   ├── AskQuestion.jsx
│   │   │   ├── FAQs.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml              # Render Blueprint for one-click deploy
└── README.md
```

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **User** | Ask questions, post answers, vote, view profiles |
| **Moderator** | Everything above + access the admin dashboard |
| **Admin** | Everything above + delete any question, manage FAQs, view all users |

Roles are assigned at the database level. To promote a user to admin, update their `role` field in MongoDB Atlas directly.

---

## 🏆 Reputation System

Reputation is earned by receiving upvotes on your content.

| Threshold | Rank |
|---|---|
| 0 – 100 | Beginner |
| 101 – 500 | Contributor |
| 500+ | Expert |

Each upvote on your question or answer awards **+2 reputation** to your account.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please make sure your code follows the existing style and that the app runs correctly end-to-end before submitting.

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the community, for the community.

</div>
