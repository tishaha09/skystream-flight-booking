# SkyStream Flight Booking System — Frontend Architecture Documentation

====================================================================
## 1. WHAT WAS BUILT IN THIS LAYER AND WHY
====================================================================

The frontend of **SkyStream** is a Single Page Application (SPA) designed to deliver an authentic, clean, executive airline reservation experience inspired by top modern aviation platforms (IndiGo-inspired executive layout, FlySky and Velox design systems).

### Visual Identity & Design System (IndiGo Reference & Executive Layout)
SkyStream adopts a clean, wide-format luxury aviation aesthetic:
- **Foundation Canvas:** Cool off-white and soft grey-blue tint (`#EAEEF3`, `#F0F4F8`) providing a spacious, airy visual atmosphere.
- **Brand Colors:** Deep Executive Navy (`#113B7A`, `#0B2545`), Sky Blue accents (`#0284C7`, `#0EA5E9`), Soft Tint backgrounds (`#E0F2FE`), and emerald accents (`#10B981`) for confirmed flight statuses and concession badges.
- **Full-Width Canvas:** Spans the entire screen width (`w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8`), eliminating the narrow "square card in the center of the screen" constraint.
- **Card Surfaces:** Pure white surfaces (`#FFFFFF`) with subtle border lines (`#E2E8F0`, `#CBD5E1`) and clean shadows (`shadow-sm`, `shadow-md`), avoiding artificial glowing AI borders.
- **Typography:** High-contrast dark navy and charcoal (`#0B2545`, `#0F172A`, `#334155`) for crystal-clear readability, slate-500 (`#64748B`) for secondary metadata, and bold sans-serif headlines.

---

### Core Visual & Functional Features

1. **Recreated Landing Page & Clean Full-Width Navbar:**
   - **Full-Width Top Navbar:**
     - Left brand emblem: `SkyStream` with flight insignia.
     - Clean, balanced navigation links: **Home** (`/`) and **Flights** (`/flights`), plus **Admin** when signed in as an administrator.
     - Decorative dot matrix indicator and authenticated user profile avatar / login buttons.
     - Completely removed the redundant search input from the header (concentrating search on the landing page hero and flight catalog).
     - Completely removed the Billing link from the navigation interface.
   - **Left Vertical Navigation Rail:**
     - Fixed vertical sidebar with quick-access tabs:
       - `✈ Book Tickets` (active with highlighted left indicator)
       - `⚙ Manage Bookings`
       - `✓ Check-in`
       - `🪪 Passenger Details`
       - `✉ Update Contacts`
       - `📷 Flight Details`
     - Bottom authenticated user profile avatar card with initials.
   - **Wide Hero Banner:**
     - High-resolution soaring commercial aircraft against daylight blue sky with soft volumetric clouds.
     - "Plan Your Trip" title with executive dot matrix pattern.
     - Frosted floating pill search bar:
       - Free-form text input for **FROM** (Source) with interactive typing autocomplete popover.
       - Interactive airport swap button (`⇆`).
       - Free-form text input for **TO** (Destination) with interactive typing autocomplete popover.
       - Departure date picker with calendar icon.
       - Primary navy search button (`Search`).
   - **Recent Bookings Section:**
     - Authentic recent route cards: **Chennai (MAA) ➔ Abu Dhabi (AUH)** and **Mumbai (BOM) ➔ Athens (ATH)** with dates and direct arrow action pills.
     - Total booking count pill (`86+`).
   - **Seasonal Offers Banner:**
     - "Travel across World 80% off on all trips" promo card featuring travel illustration and call-to-action.
   - **Commercial Flight Schedule Catalog:**
     - Real-time scheduled flights with airlines, durations, prices, and direct booking actions.

2. **Free-Form Text Search with Typing Autocomplete & Validation:**
   - Source and Destination are free-form text inputs (no restrictive fixed dropdowns).
   - Smart autocomplete popover appears **only while typing** (or on focus when typed), filtering matching airports by city name or 3-letter IATA code.
   - Users can select a suggestion or type their own custom query.
   - Interactive swap button (`⇆`) exchanges source and destination with smooth state updates.
   - Comprehensive validation prevents searching when source and destination are identical or empty.

3. **Flight Search & Filter Scrolling Fix (Complete Accessibility):**
   - **Desktop Independent Sticky Scroll:**
     - Fixed sticky container overflow traps by removing `overscroll-contain` and implementing `sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-3 custom-scrollbar`.
     - Sticky top bar with quick "Reset All" button.
     - Allows users to smoothly scroll through 100% of the filter controls (Price slider, Airlines, Stops, Cabin Class, Departure Time, Special Fare Concessions) down to the bottom "Apply Filters" button on any desktop or laptop screen resolution (tested on 700px laptop heights and 1000px desktop viewports).
     - Thin, sleek custom scrollbar styling (`custom-scrollbar`) integrated cleanly into Tailwind CSS.
   - **Mobile / Tablet Slide-Over Drawer:**
     - On smaller viewports (`< lg`), displays a compact sticky filter trigger bar with active filter count.
     - Tapping opens a full-height slide-over drawer modal (`100dvh`) with a dedicated scrollable body and sticky "Apply Filters (X Results)" and "Reset All" buttons.
   - Clean white flight cards with clear airline emblems, flight numbers, duration lines with non-stop/1-stop indicators, seat availability counters, and direct booking actions.

