# CTM Analytics Dashboard

A modern analytics dashboard for visualizing CallTrackingMetrics data. Upload your CTM data via CSV and explore interactive dashboards with real-time insights.

## What This Is

A Next.js web application that:
- Imports CallTrackingMetrics data via CSV upload
- Displays comprehensive analytics across 4 dashboards (Overview, Marketing, Admissions, Executive)
- Provides interactive charts, tables, and filters
- Supports multiple organizations with role-based access control

## Current Status

**✅ Working Features:**
- CSV data upload with full CTM field support (100+ columns)
- Dashboard with 4 tabs showing real data from your database
- Interactive charts and visualizations (Recharts)
- Date range filtering across all metrics
- Multi-tenant organization support
- Role-based access control (Admin, CEO, CMO, Manager, Viewer)
- Call detail views and drilldowns

**🚧 Coming Next:**
- AI chatbot for natural language data queries
- Export functionality (CSV, PDF reports)
- Enhanced settings page

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: Clerk (with Organizations)
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Data Processing**: PapaParse for CSV handling

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (PostgreSQL)
DATABASE_URL=postgresql://...
```

### 3. Configure Clerk

1. Create account at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create new application named "CTM Analytics"
3. Copy your Publishable Key and Secret Key to `.env.local`
4. Enable Organizations:
   - Settings → Organizations → Toggle ON
5. Set up user roles:
   - Settings → User & Authentication → Metadata
   - Add public metadata property: `role`
   - Type: Select
   - Options: `admin`, `ceo`, `cmo`, `manager`, `viewer`

### 4. Set Up Database

**Option A: Use Neon (Recommended)**
1. Create free account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL` in `.env.local`

**Option B: Local PostgreSQL**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/ctm_analytics"
```

**Initialize Database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Your First User

1. Click "Sign Up" and create an account
2. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Users
3. Click on your user → Public metadata → Edit
4. Add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save and refresh your app
6. Create/join an organization when prompted

## Using the Dashboard

### Upload CTM Data

1. Navigate to **Upload Data** in the sidebar (Admin role required)
2. Drag and drop your CSV file or click to browse
3. Upload progress will show in real-time
4. Data is automatically parsed and stored in your database

**CSV Format**: Export your CallTrackingMetrics data with any/all columns. The system auto-maps 100+ CTM fields including:
- Call details (duration, status, direction)
- Customer info (name, phone, email)
- Marketing data (campaign, source, medium, keywords)
- Agent metrics (CSR name, score, conversion, value)
- Location data (city, state, country, IP)
- Technical data (browser, device, recordings, transcription)

### View Analytics

The main dashboard has 4 tabs:

1. **Overview** - Key metrics, call volume trends, status breakdown, channel mix
2. **Marketing** - Campaign performance, source analysis, keyword tracking
3. **Admissions** - Agent performance, quality scores, conversion funnel
4. **Executive** - Revenue analysis, trends, performance summary

All tabs support:
- Date range filtering (last 7/30/90 days or custom range)
- Interactive charts (click to drill down)
- Real-time calculations from your data
- Call detail views

## User Roles & Permissions

| Feature | Admin | CEO | CMO | Manager | Viewer |
|---------|-------|-----|-----|---------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Data | ✅ | ❌ | ❌ | ❌ | ❌ |
| All Tabs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

## Database Schema

### Main Models

**Call** - Stores all CTM call records (100+ fields)
- Customer info, call details, marketing attribution
- Agent metrics, location data, recordings
- Indexed by: organizationId, date, callId, campaign, source, csrName

**Organization** - Multi-tenant isolation
- Each org has separate data

**User** - Synced with Clerk
- Linked to organization, has role

**Agent** - CSR/Agent tracking
- Performance metrics calculated from calls

**DailyMetric** - Pre-aggregated analytics (optional, for performance)

## Development

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm start               # Run production

# Database
npx prisma studio       # Open database GUI
npx prisma generate     # Regenerate Prisma client
npx prisma migrate dev  # Create migration
npx prisma db push      # Push schema (dev only)

# Deployment
vercel                  # Deploy to Vercel
```

### Project Structure

```
app/
├── (auth)/                  # Sign-in/sign-up pages
├── (dashboard)/             # Protected dashboard routes
│   └── dashboard/
│       ├── page.tsx        # Main dashboard (4 tabs)
│       └── settings/       # Settings page
└── api/
    └── upload-csv/         # CSV upload endpoint

components/
├── dashboard/              # 30+ dashboard components
│   ├── tabs/              # 4 tab components
│   ├── *-chart.tsx        # Chart components
│   ├── calls-table.tsx    # Data tables
│   └── csv-upload.tsx     # Upload UI
└── ui/                     # shadcn/ui base components

lib/
├── queries/               # Database query functions
│   ├── overview-calculations.ts
│   ├── marketing-calculations.ts
│   ├── admissions-calculations.ts
│   └── executive-calculations.ts
├── auth.ts               # Authentication & RBAC
├── db.ts                 # Prisma client
└── csv-parser.ts         # CSV parsing logic

prisma/
└── schema.prisma         # Database schema
```

## Troubleshooting

**"Organization required" error**
→ Create or join an organization in the app (use organization switcher in top-left)

**"Missing publishableKey" error**
→ Check `.env.local` has Clerk keys (not in `.env.example`)

**Can't see Upload Data page**
→ Set your role to `admin` in Clerk Dashboard → Users → [Your User] → Public metadata

**Database connection error**
→ Verify `DATABASE_URL` is correct and database is running

**Build errors**
→ Run `npx prisma generate` first

**No data showing in dashboard**
→ Upload a CSV file first via Upload Data page

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the development plan.

**Current Phase**: Dashboard Complete (90%) ✅
**Next Phase**: AI Chatbot Integration 🚧
**Future**: Export & Advanced Features 📅

## License

MIT
