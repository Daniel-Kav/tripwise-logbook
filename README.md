# TripWise Logbook

A modern Electronic Logging Device (ELD) application for commercial drivers, helping manage Hours of Service (HOS) compliance and trip planning.

## Features

### Route Planning
- Real-time route calculation using OpenStreetMap
- Automatic distance and time calculations
- Required stop planning (fuel, rest breaks)
- HOS compliance validation
- Multi-day trip support

### ELD Log Management
- Interactive 24-hour log grid
- Real-time HOS compliance checking
- Support for all duty statuses:
  - Driving
  - On-Duty (Not Driving)
  - Off-Duty
  - Sleeper Berth
- Automatic break scheduling
- Manual log entry and editing

### FMCSA Compliance
- 11-hour driving limit enforcement
- 14-hour on-duty window tracking
- 30-minute break requirement
- 10-hour off-duty period
- 60/70-hour limit monitoring

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- django 5.1

### Installation

1. Clone the repository:
```bash
git clone https://github.com/daniel-kav/tripwise-logbook.git
cd tripwise-logbook
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
tripwise-logbook/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API and external service integrations
│   ├── utils/             # Utility functions and constants
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json
```

## Key Components

### LogSheet
- Interactive 24-hour log grid
- Real-time HOS compliance checking
- Manual entry and editing
- Status change validation

### MapView
- Route visualization
- Stop location mapping
- Distance and time calculations
- Interactive markers

### TripPlanner
- Route planning interface
- HOS compliance validation
- Stop scheduling
- Multi-day trip support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the documentation
2. Open an issue
