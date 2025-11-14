# CTM Analytics Dashboard - Complete Project Plan

## 📊 Project Overview

A comprehensive call tracking metrics (CTM) analytics dashboard for CMOs and CEOs to analyze call performance, marketing attribution, and agent metrics.

**Current Location:** `/Users/jason/Documents/github/ctm-analytics/`

---

## ✅ COMPLETED: Phase 1 - Foundation (100%)

### Authentication & Authorization ✅
- **Clerk Integration**
  - Sign-in/sign-up pages with custom styling
  - Multi-tenant support via Organizations
  - User metadata for role storage
  - Protected routes via middleware
  - Session management

- **Role-Based Access Control (RBAC)**
  - 5 user roles: Admin, CEO, CMO, Manager, Viewer
  - Granular permissions system
  - Permission-based navigation rendering
  - API route protection
  
  **Roles & Permissions:**
  ```typescript
  Admin:   All access + data upload + user management
  CEO:     All dashboards + AI + export (no upload/settings)
  CMO:     Overview + Marketing + AI + export
  Manager: Overview + Agents only
  Viewer:  Overview only (read-only)
  ```

### Database Architecture ✅
- **Provider:** Neon PostgreSQL (serverless)
- **ORM:** Prisma
- **Connection:** Pooled connection configured
- **Migrations:** Initial migration applied

**Database Models:**
1. **User** - Synced with Clerk users
   - clerkId, email, firstName, lastName, role, organizationId
   
2. **Organization** - Multi-tenant isolation
   - clerkOrgId, name, accountId, subscriptionTier
   
3. **Call** - Main CTM data (100+ fields)
   - Basic info: callId, name, phone, email
   - Call details: duration, ringTime, talkTime, status
   - Marketing: campaign, source, medium, keyword, ads data
   - Location: city, state, country, IP
   - Agent: csrName, csrCallScore, csrConversion, csrValue
   - Technical: browser, device, recordings, transcription
   - Extended lookup: demographics, social profiles
   
4. **Agent** - CSR/Agent tracking
   - name, email, organizationId, active status
   
5. **DailyMetric** - Pre-aggregated analytics
   - Dimensions: date, campaign, source, medium, csrName, state
   - Metrics: totalCalls, conversions, totalValue, avgCallScore

**Indexes:** Optimized for queries on organizationId, date, callId, campaign, source, csrName

### Application Structure ✅
- **Framework:** Next.js 14+ (App Router, React Server Components)
- **Language:** TypeScript (full type safety)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (13 components installed)

**Project Structure:**
```
app/
├── (auth)/                    # Public routes
│   ├── sign-in/              # Clerk sign-in
│   └── sign-up/              # Clerk sign-up
├── (dashboard)/              # Protected routes
│   ├── layout.tsx            # Dashboard layout with sidebar
│   └── dashboard/
│       ├── page.tsx          # Overview dashboard
│       ├── marketing/        # Marketing analytics
│       ├── agents/           # Agent performance
│       ├── calls/            # Call details table
│       ├── ai-assistant/     # AI chat interface
│       └── upload/           # CSV upload ✅
├── api/
│   ├── upload-csv/           # CSV upload endpoint ✅
│   └── webhooks/clerk/       # User sync webhook (placeholder)
└── layout.tsx                # Root layout with ClerkProvider

components/
├── ui/                       # shadcn/ui base components
├── layout/
│   ├── sidebar.tsx          # Nav with role-based filtering
│   └── header.tsx           # User menu + org switcher
└── dashboard/
    ├── kpi-card.tsx         # Metric cards with trends
    └── csv-upload.tsx       # Drag & drop upload ✅

lib/
├── auth.ts                  # Auth utilities & RBAC
├── db.ts                    # Prisma client singleton
├── navigation.ts            # Nav config with permissions
├── csv-parser.ts            # CSV parsing logic ✅
└── utils.ts                 # Utility functions

prisma/
├── schema.prisma            # Database schema
└── migrations/              # Migration history

types/
└── call.ts                  # Call types & CSV mapping
```

### UI/UX ✅
- **Responsive Layout**
  - Sidebar navigation with active states
  - Header with org switcher + user menu
  - Role-based menu filtering
  - Mobile-responsive (Tailwind breakpoints)

