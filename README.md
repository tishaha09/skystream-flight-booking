# SkyStream Flight Booking System ✈️

A modern, full-stack commercial airline reservation platform built with **React 19**, **Node.js**, **Express.js**, **MongoDB (Mongoose with replica set `rs0` transactions)**, **Socket.IO v4**, and **Tailwind CSS v4**.

Designed with an executive airline reservation aesthetic inspired directly by the uploaded landing page reference (featuring an IndiGo-inspired clean executive layout, FlySky and Velox design tokens). Features a full-width layout (`w-full max-w-[1720px]`), a top full-width navbar with direct **Home** and **Flights** navigation links, a left vertical navigation rail, a wide soaring aircraft hero banner, free-form text search with real-time typing autocomplete and airport swapping (`⇆`), a completely scrollable filter sidebar with zero viewport traps, mobile slide-over filter drawer, centered and distraction-free authentication experience, and authentic digital boarding passes.

---

## 🌟 Key Features

### User Experience & Booking Engine
- **Recreated Landing Page & Clean Full-Width Navbar:**
  - **Full-Width Top Navbar:** Brand logo, clear navigation links (**Home** and **Flights**, plus **Admin** when authorized), executive dot matrix pattern, and user profile avatar / auth buttons. The search input has been removed from the header to keep focus on the hero/flight search engines, and the Billing link has been removed.
  - **Left Vertical Navigation Rail:** Fixed vertical sidebar with quick-access tabs (`✈ Book Tickets` with active indicator, `⚙ Manage Bookings`, `✓ Check-in`, `🪪 Passenger Details`, `✉ Update Contacts`, `📷 Flight Details`, and bottom user profile avatar).
  - **Wide Hero Banner:** Uncropped soaring commercial airliner against daylight blue sky with soft volumetric clouds, "Plan Your Trip" title with dot matrix pattern, and frosted floating search pill.
  - **Free-Form Text Autocomplete Search:** Source and Destination inputs accept any typed city or IATA airport code, provide interactive autocomplete popovers **only while typing**, allow typing custom locations, and feature an interactive swap button (`⇆`).
  - **Recent Bookings Cards:** Authentic recent route cards (**Chennai (MAA) ➔ Abu Dhabi (AUH)** and **Mumbai (BOM) ➔ Athens (ATH)**) with dates and direct arrow action pills, plus total count badge (`86+`).
  - **Seasonal Offers Banner:** "Travel across World 80% off on all trips" promo card featuring travel illustration and call-to-action.
  - **Commercial Flight Schedule Catalog:** Real-time scheduled commercial flights with carrier badges, durations, seat counters, and direct booking actions.
- **Flight Results & Filter Scrolling Fix (Complete Accessibility):**
  - **Desktop Independent Sticky Scroll:** Removed `overscroll-contain` scroll trap. Filter sidebar uses `sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-3 custom-scrollbar` with a sticky "Reset All" header, ensuring 100% of all filter options (Price slider, Airlines, Stops, Cabin Class, Departure Time, Special Fares) down to the bottom "Apply Filters" button can be scrolled smoothly on any desktop or laptop viewport height.
  - **Mobile / Tablet Slide-Over Drawer:** Compact filter action bar that opens a full-height slide-over drawer modal (`100dvh`) with dedicated scrolling body and sticky "Apply Filters" and "Reset All" buttons.
- **Interactive Cabin Seat Map (Velox Aesthetic):**
  - Sleek aircraft nose-cone dome container with clean class indicators.
  - Clear seat status keys: available (bordered card), selected (emerald green `✓`), occupied (muted grey `✕`).
- **Fare Type Concession System:**
  - **Regular (0%):** Standard commercial airline fare.
  - **Student (10% OFF):** Verified student discount requiring student ID and educational institution.
  - **Armed Forces (15% OFF):** Military service concession requiring service ID & branch.
  - **Senior Citizen (12% OFF):** Age-verified senior discount requiring passenger age $\ge 60$.
- **Streamlined & Focused Authentication Experience:**
  - Clean, centered executive authentication card on the `#EAEEF3` canvas.
  - Completely removed promotional descriptions, live telemetry cards, and feature highlight lists from both Sign In and Register views.
  - Active focus transfer: toggling to **Sign In** shifts focus to Email; toggling to **Create Account** shifts focus to Full Name via React `useRef`.
  - Password strength meter, password visibility toggles, and one-click examiner demo accounts.
