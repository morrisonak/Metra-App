# Railroad Crossing Inventory (RCI)

A full-stack web application for managing railroad crossing inventory data, built for Metra commuter rail operations. Features interactive maps, FRA GCIS API integration, field data collection, and comprehensive reporting.

## Features

- **Dashboard** - Overview of crossing inventory with key metrics and charts
- **Crossing Management** - Full CRUD for railroad crossing records with detailed views
- **Interactive Map** - Mapbox GL-powered map with crossing markers, filtering, and popups
- **FRA Data Integration** - Query the FRA GCIS (Grade Crossing Inventory System) API to look up and import crossing data
- **Field Collection** - Mobile-friendly interface for on-site data collection
- **Reports** - Generate reports on crossing conditions, warning devices, and compliance
- **Admin Panel** - User management and application settings
- **Drag & Drop** - Sortable interfaces powered by dnd-kit

## Tech Stack

- **Framework**: [React Router v7](https://reactrouter.com/) (SSR)
- **Database**: [Neon](https://neon.tech/) (serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
- **Maps**: [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs)
- **Charts**: [Recharts](https://recharts.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **External API**: [FRA GCIS Public API](https://safetydata.fra.dot.gov/MasterWebService/PublicApi)
- **Validation**: [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech/) database (or any Postgres)
- A [Mapbox](https://www.mapbox.com/) access token
- An [FRA API token](https://safetydata.fra.dot.gov/MasterWebService/PublicApi)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@host/database
VITE_MAPBOX_TOKEN=your_mapbox_access_token
VITE_FRA_API_TOKEN=your_fra_api_token
```

### Database Setup

Push the schema to your database:

```bash
npx drizzle-kit push
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  routes/
    _index.tsx          # Dashboard
    crossings/          # Crossing CRUD routes
    map.tsx             # Interactive map view
    fra.tsx             # FRA GCIS API browser
    field-collection.tsx# Field data collection
    reports.tsx         # Reporting
    sync.tsx            # Data sync
    admin/              # Admin settings & users
  components/
    crossingMap.tsx     # Mapbox map component
    app-sidebar.tsx     # Navigation sidebar
    ui/                 # shadcn/ui components
  lib/
    db.ts               # Database connection
```

## License

MIT
