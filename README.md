# 🇵🇰 myjourney.pk — Full-Stack Tourism Ecosystem & Intelligent AI Concierge

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.3-black?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Mongoose%209-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash%20AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Security Hardened](https://img.shields.io/badge/Security-Defense%20in%20Depth-success?style=flat-square&logo=shieldsdotio)](reference.md)

> **Live Preview & Architectural Showcase:** `myjourney.pk` is an enterprise-grade, full-stack MERN platform architected to revolutionize tourism across Pakistan. Bridging cultural heritage, rugged alpine topography, and modern web engineering, it features a context-grounded AI concierge, multi-day itinerary generation, verified travelogues, accommodation booking pipelines, and responsive mobile-first interfaces.

---

## 🌟 The Ambition Behind `myjourney.pk`

### 1. The Real-World Vision

Pakistan is home to some of the planet's most breathtaking geological and historical wonders — from the soaring peaks of the **Karakoram, Himalayas, and Hindu Kush** (housing K2, Nanga Parbat, and the Baltoro Glacier) to the ancient archaeological marvels of **Mohenjo-daro and Taxila**, and the pristine coastal landscapes of **Makran and Astola**.

Despite this peerless potential, both domestic travelers and international explorers encounter substantial digital friction:

- **Fragmented Information:** Unreliable travel forums, outdated road status updates, and scattered booking channels.
- **Opacity in Accommodations:** Limited transparency on hotel amenities, verified room rates, and seasonal availability.
- **Itinerary Planning Bottlenecks:** Difficulty coordinating multi-day travel itineraries that respect seasonal weather windows, road pass conditions (e.g., Babusar Pass, Khunjerab), and high-altitude acclimatization.
- **Safety & Eco-Consciousness Deficits:** Under-documented emergency helplines (1122), hazard precautions, and the urgent necessity for **Leave No Trace (LNT)** eco-trekking principles to preserve fragile alpine biomes.

**`myjourney.pk` was founded to solve this.** The project's vision is to serve as Pakistan's premier digital tourism ecosystem — providing an intuitive, transparent, and aesthetically captivating gateway that presents the nation's true hospitality and beauty to the world.

### 2. The Engineering & Portfolio Ambition

As an engineering showcase, `myjourney.pk` is built to demonstrate **defense-in-depth security, strict architectural decoupling, modern asynchronous state management, and practical Large Language Model (LLM) grounding**:

- **Zero-Trust Security:** Hardened against NoSQL injection, Stored/Reflected XSS, CSRF attacks, ReDoS, and Mail Header Injections.
- **Grounded AI with Zero Hallucination:** Rather than exposing an unconstrained chatbot, the integrated Google Gemini assistant is grounded directly in real-time MongoDB catalog data with verified internal routing.
- **Modern Monorepo Standards:** Built on **React 19**, **Express 5**, and **Mongoose 9**, strictly utilizing native ECMAScript Modules (`type: "module"`) end-to-end.
- **HCI & Accessibility-First:** Designed in adherence with WCAG 2.1 touch-target standards, progressive disclosure, cumulative layout shift (CLS) prevention, and 60fps passive scrolling.

---

## 🚀 Key Features

| Feature                                  | Description                                                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🏔️ **Curated Geo-Directory**             | Multi-faceted destination explorer covering **Gilgit-Baltistan, Khyber Pakhtunkhwa, Punjab, Sindh, Balochistan, and Azad Kashmir**, complete with seasonal visit windows, co-located sites, and regional cuisines. |
| 🏨 **Hotel & Stay Engine**               | Accommodations directory featuring multi-attribute filtering (nightly rate, amenities, star ratings) and an interactive reservation inquiry workflow.                                                              |
| 🤖 **Grounded AI Travel Concierge**      | Persistent floating drawer powered by **Google Gemini 3.8 Flash**. Grounded with live MongoDB catalog context to recommend real hotels and destinations using verified internal routing.                           |
| 🗺️ **AI Trip Architect**                 | Interactive itinerary planner generating comprehensive day-by-day travel schedules tailored to travel style, budget, group dynamics, and duration.                                                                 |
| ✍️ **Creator Travelogues**               | Multi-author travel stories featuring Markdown support, automatic reading-time calculation, view tracking, tag navigation, and DOMPurify XSS sanitization.                                                         |
| 🛡️ **Safety & Travel Advisories**        | Dedicated hubs for live highway advisories, high-pass accessibility (Babusar, Lowari), emergency numbers (1122, NHMP 130), and altitude sickness management.                                                       |
| 🌿 **Eco-Trekking & Cultural Etiquette** | Comprehensive guides championing _Leave No Trace_ environmental conservation, sacred site guidelines, and antiquities protection.                                                                                  |
| 🔖 **Personalized Dashboard**            | Authenticated user hub managing bookmarked destinations, saved hotel properties, and personalized itinerary plans.                                                                                                 |
| 📬 **Inquiry & Notification Pipeline**   | Asynchronous contact dispatch backed by MongoDB persistence and Nodemailer SMTP delivery with automated email-header sanitization.                                                                                 |

---

## 🛠️ Complete Technology Stack

### Frontend Architecture

- **Core Library:** [React 19](https://react.dev/) (`19.2.x`) Single-Page Application (SPA)
- **Build Tool & Dev Server:** [Vite 8](https://vitejs.dev/) with Hot Module Replacement (HMR)
- **Routing:** [React Router DOM v7](https://reactrouter.com/) with declarative protected routes
- **Server State & Caching:** [TanStack Query v5](https://tanstack.com/query/latest) (`@tanstack/react-query`) with automatic cache invalidation and background refetching
- **Styling & Design System:** [Tailwind CSS v3](https://tailwindcss.com/) with `clsx` and `tailwind-merge` for utility composition
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Security & Sanitization:** [DOMPurify](https://github.com/cure53/DOMPurify) for client-side HTML output escaping
- **HTTP Client:** [Axios](https://axios-http.com/) configured with global interceptors and `withCredentials: true`

### Backend Architecture

- **Runtime:** [Node.js](https://nodejs.org/) (v20+ recommended, ES Modules)
- **Web Framework:** [Express 5](https://expressjs.com/) (`5.3.x`)
- **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/) (`9.11.x`)
- **AI / LLM Integration:** [@google/genai](https://www.npmjs.com/package/@google/genai) (`3.0.x`) utilizing **Gemini 3.8 Flash**
- **Authentication:** JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) stored inside secure `HttpOnly` `SameSite=Lax` cookies
- **Password Hashing:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (salted with 10 rounds)
- **Email Delivery:** [Nodemailer](https://nodemailer.com/) (TLS/SSL SMTP transporter)

### Security & Hardening Suite

- **Header Hardening:** [Helmet](https://helmetjs.github.io/) enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and CSP defaults
- **NoSQL Injection Defense:** [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize) with in-place payload sanitization
- **Rate Limiting:** [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) protecting authentication and contact submission routes
- **CORS Strategy:** Strict whitelist matching against `CLIENT_URL` with explicit credential passing
- **Resilient Connectivity:** IPv4 forced network resolution (`family: 4`) preventing OpenSSL 3 TLS alert internal error socket drops

---

## 🏛️ System Architecture & Workflow

```
                                      ┌───────────────────────────────────────────────┐
                                      │             Client (React 19 SPA)             │
                                      │  Vite · Tailwind · TanStack Query · Router v7 │
                                      └──────────────────────┬────────────────────────┘
                                                             │
                                                  HTTPS / CORS (Credentials)
                                                 HttpOnly SameSite=Lax Cookie
                                                             │
                                                             ▼
                                      ┌───────────────────────────────────────────────┐
                                      │             Express 5 REST API                │
                                      │  Helmet · Rate Limit · express-mongo-sanitize │
                                      └──────┬───────────────┬───────────────┬────────┘
                                             │               │               │
                     ┌───────────────────────┘               │               └───────────────────────┐
                     ▼                                       ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────┐             ┌─────────────────────────┐
        │   MongoDB Atlas Cloud   │             │   Google Gemini API     │             │     SMTP Mail Server    │
        │ Mongoose 9 Schemas/Idx  │             │  gemini-3.8-flash Model │             │  Nodemailer Transporter │
        │ Users, Hotels, Blogs,   │             │ Grounded with Real-Time │             │  Secure Inquiries &     │
        │ Bookings & Itineraries  │             │ Platform Database State │             │  Customer Notification  │
        └─────────────────────────┘             └─────────────────────────┘             └─────────────────────────┘
```

### Detailed Sequential Flowcharts

For in-depth sequence diagrams illustrating the **Registration & JWT Cookie Flow**, **Multi-Filter & Dual Pagination**, **Grounded AI Workflow**, **Markdown Sanitization**, and **SMTP Dispatch**, inspect [reference.md](reference.md).

---

## 🔒 Security & Defense-in-Depth

| Vulnerability Vector                  | Defense Mechanism in `myjourney.pk`                                                                                              | File Reference                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| **NoSQL Query Injection**             | Operators like `$gt`, `$ne`, `$regex` are stripped from `body`, `params`, and `query` prior to reaching Mongoose handlers.       | `server/src/index.js`                         |
| **Cross-Site Scripting (XSS)**        | Markdown blog content is sanitized using `DOMPurify.sanitize()`; tokens are isolated in `HttpOnly` cookies.                      | `client/src/pages/BlogDetailPage.jsx`         |
| **Cross-Site Request Forgery (CSRF)** | Mitigated via `SameSite: 'Lax'` cookie directives coupled with mandatory `application/json` Content-Type preflight requirements. | `server/src/utils/generateToken.js`           |
| **Mail Header Injection**             | Strips `\r` and `\n` carriage returns from email input fields to prevent SMTP header tampering (`Bcc:`, `Cc:` injection).        | `server/src/controllers/contactController.js` |
| **ReDoS (Regex Denial of Service)**   | User search queries escape special regex symbols `/[.\*+?^${}()                                                                  | [\]\\]/g` before compound database queries.   | `server/src/controllers/destinationController.js` |
| **Brute-Force & Abuse**               | Express rate limiters throttle authentication endpoints (20 req / 15 min) and contact forms (10 req / 15 min).                   | `server/src/index.js`                         |

---

## 📂 Project Directory Structure

```
myjourney.pk/
├── client/                               # Single-Page Application (SPA) Frontend
│   ├── public/
│   │   ├── favicon.svg                   # Emerald tourism crest SVG favicon
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/                          # Axios base instance with credential interceptors
│   │   ├── components/
│   │   │   ├── ai/                       # Floating grounded AI concierge drawer
│   │   │   ├── auth/                     # RBAC protected route boundary
│   │   │   ├── common/                   # MultiSelect dropdown, dual pagination, back-to-top FAB
│   │   │   └── layout/                   # Navbar, footer, and main application layout wrapper
│   │   ├── context/                      # Global authentication context & cookie sync
│   │   ├── hooks/                        # Custom React hooks (useAuth, etc.)
│   │   ├── pages/                        # 17+ Modular application pages & guides
│   │   ├── App.jsx                       # Master React Router route declaration tree
│   │   └── main.jsx                      # React 19 root with TanStack Query provider
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                               # Node.js Express REST API Backend
│   ├── src/
│   │   ├── config/                       # Mongoose database connection (IPv4-resilient)
│   │   ├── controllers/                  # Auth, Destination, Hotel, Blog, AI, Booking, Contact
│   │   ├── middleware/                   # JWT verification, RBAC role authorization
│   │   ├── models/                       # Mongoose Schemas (User, Destination, Hotel, Blog, etc.)
│   │   ├── routes/                       # Express route definitions
│   │   ├── services/                     # Gemini AI Chat & Structured Itinerary Planner services
│   │   ├── utils/                        # Token generation, seed scripts
│   │   └── index.js                      # Express app bootstrap, Helmet, NoSQL sanitization
│   ├── .env.example                      # Environment template
│   └── package.json
│
├── reference.md                          # Academic defense guide & architectural manual
└── README.md                             # Project overview & portfolio showcase
```

---

## ⚡ Getting Started & Local Installation

### Prerequisites

- **Node.js**: `v20.x` or later installed
- **MongoDB**: Active MongoDB Atlas cluster URI or local instance running on `mongodb://127.0.0.1:27017`
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/myjourneypk.git
cd myjourneypk
```

---

### Step 2: Configure and Start the Server

1. Navigate to the server directory:

   ```bash
   cd server
   npm install
   ```

2. Create your `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `server/.env`:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/myjourney_pk?retryWrites=true&w=majority
   JWT_SECRET=replace_with_a_long_random_64_character_hex_string
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_google_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash

   # SMTP Dispatch (Optional for local testing; logs to console if omitted)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   CONTACT_RECEIVER_EMAIL=your_email@gmail.com
   ```

4. Populate the database with initial destinations, hotels, and travelogues:

   ```bash
   npm run seed
   npm run seed:blogs
   ```

5. Launch the backend development server:
   ```bash
   npm run dev
   ```
   _The server runs on [http://localhost:5000](http://localhost:5000)._

---

### Step 3: Configure and Start the Client

1. Open a new terminal and navigate to the client directory:

   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   _The client runs on [http://localhost:5173](http://localhost:5173)._

---

## 📡 API Reference Overview

The backend exposes a RESTful JSON API. All protected endpoints verify the user's role via the secure JWT cookie.

| Method | Endpoint                    | Access          | Purpose                                                     |
| ------ | --------------------------- | --------------- | ----------------------------------------------------------- |
| `POST` | `/api/auth/register`        | Public          | Register new user account with role selection               |
| `POST` | `/api/auth/login`           | Public          | Authenticate user and issue `HttpOnly` JWT cookie           |
| `GET`  | `/api/auth/me`              | Authenticated   | Retrieve current session and profile data                   |
| `POST` | `/api/auth/logout`          | Authenticated   | Clear session cookie and invalidate token                   |
| `GET`  | `/api/destinations`         | Public          | Search and filter destinations across provinces             |
| `GET`  | `/api/destinations/:slug`   | Public          | Retrieve detailed destination guide with co-located sites   |
| `GET`  | `/api/hotels`               | Public          | Search accommodations with price and amenity filters        |
| `POST` | `/api/ai/chat`              | Public          | Converse with the grounded Gemini 3.8 Flash travel guide    |
| `POST` | `/api/itineraries/generate` | Public / Auth   | Generate tailored multi-day day-by-day trip itinerary       |
| `GET`  | `/api/blogs`                | Public          | List published travelogues with tag filters                 |
| `POST` | `/api/blogs`                | Creator / Admin | Publish a new travelogue with read-time calculation         |
| `POST` | `/api/bookings`             | Authenticated   | Submit hotel reservation request                            |
| `POST` | `/api/contact`              | Public          | Submit contact message with rate-limiting and SMTP dispatch |

_Comprehensive Postman payload schemas and mock responses are detailed in [Section 4 of reference.md](reference.md#4-postman-api-testing-specifications)._

---

## 💡 Human-Computer Interaction (HCI) Highlights

- **Progressive Disclosure:** Replaced cumbersome province filter grids with an ergonomic multi-select dropdown that computes active selections in real-time (`Provinces (3)`).
- **Dual-Responsive Pagination:** Full numbered pagination on desktop accompanied by a lightweight micro-popover on mobile (`Page 1 of 5 [i]`) to conserve viewport real estate without losing system feedback.
- **Cumulative Layout Shift (CLS) Defense:** Every destination, hotel, and blog card enforces explicit aspect ratios (`aspect-video`), `loading="lazy"`, `decoding="async"`, and automatic fallback placeholders.
- **Ergonomic Floating Actions:** The AI Concierge and Back-To-Top buttons utilize stacked z-indexes and passive scroll event listeners (`{ passive: true }`), maintaining consistent 60fps rendering during fast flick-scrolling.

---

## 👨‍💻 Author & Portfolio Showcase

**Muhammad Waqar Saleem**  
_Bachelor of Science in Computer Science_  
**FAST National University of Computer and Emerging Sciences (NUCES)**

- **Email:** [mwaqarsaleem1@gmail.com](mailto:mwaqarsaleem1@gmail.com)
- **Role:** Full-Stack Architecture, Systems Design, UI/UX Engineering, and Security Implementation

**Fasih ur Rehman**
_Bachelor of Science in Computer Science_  
**FAST National University of Computer and Emerging Sciences (NUCES)**

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). All rights reserved for branding assets and proprietary media.
