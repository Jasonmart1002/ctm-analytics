# Get Your Neon PostgreSQL Connection String

The URL you provided is for the REST API, but we need the PostgreSQL connection string.

## Steps to Get the Correct URL:

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project (ep-weathered-silence-aexrq0wu)
3. Look for the "Connection Details" or "Connection String" section
4. Make sure you select **"Pooled connection"** (recommended for serverless)
5. The format should look like:
   ```
   postgresql://neondb_owner:PASSWORD@ep-weathered-silence-aexrq0wu-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Where to Find It:

In Neon Dashboard:
- Click on your project
- Go to "Dashboard" or "Connection Details"
- Look for "Connection string"
- Click "Copy" next to "Pooled connection"

## Once You Have It:

Replace the DATABASE_URL in your `.env.local` file with the correct connection string.

The password is included in the connection string Neon gives you.
