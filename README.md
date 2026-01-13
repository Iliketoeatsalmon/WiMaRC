# WiMaRC - Wireless Monitoring and Recording of Environment Conditions

ระบบตรวจวัดและจัดเก็บสภาวะแวดล้อมเชิงพื้นที่ด้วยเซนเซอร์บนเครือข่ายไร้สาย

## 📋 Project Overview

WiMaRC is a production-ready environmental monitoring system designed for agricultural applications, specifically durian cultivation. The system monitors weather conditions, soil moisture, and other environmental parameters using wireless sensor stations deployed across different geographic locations.

### Key Features

- **Real-time Monitoring**: Live sensor data from weather and soil monitoring stations
- **Role-Based Access Control (RBAC)**: Admin, User, and Guest roles with granular permissions
- **Historical Data Analysis**: View trends over 3, 7, 15, or 30-day periods
- **VPD Calculation**: Vapor Pressure Deficit calculation optimized for durian cultivation
- **Plot Activity Management**: Record and track agricultural activities with image attachments
- **Weather Forecasting**: Integration with external weather forecast data
- **Station Mapping**: Geographic visualization of all monitoring stations
- **Data Export**: CSV export functionality for all data types
- **SIM Payment Tracking**: Monitor payment due dates for station SIM cards

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Maps**: Google Maps integration (requires API key)
- **UI Components**: shadcn/ui component library

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Docker (for backend + PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wimarc
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐳 Docker (Frontend + Backend + PostgreSQL)

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Postgres: `localhost:5432` (DB: `wimarc`, User: `wimarc`, Password: `wimarc`)

The backend auto-creates tables and seeds the initial users/stations on first start.

## 📁 Folder Structure

```
wimarc/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Login page
│   ├── dashboard/         # Main dashboard
│   ├── historical/        # Historical data views
│   ├── activities/        # Plot activity management
│   ├── map/               # Station map view
│   └── admin/             # Admin pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components (nav, header)
├── data/                 # Mock/seed data
│   ├── mockUsers.ts      # User accounts
│   ├── mockStations.ts   # Station definitions
│   ├── mockSensorData.ts # Sensor readings
│   ├── mockActivities.ts # Plot activities
│   ├── mockSimPayments.ts # SIM payment records
│   └── mockForecasts.ts  # Weather forecasts
├── services/             # Mock API layer
│   ├── authService.ts    # Authentication
│   ├── stationsService.ts # Station data
│   ├── sensorService.ts  # Sensor readings
│   └── exportService.ts  # CSV export
├── types/                # TypeScript type definitions
│   └── index.ts          # All interfaces and types
├── utils/                # Utility functions
│   ├── permissions.ts    # RBAC logic
│   ├── dateUtils.ts      # Date formatting
│   └── chartUtils.ts     # Chart helpers
└── styles/               # Global styles
    └── globals.css       # Tailwind + custom CSS
```

## 👤 Demo Accounts

The system includes pre-configured demo accounts for each role:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full system access, can manage users and all stations

### User Account
- **Username**: `user1`
- **Password**: `user123`
- **Access**: Can view/edit data for stations: สวนทุเรียนบ้านสวนใหญ่, แปลงทดลองมหาวิทยาลัย

### Guest Account
- **Username**: `guest1`
- **Password**: `guest123`
- **Access**: Read-only access to: สวนทุเรียนบ้านสวนใหญ่

## 🔧 Replacing Mock Services with Real APIs

The application is structured to make API integration straightforward:

### 1. Authentication Service (`services/authService.ts`)

Replace the mock implementation with real API calls:

```typescript
export async function authenticateUser(username: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}
```

### 2. Sensor Data Service (`services/sensorService.ts`)

Connect to your real-time sensor data API:

```typescript
export async function getSensorReadings(stationId: string, timeRange: TimeRange) {
  const response = await fetch(
    `/api/sensors/${stationId}?days=${timeRange}`
  );
  return response.json();
}
```

### 3. Update Environment Variables

Create a `.env.local` file for API configuration:

```
NEXT_PUBLIC_API_URL=https://your-api.example.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here
```

### 4. Update Services

Each service file in the `/services` directory has clear comments indicating where to replace mock data with real API calls. The TypeScript interfaces in `/types/index.ts` define the expected data structures.

## 📱 Application Pages

1. **Login Page** (หน้าเข้าสู่ระบบ) - Authentication
2. **Dashboard** (ดูข้อมูลสภาวะแวดล้อม) - Real-time monitoring
3. **Historical Data** (ดูข้อมูลย้อนหลังของชุดอุปกรณ์) - Time-series analysis
4. **Daily Averages** (ดูข้อมูลค่าเฉลี่ยต่อวันย้อนหลัง) - Daily summaries
5. **Data Download** (ดาวน์โหลดข้อมูล) - CSV exports
6. **Plot Activities** (กิจกรรมแปลงเพาะปลูก) - Activity logging
7. **Station Map** (แผนที่จุดติดตั้งอุปกรณ์) - Geographic view
8. **Compare Stations** (เปรียบเทียบ 2 สถานี) - Comparative analysis
9. **System Status** (สถานะการทำงานของระบบ) - Admin only
10. **User Management** (จัดการผู้ใช้งานระบบ) - Admin only
11. **SIM Payment** (จัดการซิม) - Payment tracking

## 🔐 Security Notes

- **Passwords**: Currently stored in plain text for demo purposes. In production, use bcrypt or similar hashing
- **Sessions**: Implement JWT or secure session cookies
- **API Keys**: Store sensitive keys in environment variables
- **HTTPS**: Always use HTTPS in production
- **Input Validation**: Validate all user inputs on both client and server

## 📊 Data Models

All data models are defined in `/types/index.ts` with comprehensive TypeScript interfaces for:
- User, Station, SensorReading
- WeatherForecast, PlotActivity
- SimPaymentRecord, DailyAggregate

## 🤝 Contributing

See CONTRIBUTING.md for development guidelines and coding standards.

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🐛 Troubleshooting

### Google Maps not showing
- Ensure you have a valid Google Maps API key
- Add the key to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Data not loading
- Check browser console for errors
- Verify mock data files are present in `/data` directory
- Ensure services are returning properly formatted data

### Permission errors
- Verify you're logged in with the correct role
- Check `utils/permissions.ts` for access control logic
- Ensure station IDs match between user permissions and station data

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Refer to inline code comments for implementation details
