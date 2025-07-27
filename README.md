# Union-Based Hypertension Program Management System

A comprehensive health management platform designed to support cardiovascular health monitoring across multiple unions through integrated mobile and web-based workflows.

## 🩺 Overview

This system provides end-to-end hypertension program management for union members, featuring AI-powered clinical triage, automated communication workflows, and bidirectional mobile app integration. Built specifically for healthcare programs serving firefighters, healthcare workers, and other union members.

### Key Statistics
- **554 Active Members** across 4 unions (UFOA, UFA, LBA, Mount Sinai)
- **7,473 Blood Pressure Readings** with automated trend analysis
- **Real-time Mobile Integration** via AppSheet bidirectional API
- **Automated Clinical Workflows** with AI-powered triage and task assignment

## ✨ Features

### 🏥 Clinical Management
- **Blood Pressure Monitoring**: Automated AHA guideline-based categorization
- **AI-Powered Triage**: Intelligent risk assessment and intervention recommendations
- **Clinical Workflows**: Automated task creation for abnormal readings
- **Trend Analysis**: Historical pattern recognition and escalation protocols

### 📱 Mobile Integration
- **Bidirectional AppSheet Sync**: Real-time data flow between mobile and web systems
- **Field Data Collection**: Mobile app for member registration and BP readings
- **Offline Capability**: Sync when connectivity is restored
- **Device Integration**: Automated BP monitor synchronization

### 👥 Union-Specific Features
- **Multi-Union Support**: UFOA, UFA, LBA, Mount Sinai with union-specific workflows
- **Role-Based Access**: Union reps, clinical teams, fulfillment staff, communication teams
- **Custom Fulfillment Routing**: Automated union-specific supply chain management
- **Performance Analytics**: Union-segmented health and operational metrics

### 🤖 Automation & AI
- **Intelligent Task Assignment**: AI-driven routing to coaches or nurse practitioners
- **Communication Management**: Automated follow-up scheduling and sentiment analysis
- **Risk Stratification**: Multi-factor cardiovascular risk scoring
- **Workflow Optimization**: Predictive analytics for operational efficiency

### 📊 Analytics & Reporting
- **Real-time Dashboards**: Operational, clinical, and communication performance metrics
- **Population Health Insights**: Union-wide health trend analysis
- **Compliance Reporting**: HIPAA-compliant audit trails and data management
- **Performance Tracking**: Member engagement and health outcome metrics

## 🏗️ Technical Architecture

### Backend
- **Node.js + Express**: RESTful API with TypeScript
- **PostgreSQL**: Normalized database with Drizzle ORM
- **Real-time Processing**: Webhook-based mobile app integration
- **Security**: Role-based authentication and HIPAA-compliant data handling

### Frontend
- **React 18**: Modern component-based UI with TypeScript
- **Tailwind CSS**: Responsive design with union-specific theming
- **TanStack Query**: Efficient server state management
- **Radix UI**: Accessible component primitives

### Mobile Integration
- **AppSheet API**: Bidirectional data synchronization
- **Webhook System**: Real-time mobile-to-web data flow
- **Export Endpoints**: Scheduled web-to-mobile data updates
- **Data Validation**: Comprehensive input sanitization and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- AppSheet account (for mobile integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/union-hypertension-system.git
   cd union-hypertension-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb union_hypertension_db
   
   # Set environment variables
   export DATABASE_URL="postgresql://user:password@localhost:5432/union_hypertension_db"
   
   # Initialize schema
   npm run db:push
   ```

4. **Configure environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Add your configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/union_hypertension_db
   APPSHEET_API_KEY_1=your_appsheet_api_key
   APPSHEET_API_KEY_2=your_backup_api_key
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📚 API Documentation

### Core Endpoints
- **Members**: `/api/patients` - Member management and profiles
- **BP Readings**: `/api/readings` - Blood pressure data and trends
- **Tasks**: `/api/workflow` - Clinical workflow management
- **Communications**: `/api/communications` - Member interaction tracking

### AppSheet Integration
- **Webhooks**: Real-time data sync from mobile app
  - `/api/appsheet/webhook/members` - Member data updates
  - `/api/appsheet/webhook/readings` - BP reading sync
  - `/api/appsheet/webhook/tasks` - Task status updates

- **Exports**: Scheduled data feeds to mobile app
  - `/api/appsheet/export/members` - Member list sync
  - `/api/appsheet/export/readings` - BP readings export
  - `/api/appsheet/export/tasks` - Task assignments

For complete API documentation, see: [AppSheet Bidirectional API Documentation](./docs/appsheet-bidirectional-api-documentation.md)

## 🎯 Usage Examples

### Adding a New Member
```bash
curl -X POST "http://localhost:5000/api/patients" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "dateOfBirth": "1980-05-15",
    "email": "john.smith@ufanyc.org",
    "mobilePhone": "555-0123",
    "union": "ufa",
    "unionMemberId": "UFA-123"
  }'
