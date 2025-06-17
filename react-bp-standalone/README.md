# Fire Department Blood Pressure Management System - React Standalone

A comprehensive blood pressure monitoring system designed specifically for fire department personnel, built with React and modern web technologies.

## Features

- **Patient Management**: Complete firefighter patient records with department tracking
- **Blood Pressure Monitoring**: Real-time BP readings with automatic categorization
- **Dashboard Analytics**: Visual overview of patient health metrics
- **Workflow Management**: Task assignment and follow-up tracking
- **Communication Logs**: Patient interaction history and outcomes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom blue theme
- **UI Components**: Radix UI primitives with shadcn/ui
- **Routing**: Wouter for lightweight client-side routing
- **Data Management**: TanStack Query for state management
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Extract the application files:
```bash
tar -xzf fire-department-bp-react-standalone.tar.gz
cd react-bp-standalone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
react-bp-standalone/
├── src/
│   ├── components/ui/          # Reusable UI components
│   ├── lib/                    # Utilities and configurations
│   ├── pages/                  # Page components
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles and theme
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Components

### Dashboard
- Real-time statistics overview
- Recent blood pressure readings
- Active workflow tasks
- Quick navigation to key functions

### Patient Management
- Comprehensive patient database
- Search and filter capabilities
- Blood pressure history tracking
- Contact information management

### Blood Pressure Categories
- **Normal**: <120/80 mmHg (Green)
- **Elevated**: 120-129/<80 mmHg (Yellow)
- **Stage 1**: 130-139/80-89 mmHg (Orange)
- **Stage 2**: 140-179/90-119 mmHg (Red)
- **Crisis**: ≥180/≥120 mmHg (Dark Red)
- **Low**: <90/60 mmHg (Blue)

## Customization

### Theme Colors
The application uses a blue color scheme defined in `src/index.css`. To customize:

1. Update CSS variables in the `:root` selector
2. Modify `tailwind.config.ts` for additional color tokens
3. Adjust component-specific styles as needed

### Data Source
Currently uses mock data for demonstration. To integrate with a real backend:

1. Update `src/lib/queryClient.ts` with your API endpoints
2. Modify type definitions in `src/types/index.ts` if needed
3. Replace mock data imports with actual API calls

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript checks

### Adding New Features

1. Create components in `src/components/`
2. Add pages to `src/pages/`
3. Update routing in `src/App.tsx`
4. Add new types to `src/types/index.ts`

## Deployment

This is a static React application that can be deployed to any web server or CDN:

1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure your server to serve `index.html` for all routes

### Recommended Hosting Platforms

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## License

This project is designed for fire department use and includes health-related functionality. Please ensure compliance with HIPAA and local regulations when handling patient data.

## Support

For technical issues or feature requests, please contact your system administrator or development team.