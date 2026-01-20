# Quick Setup Guide

## Step 1: Get Your Supabase Anon Key

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy your **anon/public** key

## Step 2: Update config.js

Open `config.js` and replace `YOUR_SUPABASE_ANON_KEY` with your actual anon key:

```javascript
const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
```

## Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `setup.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Enable Real-time (if needed)

1. Go to **Database** → **Replication** in Supabase dashboard
2. Make sure the `tasks` table has replication enabled
3. Or run this in SQL Editor if replication isn't enabled:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

## Step 5: Test the App

1. Open `index.html` in your browser
2. Try adding a task - it should work!

## Troubleshooting

- **"Please configure Supabase credentials"**: Make sure you added your ANON_KEY in config.js
- **"Failed to load tasks"**: Make sure you ran the setup.sql script
- **Real-time not working**: Check that replication is enabled for the tasks table

