# Schedula - Doctor Appointment Booking System

## Project Overview
Schedula is a backend system for managing doctor appointments, availability, and scheduling.

## Tech Stack
- NestJS
- TypeScript
- PostgreSQL (Neon)
- TypeORM
- JWT Authentication
- Render (Deployment)

## Live Server URL
https://schedula-pooja.onrender.com

## Project Setup

### Installation
1. Clone the repository

git clone https://github.com/Poojakk112/schedula-pooja.git

2. Install dependencies
npm install

3. Run migrations
npm run migration:run

4. Start the server
npm run start:dev

## Environment Variables
Create a .env file with:
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
PORT=3000

## Features Implemented
- ✅ User Authentication (JWT)
- ✅ Doctor Profile Management
- ✅ Patient Profile Management
- ✅ Doctor Discovery and Search
- ✅ Doctor Availability (Recurring and Custom Override)
- ✅ Slot Generation (Stream and Wave Scheduling)
- ✅ Appointment Booking and Management
- ✅ Appointment Rescheduling
- ✅ 30 Minute Cutoff Rule
- ✅ Next Slot Suggestion

## API Endpoints

### Auth
- POST /auth/signup
- POST /auth/login

### Doctor
- POST /doctor/profile
- GET /doctor/profile
- PATCH /doctor/profile
- POST /doctor/availability
- GET /doctor/availability
- PATCH /doctor/availability/:id
- DELETE /doctor/availability/:id
- POST /doctor/availability/override
- GET /doctor/availability/date
- POST /doctor/scheduling-config
- GET /doctor/scheduling-config
- GET /doctor/appointments

### Patient
- POST /patient/profile
- GET /patient/profile
- PATCH /patient/profile
- GET /patient/slots

### Appointments
- POST /appointment
- GET /appointment/my
- PATCH /appointment/:id/cancel
- PATCH /appointment/:id/reschedule

## API Collection
Import schedula-api-collection.json in Postman to test all APIs!