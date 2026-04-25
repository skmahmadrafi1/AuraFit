# AuraFit 🏋️

A modern full-stack fitness web application.

## Project Structure

```
aurafit/
├── frontend/         → React + Vite frontend
├── backend/          → Node.js + Express API
└── chatbot/          → Optional Python chatbot
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev          # starts on http://localhost:5000
npm run seed         # seed workout data to MongoDB
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_secret>
DB_NAME=aurafit
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```