- **Design System**
  - Tailwind CSS v4
  - shadcn/ui components (customizable)
  - Professional color palette
  - Consistent spacing and typography

- **Components Installed:**
  - Card, Button, Badge, Table
  - Input, Select, Dialog, Sheet
  - Tabs, Dropdown Menu, Avatar, Separator

### Documentation ✅
- README.md - Full project documentation
- SETUP_COMPLETE.md - Setup verification guide
- DATABASE_SETUP.md - Database configuration
- ENABLE_ORGANIZATIONS.md - Clerk org setup
- FIXED_ORG_ERROR.md - Organization troubleshooting
- NEW_LOCATION.md - Project location info

---

## ✅ COMPLETED: Phase 2 - CSV Upload & Data Pipeline (100%)

### CSV Upload UI ✅
**File:** `components/dashboard/csv-upload.tsx`

**Features:**
- Drag & drop file upload (react-dropzone)
- Multiple file support
- File validation (CSV only, max 100MB)
- Real-time progress tracking
- Status indicators: pending, uploading, processing, success, error
- Row count display
- Error reporting with detailed messages
- Remove files before upload
- Visual feedback during drag

**Upload Flow:**
1. User drags/selects CSV file
2. File added to queue (pending state)
3. User clicks "Upload"
4. File sent to API endpoint
5. Progress bar shows upload
6. Success/error message displayed
7. Option to view data or upload more

### CSV Parser ✅
**File:** `lib/csv-parser.ts`

**Features:**
- Parses 100+ CTM columns
- Smart data type conversion:
  - Duration parsing (HH:MM:SS → seconds)
  - Date parsing (multiple formats)
  - Boolean parsing (true/yes/1)
  - Number parsing (float/int)
  - Array parsing (comma-separated tags)
  - JSON parsing (custom fields)
- Row-by-row validation
- Error tracking with row numbers
- Skips invalid rows (continues processing)
- Returns detailed parse results

**Field Mapping:**
- Customer info: name, email, phone, demographics
- Call details: duration, status, direction, likelihood
- Location: address, city, state, postal, country, IP
- Marketing: campaign, source, medium, keyword, search query
- Ads: Google/MS Click IDs, ad details, creative IDs
- Agent: CSR name, score, conversion, value
- Technical: browser, device, mobile, recordings
- Extended lookup: age, education, income, social profiles

### API Upload Endpoint ✅
**File:** `app/api/upload-csv/route.ts`

**Features:**
- POST endpoint at `/api/upload-csv`
- Authentication via Clerk (requires userId)
- Organization isolation (multi-tenant)
- File validation (CSV format)
- CSV parsing with error handling
- Database upsert (create or update by callId)
- Duplicate handling (updates existing records)
- Batch processing (all rows in single transaction)
- Comprehensive error reporting
- Returns: rowsProcessed, errors, parseErrors

**Security:**
- Requires authentication
- Organization-scoped data
- File size validation
- Type validation

### Database Integration ✅
- Auto-creates organization if doesn't exist
- Upserts call records (prevents duplicates)
- Maps all 100+ parsed fields to database
- Handles optional fields gracefully
- Transaction safety (all or nothing per call)
- Proper type conversions (Decimal for currency, etc.)

### Sample Data ✅
**File:** `public/sample-ctm-data.csv`

**Includes:**
- 2 sample call records
- Google Ads and Facebook Ads sources
- Complete CTM data (all major fields)
- Different CSRs, durations, values
- Ready for testing

**Sample Calls:**
1. John Doe - Google Ads - 5:23 duration - $250 value
2. Jane Smith - Facebook Ads - 8:15 duration - $180 value

---

## 🚧 IN PROGRESS: Phase 3 - Data Visualization (0%)

### Overview Dashboard
**Goal:** Display real metrics from database with interactive charts

**Components Needed:**
- [ ] Real KPI calculations
  - [ ] Fetch call data from database
  - [ ] Calculate: total calls, conversion rate, avg duration, total value
  - [ ] Calculate trends (compare to previous period)
  - [ ] Update KPICard component with real data