- **Airline Boarding Pass with PDF & Print Export:** Perforated tear-off stub ticket design with PNR, terminal, gate, baggage allowance, barcode, and client-side A4 landscape PDF export powered by `html2pdf.js`.
- **Clean Airline Footer:** Real airline footer featuring brand overview, global destinations, 24/7 flight concierge & dispatch (+1 800-597-8732), social links, and carriage policies (with technical development text and replica set details completely removed).
- **Atomic Multi-Document Transactions:** Session-backed MongoDB transactions guarantee 100% data integrity with zero seat overbooking.
- **Real-Time Push Notifications:** Socket.IO alerts for booking confirmation, flight schedule adjustments, and seat cancellations.

### Administrator Operations
- **Command & Telemetry Dashboard:** Centralized operations center tracking gross revenue, active reservations, registered accounts, and 58+ commercial flights.
- **Flight & Equipment Scheduler:** Create and edit flights with equipment models (e.g. *Airbus A320neo*, *Boeing 787-9 Dreamliner*), airport terminals, boarding gates, and automated 60-seat layout generation.
- **Reservation Oversight:** Inspect passenger credentials and fare concession categories, and update reservation lifecycle states.
- **User Directory & RBAC:** View passenger accounts, promote users to administrator, and maintain account security.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router DOM v7, Socket.IO Client, html2pdf.js |
| **Backend** | Node.js (v18+/v22), Express.js v4, CORS, Dotenv, Bcryptjs (cost 12), JsonWebToken (JWT HS256), Socket.IO v4 |
| **Database** | MongoDB Community Server (Single-Node Replica Set `rs0`), Mongoose v8 ODM |
| **Architecture** | Model-View-Controller (MVC), RESTful API, WebSocket Event Rooms, Multi-Document ACID Transactions |

---

## 📁 Project Folder Layout

```text
skystream-flight-booking/
├── client/                        # React Frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── assets/                # Logos and destination imagery
│   │   ├── components/            # Reusable UI widgets (Navbar, Footer, Button, Modal, Loading, NotificationBell, ProtectedRoute)
│   │   ├── context/               # AuthContext & AuthProvider
│   │   ├── hooks/                 # Custom useAuth hook
│   │   ├── pages/                 # Home, AuthPage, Login, Register, Flights, FlightDetails, Booking, Confirmation, MyBookings, Profile
│   │   │   └── admin/             # AdminDashboard, AdminFlights, AdminBookings, AdminUsers
│   │   ├── services/              # api.js centralized fetch wrapper
│   │   └── utils/                 # fareTypes.js concession rules, currency (₹), date & badge formatters
│   ├── vite.config.js             # Vite configuration with proxy to http://localhost:5000
│   └── package.json
├── server/                        # Express.js REST API Backend
│   ├── config/
│   │   ├── db.js                  # MongoDB Mongoose connection
│   │   └── fareTypes.js           # Centralized fare rules, discounts & calculateFareBreakdown engine
│   ├── controllers/               # Business logic controllers (auth, flight, seat, booking, admin, notification)
│   ├── middleware/                # protect, adminOnly, notFound, errorHandler
│   ├── models/                    # User, Flight, Seat, Booking, Passenger, Notification
│   ├── routes/                    # Express REST route definitions
│   ├── utils/generateToken.js     # HS256 JWT generation
│   ├── server.js                  # Shared HTTP and Socket.IO server
│   ├── .env                       # Backend environment configuration
│   └── package.json
├── database/                      # Seeding scripts & utilities
│   ├── seed.js                    # Database seeder (58 flights, 3,480 seats, demo bookings, notifications)
│   └── seed.sh                    # Shell wrapper for seeding
└── md/                            # Architectural Documentation
    ├── frontend.md                # Frontend architecture and UI guide
    ├── backend.md                 # Backend architecture, controllers, and routes
    ├── mongo-db.md                # MongoDB replica set and transactional integrity
    └── postman.md                 # REST API testing endpoints
```

---

## 🚀 Quick Start Guide

### 1. MongoDB Replica Set Requirement
SkyStream uses MongoDB transactions for multi-seat bookings. Ensure your MongoDB instance is running with replica set `rs0`:

```bash
# In Windows PowerShell / Terminal:
mongod --dbpath <data-path> --replSet rs0
```

### 2. Backend Setup & Seeding

```bash
cd server
npm install
node ../database/seed.js --reset
npm run dev
```

The backend server starts on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Accounts (Examiner Ready)

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Fleet Administrator** | `admin@skystream.com` | `adminpassword` | Full fleet CRUD, user role management, operations dashboard |
| **Customer Passenger** | `john@example.com` | `password123` | Booking flights, seat selection, digital boarding passes |
| **Demo Customer 2** | `sarah@example.com` | `password123` | Standard passenger access |
| **Demo Customer 3** | `arjun@example.com` | `password123` | Standard passenger access |
