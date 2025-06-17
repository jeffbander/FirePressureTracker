# Fire Department Blood Pressure Management System

A clean, standalone React application for managing firefighter blood pressure monitoring and healthcare workflows.

## Features

- **Dashboard**: Real-time overview with statistics and recent readings
- **Patient Management**: Complete firefighter patient records with search and filtering
- **BP Trends Analysis**: Monitor blood pressure patterns and trends over time
- **Workflow Management**: Task assignment and follow-up tracking with priority levels
- **Communication Tracking**: Log patient interactions with outcome tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with blue theme
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Extract the application files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components
├── lib/
│   ├── mockData.ts      # Sample data for testing
│   └── utils.ts         # Utility functions
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Patients.tsx     # Patient management
│   ├── PatientDetail.tsx # Individual patient view
│   ├── Workflow.tsx     # Task management
│   ├── BPTrends.tsx     # Blood pressure trends
│   └── Communications.tsx # Communication logging
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Key Components

### Dashboard
- Real-time statistics overview
- Recent BP readings display
- Pending workflow tasks
- Quick access to abnormal readings

### Patient Management
- Complete firefighter records
- Search and filter functionality
- Department and union tracking
- Medical notes and emergency contacts

### BP Trends Analysis
- Historical blood pressure data
- Trend visualization
- Category-based filtering
- Patient-specific analysis

### Workflow Management
- Task creation and assignment
- Priority-based organization
- Status tracking
- Due date management

### Communication Tracking
- Multiple communication types (call, email, text, in-person)
- Outcome tracking
- Follow-up requirements
- Search and filtering capabilities

## Blood Pressure Categories

The system automatically categorizes BP readings according to AHA guidelines:

- **Normal**: Systolic < 120 AND Diastolic < 80
- **Elevated**: Systolic 120-129 AND Diastolic < 80
- **Stage 1 HTN**: Systolic 130-139 OR Diastolic 80-89
- **Stage 2 HTN**: Systolic ≥ 140 OR Diastolic ≥ 90
- **Hypertensive Crisis**: Systolic > 180 OR Diastolic > 120

## Customization

### Theme Colors
The application uses a blue-based color scheme. To customize colors, edit the Tailwind configuration in `tailwind.config.ts`.

### Mock Data
For testing purposes, the application includes sample data in `src/lib/mockData.ts`. Replace this with real data integration as needed.

### Adding New Features
1. Create new components in the appropriate directories
2. Add routes to `src/App.tsx`
3. Update navigation in the sidebar
4. Follow the existing TypeScript interfaces

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is designed for fire department use and follows healthcare data privacy requirements.

## Support

For technical support or feature requests, contact your system administrator.