- [ ] Call Volume Chart
  - [ ] Install/configure Recharts
  - [ ] Create time series data query
  - [ ] Line or area chart showing calls over time
  - [ ] Date range selector (last 7/30/90 days)
  - [ ] Drill down by source/campaign

- [ ] Source Distribution
  - [ ] Pie chart of calls by source
  - [ ] Calculate percentages
  - [ ] Color coding by source
  - [ ] Click to filter

- [ ] Geographic Heatmap
  - [ ] Calls by state/city
  - [ ] US map visualization
  - [ ] Color intensity by volume
  - [ ] Tooltip with details

- [ ] Peak Hours Heatmap
  - [ ] Grid: Days (rows) x Hours (columns)
  - [ ] Color intensity by call volume
  - [ ] Identify best times to staff

### Recent Calls Table
- [ ] Data table component (TanStack Table)
- [ ] Columns: Name, Date, Source, Status, Duration, CSR, Value
- [ ] Pagination (50 rows per page)
- [ ] Sorting (all columns)
- [ ] Filtering (search, status, source)
- [ ] Click row to see details
- [ ] Export to CSV

### Date Range Filtering
- [ ] Date picker component (shadcn/ui)
- [ ] Preset ranges: Today, Yesterday, Last 7/30/90 days, This Month
- [ ] Custom range selection
- [ ] Apply to all dashboard components
- [ ] Store in URL params (shareable links)

**Files to Create:**
```
components/dashboard/
├── call-volume-chart.tsx
├── source-pie-chart.tsx
├── geographic-heatmap.tsx
├── peak-hours-heatmap.tsx
├── calls-table.tsx
└── date-range-picker.tsx

lib/queries/
├── dashboard-metrics.ts    # KPI calculations
├── call-volume.ts          # Time series data
└── call-list.ts            # Table data with filters

hooks/
├── use-dashboard-data.ts   # React Query hook
└── use-date-range.ts       # Date range state
```

---

## 📅 PLANNED: Phase 4 - Marketing Analytics (0%)

### Marketing Dashboard Page
**Goal:** Deep dive into campaign performance and attribution

**Components:**
- [ ] Campaign Performance Table
  - Columns: Campaign, Calls, Conversions, Value, ROI, Source, Medium
  - Expandable rows (show keywords/ads)
  - Sort by any metric
  - Export functionality

- [ ] Source/Medium Funnel
  - Funnel chart showing: Traffic → Calls → Conversions → Value
  - Compare sources side-by-side
  - Conversion rate at each stage

- [ ] Top Keywords Performance
  - Table with search queries
  - Metrics: Calls, Conv%, Avg Value
  - Filter by match type (exact/broad/phrase)

- [ ] Ad Performance
  - Ad creative breakdown
  - Metrics by ad_group, creative_id, ad_content
  - Click ID tracking (GCLID, MSCLID)

- [ ] Landing Page Performance
  - Referral page and Last URL analysis
  - Conversion rates by page
  - Identify best/worst performing pages

- [ ] Device/Browser Breakdown
  - Pie charts for device and browser
  - Mobile vs Desktop performance
  - Conversion differences

**API Routes Needed:**
```
app/api/
├── marketing/
│   ├── campaigns/route.ts       # Campaign metrics
│   ├── keywords/route.ts        # Keyword performance
│   ├── ads/route.ts            # Ad metrics
│   └── landing-pages/route.ts  # Page performance
```

---

## 📅 PLANNED: Phase 5 - Agent Performance (0%)

### Agent Dashboard Page
**Goal:** Track individual and team CSR performance

**Components:**
- [ ] Top Performers Leaderboard
  - Rank by: Calls, Conv%, Avg Score, Total Value
  - Profile photos (from Clerk if available)
  - Time period selector
  - Top 10 with podium display

- [ ] Agent Comparison (Radar Chart)
  - Multiple agents selected
  - Metrics: Calls, Conv%, Score, Value, Talk Time
  - Visual comparison

- [ ] Call Distribution Chart
  - Bar chart: Calls per agent
  - Show if distribution is fair
  - Identify overload/underutilization

