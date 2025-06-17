# Fire Department Blood Pressure Management System - React Application

A comprehensive blood pressure monitoring system designed specifically for fire department personnel, built with React and modern web technologies. This is a standalone React application with the exact same blue-themed interface as the original system.

## Features

- **Patient Management**: Complete firefighter patient records with department tracking
- **Blood Pressure Monitoring**: Real-time BP readings with automatic categorization
- **Dashboard Analytics**: Visual overview of patient health metrics and statistics
- **Workflow Management**: Task assignment and follow-up tracking system
- **Communication Logs**: Patient interaction history and outcomes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Blue Theme**: Professional blue color scheme matching fire department branding

## Technology Stack

- **Frontend**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom blue theme variables
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for data fetching and caching
- **Charts**: Recharts for blood pressure trend visualization
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Extract the application files:
```bash
tar -xzf fire-department-bp-react-complete.tar.gz
cd react-bp-complete
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
react-bp-complete/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, cards, etc.)
│   │   ├── add-patient-dialog.tsx
│   │   ├── add-reading-dialog.tsx
│   │   ├── bp-chart.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── stats-cards.tsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── mockData.ts      # Sample data for development
│   │   ├── queryClient.ts   # TanStack Query configuration
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Page components
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── patients.tsx     # Patient management
│   │   ├── workflow.tsx     # Task management
│   │   ├── communications.tsx
│   │   └── bp-trends.tsx
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles and theme
│   ├── schema.ts           # TypeScript type definitions
│   └── bp-utils.ts         # Blood pressure utility functions
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Features

### Dashboard
- Real-time statistics overview with key metrics
- Recent blood pressure readings with color-coded categories
- Active workflow tasks requiring attention
- Quick navigation to all system functions

### Patient Management
- Comprehensive patient database with search functionality
- Blood pressure history tracking and trends
- Contact information and emergency contacts
- Medication tracking and allergy management
- Custom BP thresholds per patient

### Blood Pressure Categories
The system automatically categorizes readings using AHA guidelines:

- **Normal**: <120/80 mmHg (Green)
- **Elevated**: 120-129/<80 mmHg (Yellow)
- **Stage 1 Hypertension**: 130-139/80-89 mmHg (Orange)
- **Stage 2 Hypertension**: 140-179/90-119 mmHg (Red)
- **Hypertensive Crisis**: ≥180/≥120 mmHg (Dark Red)
- **Low Blood Pressure**: <90/60 mmHg (Blue)

### Workflow Management
- Automatic task creation for abnormal readings
- Priority-based task assignment
- Due date tracking and notifications
- Task status management (pending, in progress, completed)

### Communication Tracking
- Log all patient interactions (calls, emails, visits, notes)
- Track outcomes and follow-up requirements
- Scheduled follow-up reminders
- Communication history for each patient

## Customization

### Theme Colors
The blue color scheme is defined in `src/index.css`. To customize:

1. Update CSS variables in the `:root` selector
2. Modify `tailwind.config.ts` for additional color tokens
3. Adjust component-specific styles as needed

### Data Integration
Currently uses sample data for demonstration. To integrate with a real backend:

1. Update `src/lib/queryClient.ts` with your API endpoints
2. Modify type definitions in `src/schema.ts` if needed
3. Replace mock data imports with actual API calls
4. Configure authentication in `src/lib/auth.ts`

### Adding New Features

1. Create components in `src/components/`
2. Add pages to `src/pages/`
3. Update routing in `src/App.tsx`
4. Add new types to `src/schema.ts`
5. Update navigation in sidebar component

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Organization

- **Components**: Reusable UI components using composition patterns
- **Hooks**: Custom React hooks for shared logic
- **Pages**: Top-level route components
- **Types**: Centralized TypeScript definitions
- **Utils**: Pure functions and utilities

## Deployment

This is a static React application that can be deployed to any web server or CDN:

1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure your server to serve `index.html` for all routes (SPA routing)

### Recommended Hosting Platforms

- **Vercel**: Automatic deployments with GitHub integration
- **Netlify**: Easy drag-and-drop deployment
- **GitHub Pages**: Free hosting for public repositories
- **AWS S3 + CloudFront**: Scalable with custom domains
- **Azure Static Web Apps**: Integrated with Azure services

### Environment Variables

For production deployment, you may want to configure:

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_APP_NAME`: Application display name
- `VITE_VERSION`: Application version

## Security Considerations

This application includes health-related functionality. When deploying:

1. Ensure compliance with HIPAA regulations
2. Implement proper authentication and authorization
3. Use HTTPS for all communications
4. Regular security audits and updates
5. Backup and recovery procedures

## License

This project is designed for fire department use. Please ensure compliance with local regulations when handling patient data.

## Support

For technical issues, feature requests, or deployment assistance, contact your system administrator or development team.

## Changelog

### Version 1.0.0
- Initial release with full patient management
- Blood pressure monitoring and categorization
- Workflow task management
- Communication logging
- Responsive blue-themed design
- Mock data for development and demonstration