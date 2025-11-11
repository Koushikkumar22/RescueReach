# RescueReach - Vercel Deployment Guide

This guide will help you deploy RescueReach to Vercel for production usage.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: You'll need to push your code to GitHub
3. **PostgreSQL Database**: The app uses PostgreSQL (Neon is recommended and free)

## Step 1: Prepare Your Database

### Option A: Use Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database`)
4. Save this for later - you'll need it for Vercel environment variables

### Option B: Use Vercel Postgres

1. In your Vercel dashboard, you can add Postgres directly
2. This will automatically set up the `DATABASE_URL` environment variable

## Step 2: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - RescueReach emergency app"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Create a new repository (e.g., `rescuereach-app`)
   - Don't initialize with README (your code already has one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rescuereach-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Add New Project"

2. **Import Your Repository**:
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Click "Import"

3. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist/client` (should auto-detect from vercel.json)
   - **Install Command**: `npm install` (should auto-detect)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? (press enter for default)
   - In which directory is your code located? **.**
   
4. **Add Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste your database connection string when prompted
   
   ```bash
   vercel env add NODE_ENV
   ```
   Enter: `production`

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Database Setup

After deployment, you need to set up your database schema:

1. **Install PostgreSQL client** (if not already installed)
   
2. **Run the database migration**:
   ```bash
   DATABASE_URL="your_connection_string" npm run db:push
   ```

   Or use the Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```

## Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Test the following features:
   - Map loads correctly with emergency services
   - Location tracking works
   - Incident reporting with photo upload
   - SOS alert activation
   - Emergency services dashboard

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Set to `production` | Yes |

## Troubleshooting

### Build Fails

- **Check logs**: In Vercel dashboard, go to your deployment and check the build logs
- **Verify package.json**: Ensure all dependencies are listed correctly
- **Node version**: Vercel uses Node 20 by default, which should work fine

### Database Connection Issues

- **Verify connection string**: Make sure your `DATABASE_URL` is correct
- **Check SSL settings**: Neon requires `?sslmode=require` at the end of the connection string
- **Network access**: Ensure your database allows connections from Vercel IPs (Neon allows all by default)

### Map/Location Not Working

- **Check HTTPS**: Geolocation API requires HTTPS (Vercel provides this automatically)
- **Browser permissions**: Ensure location permissions are granted in the browser

### Static Files Not Loading

- **Check build output**: Verify `dist/client` directory contains your built files
- **Verify vercel.json**: Ensure `outputDirectory` is set to `dist/client`

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS records as instructed by Vercel

## Continuous Deployment

Once set up, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a preview URL

## Monitoring

- **Analytics**: Enable in Vercel dashboard under "Analytics"
- **Logs**: View real-time logs in the "Logs" tab
- **Performance**: Check "Speed Insights" for performance metrics

## Support

For deployment issues:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- RescueReach Issues: Create an issue in your GitHub repository

---

**Your app is now live and helping people in emergencies! 🚨**