- [ ] Individual Agent Metrics
  - Dropdown to select agent
  - Detail cards: Total calls, Conv%, Avg score, Total value
  - Trend line (last 30 days)
  - Call history table

- [ ] Agent Activity Timeline
  - Calls over time for selected agent
  - Peak hours/days
  - Performance trends

**Database Queries:**
```typescript
// Get agent stats
- Total calls per agent
- Conversion rate per agent
- Average call score per agent
- Total value generated per agent
- Average talk time per agent
- Calls by time of day per agent
```

---

## 📅 PLANNED: Phase 6 - Call Details & Search (0%)

### Calls Page Enhancement
**Goal:** Advanced call search and detail view

**Features:**
- [ ] Advanced Filters
  - Date range
  - Call status (answered/missed/voicemail)
  - Source/Medium/Campaign
  - CSR/Agent
  - Duration range
  - Value range
  - Location (city/state)
  - Likelihood score

- [ ] Bulk Actions
  - Select multiple calls
  - Bulk export
  - Bulk tag/note
  - Bulk delete

- [ ] Call Detail Modal
  - Full call information
  - Audio player (if recordings available)
  - Transcription viewer
  - Edit notes/tags
  - Customer history

- [ ] Audio Transcription Display
  - Show transcription with timestamps
  - Keyword highlighting
  - Sentiment indicators
  - Keyword spotting results

---

## 📅 PLANNED: Phase 7 - AI Assistant (0%)

### AI Chat Interface
**Goal:** Natural language queries about call data

**Features:**
- [ ] Chat UI Component
  - Message history
  - Typing indicator
  - Code/chart rendering in responses
  - Copy/export responses

- [ ] OpenAI/Anthropic Integration
  - Function calling for data queries
  - SQL generation from natural language
  - Context awareness

- [ ] Suggested Questions
  - "What's my conversion rate this month?"
  - "Show top performing campaigns"
  - "Which agent has best conversion rate?"
  - "Calls from California last week"

- [ ] Response Types
  - Text explanations
  - Generated charts
  - Data tables
  - SQL queries (for debugging)
  - Export to CSV

**Technical Implementation:**
```typescript
// API Route
app/api/ai/chat/route.ts

// Functions the AI can call
- getCallMetrics(filters)
- getCampaignPerformance(dateRange)
- getAgentStats(agentName)
- searchCalls(query)
- generateChart(data, chartType)
```

---

## 📅 PLANNED: Phase 8 - Advanced Features (0%)

### Real-Time Features
- [ ] WebSocket integration
- [ ] Live call notifications
- [ ] Real-time dashboard updates
- [ ] Live agent status

### Scheduled Reports
- [ ] Email report builder
- [ ] Schedule: Daily/Weekly/Monthly
- [ ] Custom metrics selection
- [ ] PDF/CSV attachments
- [ ] Distribution lists

### Webhook Integrations
- [ ] Clerk user sync (currently placeholder)
- [ ] Salesforce integration
- [ ] Slack notifications
- [ ] Zapier webhooks
- [ ] Custom webhook endpoints

### Data Export
- [ ] CSV export (calls, metrics)
- [ ] Excel export with formatting
- [ ] PDF reports with charts
- [ ] Scheduled exports

### Advanced Analytics
- [ ] Predictive analytics (call volume forecasting)
- [ ] Anomaly detection
- [ ] A/B test analysis (experiments/variations)
- [ ] Attribution modeling
- [ ] Customer journey tracking

### Settings & Configuration
- [ ] User management UI
- [ ] Role assignment interface
- [ ] Organization settings
- [ ] Data retention policies
- [ ] Custom field mapping
- [ ] Notification preferences

---

## 🛠️ Technical Debt & Improvements

### Performance Optimization
- [ ] Implement Redis caching for metrics
- [ ] Add database connection pooling monitoring
- [ ] Optimize large CSV uploads (streaming)
- [ ] Add background job queue (Bull/BullMQ)
- [ ] Implement incremental static regeneration (ISR)

### Testing
- [ ] Unit tests (Jest/Vitest)
- [ ] Integration tests (API routes)
- [ ] E2E tests (Playwright/Cypress)
- [ ] CSV parser tests
- [ ] Auth flow tests

