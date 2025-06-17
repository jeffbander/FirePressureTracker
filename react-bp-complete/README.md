# Fire Department Blood Pressure Management System - React Application

A standalone React application for managing firefighter blood pressure monitoring with the exact blue-themed interface.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` to view the application.

## Features

- Patient management with search and filtering
- Blood pressure readings with automatic categorization
- Dashboard with statistics and recent activity
- Workflow task management
- Communication logging
- Responsive blue-themed design

## Technology Stack

- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- TanStack Query for data management
- Wouter for routing
- Radix UI components

## Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service.

## Blood Pressure Categories

- **Normal**: <120/80 mmHg (Green)
- **Elevated**: 120-129/<80 mmHg (Yellow)  
- **Stage 1**: 130-139/80-89 mmHg (Orange)
- **Stage 2**: 140-179/90-119 mmHg (Red)
- **Crisis**: ≥180/≥120 mmHg (Dark Red)
- **Low**: <90/60 mmHg (Blue)