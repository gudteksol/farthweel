# FARTWHEEL 💨

The Solana Wallet Gas Detector

## Deploy to Vercel

### 1. Push to GitHub

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

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **Deploy**

### 3. Add Upstash Redis (stores buy history)

1. Go to [vercel.com/marketplace](https://vercel.com/marketplace)
2. Search for **Upstash** and click on it
3. Click **"Add Integration"**
4. Create a new Redis database and connect it to your fartwheel project
5. Vercel will automatically add the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars

### 4. Redeploy

After adding Upstash, redeploy so the env vars take effect:

1. Go to your project's **Deployments** tab
2. Click **⋯** on the latest deployment → **Redeploy**

### 5. Custom Domain (optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update your DNS records as Vercel shows you

## Done!

Every visitor sees the full buy history. New buys trigger fart sounds in real-time.
