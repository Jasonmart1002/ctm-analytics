# 🚀 START HERE - CTM Analytics Quick Start

Welcome to your CTM Analytics dashboard! Follow these 3 simple steps to get started.

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (local or cloud)
- ⬜ Clerk account (we'll set this up)

---

## Step 1: Get Your Clerk Credentials (5 minutes)

1. Go to **[dashboard.clerk.com](https://dashboard.clerk.com)** and sign up
2. Click "**Add application**"
3. Name it "**CTM Analytics**"
4. Copy your **Publishable Key** and **Secret Key**
5. Open `.env.local` in your code editor
6. Paste your keys:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Enable Organizations in Clerk:
1. In Clerk Dashboard, go to **Settings → Organizations**
2. Toggle "**Enable Organizations**" ON
3. Save changes

### Set up User Roles:
1. Go to **Settings → User & Authentication → Metadata**
2. Click "**Add public metadata property**"
3. Name: `role`
4. Type: **Select**
5. Options: `admin`, `ceo`, `cmo`, `manager`, `viewer`
6. Save

---

## Step 2: Set Up Your Database (5 minutes)

### Option A: Local PostgreSQL
If you have PostgreSQL installed locally:
```bash
# In .env.local, set:
DATABASE_URL="postgresql://postgres:password@localhost:5432/ctm_analytics"
```

### Option B: Cloud Database (Recommended)
Use a free tier from:
- **Neon** (recommended): [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)

Get your connection string and add to `.env.local`:
```bash
DATABASE_URL="postgresql://..."
```

### Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## Step 3: Start the App (1 minute)

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎉 Create Your First User

1. Click "**Sign Up**" on the homepage
2. Enter your email and create a password
3. Sign in to your new account

### Set Your Role to Admin:
1. Go back to **[dashboard.clerk.com](https://dashboard.clerk.com)**
2. Click "**Users**" in the sidebar
3. Click on your newly created user
4. Scroll to "**Public metadata**"
5. Click "**Edit**"
6. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click "**Save**"

### Create/Join Organization:
1. Return to your app
2. Click the organization switcher in the top left
3. Click "**Create organization**"
4. Name it (e.g., "My Company")
5. You're now ready to use the dashboard!

---

## ✅ You're All Set!

Your CTM Analytics dashboard is now running. You should see:
- ✅ Overview dashboard with KPI cards
- ✅ Sidebar navigation (all options visible as admin)
- ✅ Empty state ready for data upload

---

## 🎯 What's Next?

### Immediate Next Steps:
1. **Explore the dashboard** - Check out all the pages
2. **Invite team members** - Use Clerk to add users
3. **Set their roles** - Assign appropriate permissions
4. **Upload CTM data** - Coming in Phase 2!

### Development Roadmap:
- **Now**: Set up and explore
- **Phase 2**: CSV upload and data import
- **Phase 3**: Charts and visualizations  
- **Phase 4**: AI Assistant
- **Phase 5**: Advanced features

---

## 📚 Important Files

- **README.md** - Full documentation
- **SETUP.md** - Detailed setup guide
- **CHECKLIST.md** - Development checklist
- **PROJECT_SUMMARY.md** - What's been built
- **.env.example** - Environment variable template

---

## 🆘 Troubleshooting

### "Organization required" error
→ Make sure you created/joined an organization in the app

### "Missing publishableKey" error
→ Check that your Clerk keys are in `.env.local` (not `.env.example`)

### Database connection error
→ Verify your `DATABASE_URL` is correct and database is running

### Can't see navigation items
→ Make sure you set your `role` to `admin` in Clerk Dashboard

### Build errors
→ Run `npx prisma generate` first, then try again

---

## 💬 Need Help?

- Check **README.md** for detailed documentation
- Review **SETUP.md** for step-by-step setup
- See **CHECKLIST.md** for development tasks

---

**You're ready to build an amazing analytics dashboard!** 🚀

Time to start: **~15 minutes**  
Difficulty: **Easy** (just follow the steps)