4. **Streamlined & Focused Authentication Experience (Content Cleanup):**
   - Completely removed unneeded promotional descriptions, live route telemetry cards, and feature highlight lists from both Sign In and Register views.
   - Rebalanced into a clean, centered, executive card layout (`max-w-lg`) on the `#EAEEF3` background canvas.
   - Clear visual hierarchy focused entirely on user credentials and authentication actions.
   - Smooth tab switching between **Sign In** and **Create Account**.
   - React `useRef` focus management: switching tabs automatically transfers focus to the first input field of the active form.
   - Password strength meter, password visibility toggles, and one-click demo credentials for rapid verification.

5. **Interactive Fuselage Cabin Seat Map (Velox Aesthetic):**
   - Aerodynamic white nose-cone dome container with clean class indicators.
   - Real-time seat statuses: clean bordered cards for Available, emerald green `✓` for Selected, and muted grey `✕` for Occupied seats.
   - Live estimated fare calculations and seat quantity validation.

6. **Digital Boarding Pass & Export:**
   - Realistic twin-section boarding pass with perforated tear-off stub, flight route codes, departure/arrival times, gate, terminal, and barcode.
   - Single-click official PDF export via `html2pdf.js` and clean print styles.

7. **Clean Airline Footer:**
   - Professional airline footer with quick navigation links, customer concierge support, international hub destinations, privacy policy, and conditions of carriage.
   - Completely free of internal database or technical stack text.

---

====================================================================
## 2. FOLDER STRUCTURE & EXPLANATION OF EVERY FILE
====================================================================

```text
client/
├── index.html                     # Entry HTML template with SkyStream title & favicon
├── vite.config.js                 # Vite configuration with React, Tailwind v4, and /api proxy
├── package.json                   # Client dependencies (React 19, React Router 7, Tailwind 4, Socket.io)
├── .env                           # Client environment variables
└── src/
    ├── main.jsx                   # React root mount point wrapped with AuthProvider
    ├── App.jsx                    # Central client router with public and protected routes
    ├── index.css                  # Executive design tokens, full-width canvas, clean scrollbar & print styles
    ├── assets/                    # Static image assets and logos
    ├── components/                # Reusable UI widgets
    │   ├── Navbar.jsx             # Clean balanced navbar with Home/Flights links, dot matrix & profile avatar
    │   ├── Footer.jsx             # Clean airline footer with customer support & route links
    │   ├── Button.jsx             # Reusable button supporting navy, primary, secondary, outline & danger
    │   ├── Modal.jsx              # Accessible popover modal with clean backdrop and escape listener
    │   ├── Loading.jsx            # Sleek airline spinner with rotating travel phrases
    │   ├── NotificationBell.jsx   # Real-time Socket.IO notification dropdown with unread badge
    │   └── ProtectedRoute.jsx     # Route guard enforcing login and role authorization
    ├── context/
    │   └── AuthContext.jsx        # Context provider managing user state, JWT tokens, and login/logout
    ├── hooks/
    │   └── useAuth.js             # Custom hook providing simplified access to AuthContext
    ├── services/
    │   └── api.js                 # Centralized fetch wrapper adding JWT Bearer headers and error handling
    ├── utils/
    │   ├── fareTypes.js           # Concession rules (Regular, Student 10%, Armed Forces 15%, Senior 12%)
    │   └── formatters.js          # Helpers for INR currency (₹), date strings, and status badge styles
    └── pages/                     # Application view controllers
        ├── Home.jsx               # Left vertical rail, wide hero banner, text input search pill, recent bookings, seasonal offers
        ├── AuthPage.jsx           # Centered focused auth card without promotional/telemetry content, demo accounts
        ├── Login.jsx              # Route entry point rendering AuthPage in 'login' mode
        ├── Register.jsx           # Route entry point rendering AuthPage in 'register' mode
        ├── Flights.jsx            # Text input search + swap, scrollable filter sidebar (zero traps), mobile drawer, flight cards
        ├── FlightDetails.jsx      # Velox inspired nose-cone cabin seat map with interactive selection
        ├── Booking.jsx            # Fare concession selector & passenger credential forms
        ├── BookingConfirmation.jsx# Clean boarding pass with perforated stub, barcode, PDF & print
        ├── MyBookings.jsx         # Reservation history with atomic cancellation modal & boarding pass
        ├── Profile.jsx            # User profile viewer, loyalty tier card, and security credential updater
        └── admin/                 # Administrator console
            ├── AdminDashboard.jsx # KPI telemetry cards (Flights, Bookings, Users, Revenue)
            ├── AdminFlights.jsx   # Commercial flight fleet manager with CRUD & status toggles
            ├── AdminBookings.jsx  # Customer reservation oversight with passenger manifest inspector
            └── AdminUsers.jsx     # User access directory with role promotion/demotion and deletion
```

---

====================================================================
## 3. HOW TO RUN THE FRONTEND
====================================================================

```bash
cd client
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
