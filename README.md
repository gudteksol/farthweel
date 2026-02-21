# FARTWHEEL 

The Solana Wallet Gas Detector — tracks buys from a wallet and plays fart sounds scaled to buy size.

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "fartwheel"
```

Create a repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/fartwheel.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **Deploy** — wait for it to build

### Step 3: Add Vercel KV (database)

This is what stores buy history so all visitors can see it.

1. In your Vercel dashboard, go to your **fartwheel** project
2. Click the **"Storage"** tab
3. Click **"Create Database"** → choose **KV** (Redis)
4. Name it whatever (e.g. `fartwheel-kv`)
5. Click **"Connect to Project"** and select your fartwheel project
6. Hit **Create**

Vercel automatically adds the environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.)

### Step 4: Redeploy

After connecting KV, redeploy so the env vars take effect:

1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on your latest deployment
3. Click **"Redeploy"**

### Step 5: Custom Domain (optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update your DNS (Vercel will show you the records to add)

## Done!

Your site is live. Every visitor sees the full buy history, and new buys trigger fart sounds in real-time.
