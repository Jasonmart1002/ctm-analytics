# Database Setup Guide - Neon (Recommended)

## Step 1: Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign up" (can use GitHub)
3. Verify your email

## Step 2: Create Database
1. Click "Create Project"
2. Project name: "CTM Analytics"
3. Region: Choose closest to you (US East, Europe, etc.)
4. PostgreSQL version: 15 (default)
5. Click "Create Project"

## Step 3: Get Connection String
1. After creation, you'll see a connection string
2. Click "Copy" next to the connection string
3. It looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 4: Add to Your Project
1. Open `.env.local` in your code editor
2. Find the line: `DATABASE_URL="postgresql://..."`
3. Replace with your Neon connection string:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. Save the file

## Step 5: Initialize Database
Run these commands in your terminal:

```bash
cd /Users/jason/ctm-analytics

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

You should see output like:
```
✔ Generated Prisma Client
✔ Applied 1 migration
```

## Step 6: Verify Setup
Optional - View your database in Prisma Studio:
```bash
npx prisma studio
```

This opens a browser-based GUI to see your tables!

## 🎉 Done!
Your database is ready. Now run:
```bash
npm run dev
```

---

## Alternative: Supabase Setup

If you prefer Supabase:

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to provision (~2 minutes)
4. Go to Settings → Database
5. Copy "Connection string" (URI format)
6. Replace `[YOUR-PASSWORD]` with your actual password
7. Add to `.env.local`

---

## Local PostgreSQL (Mac)

If you want to develop locally:

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ctm_analytics

# Add to .env.local
DATABASE_URL="postgresql://postgres:@localhost:5432/ctm_analytics"
```

---

## Troubleshooting

### "Connection refused"
→ Database might be sleeping (Neon). Wait 10 seconds and try again.

### "SSL required"
→ Make sure your connection string ends with `?sslmode=require`

### "Database does not exist"
→ Run `npx prisma migrate dev --name init` to create tables

### "Authentication failed"
→ Double-check your connection string is correct
