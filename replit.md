# RescueReach - Emergency Assistance Locator

## Overview
RescueReach is a comprehensive emergency assistance locator application that provides real-time emergency response coordination. The app features live location tracking, incident reporting, SOS alerts, and emergency services coordination with an interactive map interface.

## Recent Changes
- **2025-06-27**: Changed application name from "Siren Locator" to "RescueReach"
- **2025-06-27**: Implemented live interactive map using Leaflet replacing static image background
- **2025-06-27**: Added custom map markers for emergency services, incidents, and user location
- **2025-06-27**: Integrated real-time map popups with service information and actions
- **2025-06-27**: Enhanced current location display with pulsing marker and accuracy circle
- **2025-06-27**: Added location status indicator and "My Location" button
- **2025-06-27**: Fixed modal z-index layering to prevent map overlap issues

## Project Architecture

### Backend (Node.js + Express)
- **Storage**: In-memory storage (MemStorage) with seeded emergency services and response teams
- **API Routes**: RESTful endpoints for emergency services, incidents, SOS alerts, and response teams
- **Schema**: Drizzle ORM with PostgreSQL-compatible schema definitions

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Maps**: Leaflet with react-leaflet for interactive mapping

### Key Features Implemented
1. **Live Interactive Map**: OpenStreetMap tiles with Leaflet
2. **Emergency Services**: Hospital, police, fire station markers with contact info
3. **Incident Reporting**: Form-based reporting with type, severity, and location
4. **SOS Alerts**: Real-time emergency alerts with location sharing
5. **Emergency Dashboard**: Service provider interface for incident management
6. **Geolocation**: Real-time user location tracking
7. **Notifications**: Toast notifications for user feedback

### Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Leaflet, TanStack Query
- **Backend**: Node.js, Express, Drizzle ORM
- **Development**: Vite, TypeScript, ESLint
- **Styling**: Tailwind CSS with custom emergency theme colors

## User Preferences
- Application name: "RescueReach" (changed from "Siren Locator")
- Preferred map solution: Live interactive maps (not static images)
- UI Style: Professional emergency response theme with red/blue/orange color scheme

## Current State
The application is fully functional with:
- Live map interface showing emergency services and incidents
- Working incident reporting system
- SOS alert functionality
- Emergency services dashboard for responders
- Real-time location tracking
- Responsive design for mobile and desktop

## Technical Notes
- Using react-leaflet 4.2.1 for React 18 compatibility
- Custom Leaflet markers with emergency service icons
- Proper CSS import order for Leaflet styling
- In-memory storage for development (can be upgraded to PostgreSQL)