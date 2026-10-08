# StayEase - Hotel Room Booking System

## Project Overview

StayEase is a full-stack Hotel Room Booking System developed using HTML, CSS, JavaScript, Node.js, Express.js and SQLite.

The system allows hotel administrators to manage rooms, search available rooms, create bookings and cancel reservations.

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Backend
- Node.js
- Express.js
- REST API

### Database
- SQLite

## Features

- Dashboard
- Room management
- Add rooms
- Delete rooms
- Search available rooms
- Room type filtering
- Date-based availability
- Guest booking
- Booking cancellation
- Double-booking prevention
- Statistics
- Revenue calculation
- Input validation
- Responsive interface

## REST API

### Rooms

GET /api/rooms

POST /api/rooms

GET /api/rooms/:id

PUT /api/rooms/:id

DELETE /api/rooms/:id

GET /api/rooms/search

### Bookings

GET /api/bookings

POST /api/bookings

DELETE /api/bookings/:id

### Statistics

GET /api/stats

## How to Run

Install dependencies:

npm install

Start the server:

npm start

For development:

npm run dev

Open:

http://localhost:3000

## Database

SQLite automatically creates hotel.db when the application starts.

The database contains:

Rooms

Bookings

## Project Architecture

Frontend
    ↓
Express Routes
    ↓
Controllers
    ↓
SQLite Database

## Developed For

3rd Year Engineering Full Stack / Backend Development Project