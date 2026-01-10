# Agricultural Monitoring and Management System

A comprehensive web-based monitoring system for agricultural and environmental data, featuring real-time sensor data visualization, weather forecasting, station management, and role-based access control.

## Overview

This system provides a modern React-based interface for monitoring agricultural stations with capabilities for:
- Real-time sensor data from weather and soil monitoring stations
- Historical data analysis with customizable time ranges (3, 7, 15, 30 days)
- Interactive maps showing station locations
- Station comparison tools
- Plot activity management with image uploads
- SIM card management (Admin)
- User and permission management (Admin)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Maps**: Google Maps API
- **State Management**: React Context API + SWR (for future API integration)

## User Roles

- **User**: Access to assigned stations only, can view data and manage activities for permitted stations
- **Admin**: Full access to all stations, users, SIM cards, and system settings

## Features

### Dashboard
- Overview of all assigned stations (or all stations for Admin)
- Real-time sensor data summary
- Station online/offline status
- Latest images from stations
- Weather forecast integration
- VPD (Vapor Pressure Deficit) calculations

### Station Monitoring

**Weather Station (Station 1)**
- Air temperature, humidity, light intensity
- Wind direction and speed
- Rainfall and atmospheric pressure
- Station images
- Weather forecast comparison
- CSV data export

**Soil Monitoring Station (Station 2)**
- Dual soil moisture sensors
- Station images
- Historical trend analysis
- CSV data export

### Map View
- Google Maps integration showing all stations
- Station markers with details
- Latest station images on map
- Direction links to station locations

### Station Comparison
- Compare data from any two stations
- Side-by-side sensor data visualization
- Time range selection (3, 7, 15, 30 days)
- Daily average/max/min values
- Map showing both station locations

### Plot Activity Management
- CRUD operations for farm activities
- Activity types and descriptions
- Image uploads (max 3 per activity per day)
- Activity history and filtering
- CSV export

### Admin Features

**SIM Management**
- Manage SIM cards used in stations
- Track SIM status and last communication
- Associate SIMs with stations
- Monitor connectivity issues

**User Management**
- Create, edit, and delete users
- Assign station access permissions
- View user-station relationships
- Role-based access control

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables** (Optional)
   
   For Google Maps integration, you can add your API key in the Vars section of the v0 in-chat sidebar, or create a `.env.local` file:
   
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
   
   **Note**: The Google Maps API key is intentionally a public environment variable (prefixed with `NEXT_PUBLIC_`) as it's designed to be used in the browser. You should restrict your API key in the Google Cloud Console to only allow requests from your domain and limit it to the Maps JavaScript API.
   
   The app will work without the API key, but map functionality will be limited.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **User Account**: username=`user1`, password=`user1`
- **Admin Account**: username=`admin`, password=`admin`

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with auth provider
│   ├── page.tsx                 # Root page (redirects to login)
│   ├── login/                   # Login page
│   ├── dashboard/               # Main dashboard
│   ├── stations/                # Station detail pages
│   ├── map/                     # Map view
│   ├── comparison/              # Station comparison
│   ├── activities/              # Plot activity management
│   ├── sim-management/          # SIM card management (Admin)
│   └── user-management/         # User management (Admin)
├── components/
│   ├── layout/                  # Layout components (sidebar, header)
│   ├── ui/                      # shadcn/ui components
│   └── [feature-specific]/      # Feature-specific components
├── contexts/
│   └── auth-context.tsx         # Authentication context
├── lib/
│   ├── mock-data.ts            # Mock data for development
│   └── utils/                   # Utility functions (date, export, etc.)
├── types/
│   └── index.ts                # TypeScript type definitions
└── README.md                    # This file
```

## API Integration (Production)

This UI is designed to consume APIs from two servers:

### Server 1 - Sensor Data
- GET `/api/stations` - List of stations
- GET `/api/stations/:id/weather-data` - Weather data with time range
- GET `/api/stations/:id/soil-data` - Soil moisture data
- GET `/api/stations/:id/images` - Station images
- GET `/api/weather-forecast` - External weather API data

### Server 2 - User Management
- POST `/api/auth/login` - User authentication
- GET `/api/users` - List users (Admin)
- POST `/api/users` - Create user (Admin)
- PUT `/api/users/:id` - Update user (Admin)
- DELETE `/api/users/:id` - Delete user (Admin)
- GET `/api/permissions` - User-station permissions
- GET `/api/sim-cards` - SIM card list (Admin)
- PUT `/api/sim-cards/:id` - Update SIM card (Admin)

### Next Steps for Backend Integration

1. Create API service modules in `lib/services/`
2. Replace mock data imports with API calls
3. Implement proper error handling
4. Add loading states with SWR or React Query
5. Set up environment variables for API endpoints
6. Implement proper authentication tokens/sessions
7. Add real-time updates via WebSockets (optional)

## Data Export

All major data views include CSV export functionality as required:
- Station sensor data
- Historical analytics
- Plot activities
- User lists (Admin)
- SIM card records (Admin)

## Environment Variables

### Required for Production

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key (client-side)
  - Get your key from [Google Cloud Console](https://console.cloud.google.com/)
  - Enable the Maps JavaScript API
  - Restrict the key to your domain and the Maps JavaScript API only
  - This is a public key meant to be exposed to the client

### Optional/Future

- `API_SERVER_1_URL` - Base URL for sensor data API
- `API_SERVER_2_URL` - Base URL for user management API
- `API_SECRET_KEY` - Secret key for API authentication (server-side only)

**Security Note**: Only environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep sensitive keys (database credentials, API secrets) without this prefix so they remain server-side only.

## Code Quality

- Comprehensive comments explaining component purposes
- Clear function documentation
- Type-safe with TypeScript
- Modular component architecture
- Ready for Git version control

## Development Guidelines

### Adding New Features
1. Define types in `types/index.ts`
2. Add mock data in `lib/mock-data.ts`
3. Create components in appropriate directories
4. Update navigation in `components/layout/app-sidebar.tsx`

### Code Style
- Use functional components with hooks
- Implement proper TypeScript typing
- Add descriptive comments for complex logic
- Follow existing naming conventions

## Google Maps Setup

The map features use the Google Maps JavaScript API. To enable full functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Create an API key
5. **Important Security**: Restrict your API key:
   - Set HTTP referrer restrictions to your domain
   - Limit API key to "Maps JavaScript API" only
6. Add the key to your environment variables

The application will function without a Google Maps API key, but map features will show a placeholder message.

## License

This project was created for agricultural monitoring purposes.

## Support

For questions or issues, contact your system administrator or refer to the project documentation.