### Error Handling
- [ ] Global error boundary
- [ ] Error logging service (Sentry)
- [ ] User-friendly error messages
- [ ] Retry logic for failed uploads

### Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast compliance

### Mobile Optimization
- [ ] Touch-optimized charts
- [ ] Mobile navigation drawer
- [ ] Simplified mobile dashboards
- [ ] PWA capabilities

---

## 📦 Dependencies Installed

### Core
- next@16.0.1
- react@18.x
- react-dom@18.x
- typescript@5.x

### Authentication
- @clerk/nextjs@6.35.0

### Database
- @prisma/client
- prisma

### UI & Styling
- tailwindcss@4.x
- tailwindcss/postcss
- lucide-react (icons)
- shadcn/ui components (via CLI)

### Data Handling
- papaparse (CSV parsing)
- @types/papaparse
- react-dropzone (file upload)

### State & Data Fetching
- @tanstack/react-query
- @tanstack/react-table
- zod (validation)
- react-hook-form
- @hookform/resolvers

### Charts (Installed, not yet used)
- recharts
- date-fns

### AI (Installed, not yet used)
- ai (Vercel AI SDK)
- openai

---

## 🔐 Environment Configuration

### Current Setup (.env.local)
```bash
# Clerk (Configured ✅)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=(not set)

# Database (Configured ✅)
DATABASE_URL=postgresql://neondb_owner:***@ep-weathered-silence-aexrq0wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# OpenAI (Not configured)
OPENAI_API_KEY=(empty)

# Redis (Not configured)
REDIS_URL=(empty)
```

### Clerk Setup Status
- ✅ Application created
- ✅ Keys configured
- ✅ Organizations enabled
- ✅ User metadata configured (role field)
- ⚠️ Webhooks not configured (optional)

### Database Setup Status
- ✅ Neon PostgreSQL provisioned
- ✅ Connection string configured
- ✅ Prisma schema defined
- ✅ Initial migration applied
- ✅ Tables created (User, Organization, Call, Agent, DailyMetric)

---

## 📋 Getting Started / How to Continue

### Current State
- Server: Stopped (start with `npm run dev`)
- Location: `/Users/jason/Documents/github/ctm-analytics/`
- Database: Connected and ready
- Auth: Clerk configured
- CSV Upload: Fully functional

### Next Session Workflow

1. **Start Development Server**
   ```bash
   cd ~/Documents/github/ctm-analytics
   npm run dev
   ```

2. **Sign In & Test Upload**
   - Go to http://localhost:3000
   - Sign in with your account
   - Verify role is "admin" in Clerk Dashboard
   - Go to /dashboard/upload
   - Test CSV upload with sample file

3. **Begin Phase 3 (Data Visualization)**
   - Install additional chart dependencies if needed
   - Create dashboard metrics query functions
   - Implement call volume chart
   - Add real KPI calculations
   - Build data tables

### Quick Commands Reference
```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm start               # Run production server

# Database
npx prisma studio       # Open database GUI
npx prisma generate     # Regenerate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma db push      # Push schema changes (dev only)

# Git
git status             # Check changes
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push               # Push to remote

# Testing
npm test               # Run tests (when implemented)
```

---

## 🎯 Success Metrics by Phase

### Phase 1 Success Criteria ✅
- [x] User can sign up/sign in
- [x] User roles control page access
- [x] Dashboard layout is responsive
- [x] Database supports all CTM data
- [x] Multi-tenant data isolation works

### Phase 2 Success Criteria ✅
- [x] User can upload CSV files
- [x] CSV data is parsed correctly
- [x] Data is stored in database
- [x] Duplicate handling works
- [x] Upload errors are reported clearly

### Phase 3 Success Criteria (To Do)
- [ ] Real metrics displayed on dashboard
- [ ] Charts show actual data from database
- [ ] Date filtering works across all components
- [ ] Tables support pagination and sorting
- [ ] Performance is acceptable with 10k+ records

### Phase 4 Success Criteria (To Do)
- [ ] Marketing metrics calculated correctly
- [ ] Campaign ROI displayed accurately
- [ ] Keyword performance tracked
- [ ] Ad attribution working

