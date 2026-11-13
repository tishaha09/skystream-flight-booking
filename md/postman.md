# SkyStream Flight Booking System — Postman API Testing Guide

====================================================================
## 1. POSTMAN SETUP & ENVIRONMENT VARIABLES
====================================================================

This document outlines the testing sequence for the SkyStream REST API using **Postman**. An automated collection file is provided at:
`md/skystream_postman_collection.json`

### Import into Postman:
1. Open Postman.
2. Click **Import** (top left).
3. Select or drag-and-drop `md/skystream_postman_collection.json`.
4. All requests, folder hierarchies, and pre-request/test scripts will import instantly.

### Collection Variables:
The collection automatically manages these variables:

| Variable | Default Value | Description |
|---|---|---|
| `{{baseUrl}}` | `http://localhost:5000/api` | Base path for all Express REST routes |
| `{{userToken}}` | *(auto-set by Login Demo User)* | JWT bearer token for customer actions |
| `{{adminToken}}` | *(auto-set by Login Admin)* | JWT bearer token for administrator actions |
| `{{flightId}}` | *(auto-set by Get Flights)* | Targeted Flight ObjectId |
| `{{bookingId}}` | *(auto-set by Create Booking)* | Targeted Booking ObjectId / PNR |

---

====================================================================
## 2. API ENDPOINTS TESTING ORDER & EXPECTED RESPONSES
====================================================================

Follow this sequential testing order to demonstrate all CRUD operations, authentication, fare concession calculations, transactions, and error statuses.

---

### Step 1: Health Check (Server Verification)
- **Method & URL:** `GET http://localhost:5000/api/health`
- **Expected Status:** `200 OK`
- **Expected JSON:**
```json
{
  "status": "ok",
  "message": "SkyStream API is healthy",
  "timestamp": "2026-11-10T16:00:00.000Z",
  "uptime": 12.34
}
```

---

### Step 2: User Authentication & JWT Generation

#### A. User Registration (`POST /api/auth/register`)
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Alex Aviation",
  "email": "alex@skystream.test",
  "password": "password123",
  "phone": "+91 98765 43210"
}
```
- **Expected Status:** `201 Created`
- **Response:** Returns `user` object and `token`.

#### B. User Login (`POST /api/auth/login`)
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Status:** `200 OK`
- **Test Script:** Automatically sets `{{userToken}}`.

#### C. Admin Login (`POST /api/auth/login`)
- **Body:**
```json
{
  "email": "admin@skystream.com",
  "password": "admin123"
}
```
- **Expected Status:** `200 OK`
- **Test Script:** Automatically sets `{{adminToken}}`.

---

### Step 3: Flight Search, Filters & Equipment Telemetry

#### A. Search Non-Stop Flights Sorted by Cheapest
- **Method & URL:** `GET {{baseUrl}}/flights?source=Delhi&destination=Mumbai&stops=0&sort=cheapest`
- **Expected Status:** `200 OK`
- **Response:** Array of flight objects including `stops: 0`, `aircraft`, `terminal`, `gate`, `sourceCode: "DEL"`, `destinationCode: "BOM"`.

#### B. Get Aircraft Seat Map
- **Method & URL:** `GET {{baseUrl}}/flights/{{flightId}}/seats`
- **Expected Status:** `200 OK`
- **Response:** Array of 60 seat objects (`1A` through `10F`) with `status` (`available` or `booked`) and prices.

---

### Step 4: Atomic Bookings & Concession Calculation

#### A. Create Booking with Student Concession (10% OFF)
- **Method & URL:** `POST {{baseUrl}}/bookings`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{userToken}}`
- **Body:**
```json
{
  "flightId": "{{flightId}}",
  "selectedSeats": ["3A", "3B"],
  "fareType": "Student",
  "passengers": [
    {
      "name": "Student Flyer",
      "age": 21,
      "gender": "Male",
      "idNumber": "STU-9842",
      "institutionName": "National Aeronautical Institute",
      "email": "student@flyer.test"
    },
    {
      "name": "Co-Student Flyer",
      "age": 22,
      "gender": "Female",
      "idNumber": "STU-9843",
      "email": "co-student@flyer.test"
    }
  ]
}
```
- **Expected Status:** `201 Created`
- **Response Verification:**
  - `fareBreakdown.discountPercent`: `10`
  - `fareBreakdown.discountAmount`: Calculated accurately from total base fare
  - `fareBreakdown.taxAmount`: 12% GST calculated on net discounted fare
  - `status`: `"confirmed"`
  - `pNR`: 6-character unique code

#### B. Concession Age Verification Failure (Negative Test Case)
- **Method & URL:** `POST {{baseUrl}}/bookings`
- **Body:**
```json
{
  "flightId": "{{flightId}}",
  "selectedSeats": ["4A"],
  "fareType": "Senior Citizen",
  "passengers": [
    {
      "name": "Underage Senior",
      "age": 45,
      "gender": "Male",
      "idNumber": "AADHAAR123"
    }
  ]
}
```
- **Expected Status:** `400 Bad Request`
- **Expected Message:** `"Senior Citizen fare requires passenger age to be 60 or above."`

#### C. Get Boarding Pass Details
- **Method & URL:** `GET {{baseUrl}}/bookings/{{bookingId}}`
- **Headers:** `Authorization: Bearer {{userToken}}`
- **Expected Status:** `200 OK`
- **Response:** Returns populated flight, aircraft model, terminals, gates, passenger details, and fare breakdown.

---

### Step 5: Admin Operations

#### A. Admin Fleet Scheduler: Create New Flight
- **Method & URL:** `POST {{baseUrl}}/flights`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Body:**
```json
{
  "airline": "Air India",
  "flightNumber": "AI-888",
  "source": "Delhi (DEL)",
  "sourceCode": "DEL",
  "destination": "Goa (GOI)",
  "destinationCode": "GOI",
  "departureDate": "2026-12-01",
  "departureTime": "09:30 AM",
  "arrivalTime": "12:00 PM",
  "duration": "2h 30m",
  "price": 5400,
  "totalSeats": 60,
  "travelClass": "Economy",
  "stops": 0,
  "aircraft": "Airbus A320neo",
  "terminal": "T3",
  "gate": "B04",
  "status": "scheduled",
  "baggageInformation": "Cabin: 7kg, Check-in: 15kg"
}
```
- **Expected Status:** `201 Created`
