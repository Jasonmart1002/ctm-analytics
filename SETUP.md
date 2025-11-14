# Quick Setup Guide

## Step 1: Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Clerk credentials at [dashboard.clerk.com](https://dashboard.clerk.com):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. Set up your PostgreSQL database and add the connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ctm_analytics"
   ```

4. (Optional) Add OpenAI API key for AI Assistant:
   ```
   OPENAI_API_KEY=sk-...
   ```

## Step 2: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

## Step 3: Clerk Configuration

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Enable Organizations:
   - Settings → Organizations → Enable Organizations
4. Set up user roles:
   - Settings → User & Authentication → Metadata
   - Add public metadata field: `role`
   - Type: Select
   - Options: `admin`, `ceo`, `cmo`, `manager`, `viewer`

## Step 4: Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 5: Create Your First User

1. Click "Sign Up" on the homepage
2. Create your account
3. After signing in, you'll need to set your role in Clerk Dashboard:
   - Go to Clerk Dashboard → Users
   - Click on your user
   - Under "Public metadata", add: `{"role": "admin"}`
   - Create or join an organization

## Troubleshooting

### "Organization required" error
- Make sure you've enabled Organizations in Clerk
- Create or join an organization in the app

### Database connection error
- Verify your DATABASE_URL is correct
- Make sure PostgreSQL is running
- Check that the database exists

### Role permissions not working
- Verify you've set the `role` in your user's public metadata in Clerk Dashboard
- Valid roles: admin, ceo, cmo, manager, viewer

## Next Steps

- Upload your CTM CSV data (Admin role required)
- Explore the dashboard
- Invite team members with appropriate roles
