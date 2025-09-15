# Database Setup Guide

## Issue Description

Your Hiwar application is currently showing these error messages:

**Console Errors:**
```
Supabase tables not found, loading demo data
Vocabulary table not found, loading demo data
```

**Network Errors (404):**
```
Failed to load resource: ezhiaqlhmeucndeznvig.supabase.co/rest/v1/hiwar
Failed to load resource: ezhiaqlhmeucndeznvig.supabase.co/rest/v1/vocabulary
Failed to load resource: vite.svg (Fixed ✅)
```

This happens because:
1. The required database tables (`hiwar` and `vocabulary`) haven't been created in your Supabase project yet
2. The missing vite.svg file has been restored

## Solution Options

### Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project: `ezhiaqlhmeucndeznvig`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration SQL**
   - Copy the entire content from `supabase/migrations/001_create_tables.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see `hiwar` and `vocabulary` tables

### Option 2: Using Supabase CLI (Alternative)

1. **Install Supabase CLI**
   ```bash
   # Using Scoop (Windows)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   
   # Or download from: https://github.com/supabase/cli/releases
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref ezhiaqlhmeucndeznvig
   ```

3. **Run Migrations**
   ```bash
   supabase db push
   ```

### Option 3: Continue with Demo Data (Temporary)

If you want to test the application immediately without setting up the database:
- The app will continue to work with demo data
- All features will function normally
- Data won't persist between sessions
- No database setup required

## What the Tables Do

### `hiwar` Table
- Stores Arabic-Indonesian conversation dialogues
- Contains fields: id, title_ar, title_id, description, tags, lines, meta
- Used for the main conversation learning feature

### `vocabulary` Table
- Stores Arabic vocabulary with Indonesian translations
- Contains fields: id, arabic, indonesian, root, category, examples, frequency
- Used for vocabulary learning and reference

## Verification

After setting up the tables, restart your development server:
```bash
npm run dev
```

The error messages should disappear, and you'll be able to:
- Add new conversations and vocabulary
- Data will persist in the database
- Full CRUD operations will work

## Environment Variables

Your `.env` file is already configured correctly:
- ✅ `VITE_SUPABASE_URL` is set
- ✅ `VITE_SUPABASE_ANON_KEY` is set
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is set

## Need Help?

If you encounter issues:
1. Check that your Supabase project is active
2. Verify your API keys are correct
3. Ensure you have proper permissions in the Supabase project
4. Try refreshing the Supabase dashboard after running SQL

The application is designed to gracefully fall back to demo data, so it will continue working even without the database setup.