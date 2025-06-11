# React Frontend Setup - Fire Department BP System

## Current Interface Style
You're seeing the **React + Tailwind CSS frontend** with blue theme styling. This is the modern, interactive interface.

## How to Maintain This Style

### 1. Server Configuration
The system runs Node.js Express server which serves the React frontend and proxies API calls to Django.

### 2. Style Sources
- **Main CSS**: `client/src/index.css` - Contains blue theme variables
- **Tailwind Config**: `tailwind.config.ts` - Component styling framework
- **Components**: `client/src/components/` - Individual UI elements

### 3. Key Style Variables (Blue Theme)
```css
--primary: 207 90% 54%; /* #1976D2 - Main blue */
--ring: 207 90% 54%; /* Focus rings */
--chart-1: 207 90% 54%; /* Chart colors */
```

### 4. Architecture
- **Frontend**: React + TypeScript + Tailwind CSS (port 5000)
- **Backend**: Django API + PostgreSQL
- **Data Flow**: React → Express → Django API → Database

### 5. To Preserve This Setup
1. Always start with: VS Code Debug Panel → "Django Server" 
2. Let Node.js Express serve the React frontend automatically
3. Django provides the API backend
4. Keep both systems running together

### 6. File Structure for This Style
```
client/src/
├── components/ui/          # Tailwind UI components
├── pages/                  # React page components  
├── index.css              # Blue theme variables
└── App.tsx                # Main application

django_bp_system/          # API backend only
```

This preserves the exact modern, blue-themed interface you're seeing with interactive components, charts, and responsive design.