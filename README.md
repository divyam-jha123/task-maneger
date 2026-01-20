# To-Do App with Supabase

A modern, feature-rich to-do application with Supabase backend integration for real-time data synchronization.

## Features

- ✅ Add, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Filter tasks (All, Active, Completed)
- ✅ Clear all completed tasks
- ✅ Real-time updates with Supabase
- ✅ Persistent data storage
- ✅ Beautiful, responsive UI
- ✅ Loading states and error handling

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up (takes a few minutes)

### 2. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following SQL to create the `tasks` table:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for public access)
-- For production, you should create more restrictive policies
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

### 4. Configure the App

1. Open `config.js`
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon/public key

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 5. Run the App

1. Open `index.html` in your web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

## File Structure

```
task_maneger/
├── index.html      # Main HTML file
├── style.css       # Styling
├── app.js          # Application logic with Supabase integration
├── config.js       # Supabase configuration
└── README.md       # This file
```

## Security Notes

⚠️ **Important**: The current setup uses a permissive RLS policy that allows all operations. For production use:

1. Implement proper authentication
2. Create user-specific policies
3. Use service role keys only on the server side
4. Never expose service role keys in client-side code

## Real-time Features

The app includes Supabase real-time subscriptions, so changes made in one browser window will automatically appear in other open windows.

## Troubleshooting

- **"Failed to load tasks"**: Check your Supabase credentials in `config.js`
- **CORS errors**: Make sure your Supabase project allows requests from your domain
- **Table not found**: Make sure you've run the SQL script to create the `tasks` table
- **RLS errors**: Check that Row Level Security policies are set up correctly

## License

MIT