```

### Recording a BP Reading
```bash
curl -X POST "http://localhost:5000/api/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "systolic": 145,
    "diastolic": 95,
    "heartRate": 72,
    "notes": "Reading taken at station"
  }'
```

### Mobile App Integration Test
```bash
# Test AppSheet webhook
curl -X POST "http://localhost:5000/api/appsheet/webhook/members" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ADD",
    "data": {
      "fullName": "Mobile User",
      "union": "sinai",
      "email": "mobile@example.com"
    }
  }'
```

## 🗂️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend application
│   ├── routes/            # API route handlers
│   │   └── appsheet-integration.ts  # Mobile app integration
│   ├── services/          # Business logic services
│   ├── db.ts             # Database connection
│   └── storage.ts        # Data access layer
├── shared/               # Shared TypeScript types and schemas
│   └── schema.ts         # Database schema definitions
├── docs/                 # Documentation
│   ├── appsheet-bidirectional-api-documentation.md
│   └── appsheet-integration-summary.md
└── scripts/              # Database and deployment scripts
```

## 🛠️ Development

### Database Management
```bash
# Push schema changes
npm run db:push

# Generate migrations (if using migrations)
npm run db:generate

# Reset database (development only)
npm run db:reset
```

### Testing
```bash
# Run tests
npm test

# Test API endpoints
npm run test:api

# Test mobile integration
npm run test:appsheet
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 🏥 Union Configuration

The system supports multiple unions with specific configurations:

### Supported Unions
- **UFOA** (Uniformed Firefighters Association): 267 members
- **UFA** (Uniformed Fire Officers Association): 242 members  
- **LBA** (Local Bargaining Association): 33 members
- **Mount Sinai** (Healthcare Workers): 11 members

### Union-Specific Features
- Custom fulfillment routing (ShipNYC vs Union inventory)
- Union-specific approval workflows
- Tailored clinical protocols
- Custom reporting and analytics

## 📈 Monitoring & Analytics

### Health Metrics Dashboard
- Real-time member health status
- Blood pressure trend analysis
- Clinical intervention effectiveness
- Union-specific performance metrics

### System Health
```bash
# Check system status
curl "http://localhost:5000/api/appsheet/status"

# View recent activity
curl "http://localhost:5000/api/dashboard/stats"
```

## 🔒 Security & Compliance

### HIPAA Compliance
- Encrypted data storage and transmission
- Comprehensive audit logging
- Role-based access controls
- Secure data deletion (soft deletes)

### Authentication
- Session-based authentication
- Role-based permissions
- API key management for integrations
- Secure webhook validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Ensure HIPAA compliance for health data handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](./docs/appsheet-bidirectional-api-documentation.md)
- [Integration Guide](./docs/appsheet-integration-summary.md)
- [System Architecture](./replit.md)

### Getting Help
- Review the documentation in the `/docs` directory
- Check existing GitHub issues
- Create a new issue with detailed information about your problem

### Production Deployment
For production deployment assistance or enterprise support, please contact the development team.

---

**Built with ❤️ for union health programs**

This system helps protect the health of our essential workers through proactive cardiovascular monitoring and intelligent clinical workflows.