### Phase 5 Success Criteria (To Do)
- [ ] Agent leaderboard displays correctly
- [ ] Individual agent metrics accurate
- [ ] Performance comparisons functional

---

## 💡 Key Design Decisions & Context

### Why Clerk?
- Best-in-class auth with Organizations built-in
- Excellent Next.js integration
- User management UI included
- Social login support
- Production-ready security

### Why Neon?
- Serverless PostgreSQL (auto-scale, auto-sleep)
- Great free tier
- Built by Vercel team (Next.js alignment)
- Connection pooling included
- Fast provisioning

### Why Prisma?
- Type-safe database access
- Excellent TypeScript support
- Migration management
- Query builder + raw SQL when needed
- Prisma Studio for debugging

### Why shadcn/ui?
- Owned components (full customization)
- Built on Radix UI (accessible)
- Tailwind-based (consistent with project)
- Copy/paste workflow (no dependency bloat)
- Beautiful defaults

### CSV Upload Architecture
- Client-side parsing (reduces server load)
- Streaming not needed yet (100MB max)
- Upsert strategy (idempotent, handles duplicates)
- No background jobs yet (add in Phase 8)

### Multi-Tenant Strategy
- Organization-scoped queries (WHERE organizationId)
- Clerk Organizations for team management
- Fallback to user-based for single-tenant
- Database-level isolation (not schema-based)

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No background job processing** - Large CSV uploads block the request
   - Solution: Add Bull/BullMQ in Phase 8

2. **No real-time updates** - Dashboard shows stale data until refresh
   - Solution: Add WebSockets or polling in Phase 8

3. **No data aggregation** - DailyMetric table populated but not used
   - Solution: Build aggregation job in Phase 3

4. **No CSV error recovery** - Failed rows are logged but not retryable
   - Solution: Add error table and retry mechanism

5. **No file size streaming** - 100MB CSV loaded into memory
   - Solution: Implement streaming parser if needed

6. **No rate limiting** - API endpoints unprotected from abuse
   - Solution: Add rate limiting middleware

7. **No caching** - Every request hits database
   - Solution: Add Redis caching in Phase 8

### Browser Compatibility
- Modern browsers only (ES2020+)
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 support

---

## 📞 Support & Resources

### Documentation Files
- **README.md** - Project overview and setup
- **SETUP_COMPLETE.md** - Post-setup verification
- **PHASE_2_COMPLETE.md** - CSV upload documentation
- **UPLOAD_TROUBLESHOOTING.md** - Upload page access issues
- **PROJECT_PLAN.md** - This file

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Recharts](https://recharts.org)

### APIs
- Clerk Dashboard: https://dashboard.clerk.com
- Neon Console: https://console.neon.tech
- Prisma Studio: `npx prisma studio`

---

## 🎉 Project Status Summary

**Overall Progress: 40%**

- ✅ Phase 1: Foundation - 100% Complete
- ✅ Phase 2: CSV Upload - 100% Complete
- 🚧 Phase 3: Data Visualization - 0% (Next Priority)
- 📅 Phase 4: Marketing Analytics - 0%
- 📅 Phase 5: Agent Performance - 0%
- 📅 Phase 6: Call Details - 0%
- 📅 Phase 7: AI Assistant - 0%
- 📅 Phase 8: Advanced Features - 0%

**Ready for Production:** No (needs Phase 3-5 minimum)
**Ready for Testing:** Yes (with sample data)
**Ready for Development:** Yes

---

## 🚀 Immediate Next Steps

When you're ready to continue:

1. **Start Phase 3: Data Visualization**
   - Fetch real data from database
   - Calculate KPIs with trends
   - Build call volume chart with Recharts
   - Create interactive data table
   - Add date range filtering

2. **Create these files next:**
   ```
   lib/queries/dashboard-metrics.ts
   components/dashboard/call-volume-chart.tsx
   components/dashboard/calls-table.tsx
   hooks/use-dashboard-data.ts
   ```

**Estimated Time for Phase 3:** 1-2 weeks

---

*Last Updated: November 12, 2024*
*Project Location: /Users/jason/Documents/github/ctm-analytics/*
*Developer: OpenCode AI*
