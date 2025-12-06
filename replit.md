# MedRecord - Electronic Medical Records System

## Overview
A visually stunning 3-tier Electronic Medical Records (EMR) system built with React/Vite, Express, and Firebase. Features a dreamy pink glass morphism aesthetic with Framer Motion animations.

## Architecture

### Tier 1 - Presentation (Frontend)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with pink gradient theme
- **Animations**: Framer Motion for smooth transitions
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter

### Tier 2 - Business Logic (Backend)
- **Server**: Express.js
- **Authentication**: Firebase Auth with Google Sign-in
- **API**: RESTful endpoints for CRUD operations

### Tier 3 - Data (Persistence)
- **Database**: Firebase Firestore
- **Collections**: users, patients, prescriptions, treatments, notifications

## Project Structure
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── AppSidebar.tsx
│   │   ├── FloatingOrbs.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── StatusBadge.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   ├── firebase.ts   # Firebase config
│   │   ├── firestore.ts  # Firestore CRUD operations
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/            # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Notifications.tsx
│   │   ├── Patients.tsx
│   │   ├── Prescriptions.tsx
│   │   └── Treatments.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
server/
├── index.ts
├── routes.ts
├── storage.ts
└── vite.ts
shared/
└── schema.ts            # Shared TypeScript types and Zod schemas
```

## Features

### Role-Based Access Control
- **Doctor**: Full CRUD on patients, prescriptions, treatments
- **Nurse**: Read/update patients and treatments
- **Pharmacist**: View prescriptions, dispense medications

### Patient Management
- Create, read, update, delete patient records
- Demographics, medical history, allergies
- Blood type, emergency contacts
- Status tracking (active, inactive, critical)

### Prescription System
- Create prescriptions with medication details
- Dosage, frequency, duration, special instructions
- Dispensing workflow for pharmacists
- Status tracking (pending, active, completed, cancelled)

### Treatment Tracking
- Schedule and manage treatments
- Priority levels (low, medium, high, urgent)
- Status workflow (scheduled → in-progress → completed)
- Assigned healthcare providers

### Notifications
- In-app notification system
- Mark as read/unread
- Delete notifications
- Type-based styling (info, success, warning, error)

## Design System

### Colors
- **Primary**: #EC4899 (Pink 500)
- **Secondary**: #F9A8D4 (Pink 300)
- **Background Gradient**: Pink 50 → White → Rose 50
- **Glass Cards**: White/70 with backdrop blur

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font weight 600-700
- **Body**: Font weight 400-500

### Components
- Glass morphism cards with subtle shadows
- Floating gradient orbs in background
- Smooth Framer Motion animations
- Responsive sidebar navigation

## Environment Variables Required
```
VITE_FIREBASE_API_KEY      # Firebase API key
VITE_FIREBASE_APP_ID       # Firebase App ID
VITE_FIREBASE_PROJECT_ID   # Firebase Project ID (medical-records-system-7ce74)
```

## Running the Application
The application runs with `npm run dev` which starts:
- Express backend on port 5000
- Vite dev server with HMR

## Firebase Configuration
1. Enable Google Authentication in Firebase Console
2. Add authorized domains (Replit dev URL and production URL)
3. Configure Firestore with appropriate security rules

## Security Rules
See design_guidelines.md for comprehensive Firestore security rules implementing role-based access control.
