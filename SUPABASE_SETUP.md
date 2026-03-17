# Supabase Setup Guide for GLB Needs

This guide will help you set up Supabase database integration for your GLB Needs educational platform.

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com)
2. Basic knowledge of SQL and JavaScript
3. Your existing GLB Needs website files

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `glb-needs`
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire content from `supabase-schema.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema
5. This will create all necessary tables, policies, and sample data

## Step 3: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following settings:
   - **Site URL**: `http://localhost:3000` (for development) or your actual domain
   - **Redirect URLs**: Add your signin and signup page URLs
   - **Enable Email Confirmations**: Turn this ON for production
   - **Enable Email Change Confirmations**: Turn this ON

## Step 4: Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `study-materials`
3. Set the bucket to **Public** (since study materials should be accessible)
4. Configure CORS if needed for your domain

## Step 5: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

## Step 6: Update Configuration

1. Open `assets/js/supabase-config.js`
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 7: Test the Integration

1. Open your website in a browser
2. Try to sign up with a new account
3. Check if the user is created in Supabase **Authentication** → **Users**
4. Check if the profile is created in the **profiles** table

## Step 8: Add Sample Data (Optional)

You can add some sample study materials to test the functionality:

```sql
-- Add sample study materials
INSERT INTO study_materials (title, description, department, subject, type, file_url) VALUES
('COA Unit 1 Notes', 'Complete notes for Computer Organization and Architecture Unit 1', 'Computer Science And Engineering', 'COA', 'notes', 'https://example.com/coa-unit1.pdf'),
('Data Structures Question Bank', 'Previous year question papers for Data Structures', 'Computer Science And Engineering', 'Data Structures', 'question_paper', 'https://example.com/ds-questions.pdf'),
('Python Programming Syllabus', 'Updated syllabus for Python Programming course', 'Computer Science And Engineering', 'Python', 'syllabus', 'https://example.com/python-syllabus.pdf');
```

## Features Available After Setup

### 1. User Authentication
- ✅ User registration and login
- ✅ Email verification
- ✅ Password reset
- ✅ Session management
- ✅ User profiles

### 2. Study Materials Management
- ✅ Upload and store study materials
- ✅ Categorize by department and subject
- ✅ Different material types (notes, question papers, syllabus, etc.)
- ✅ File storage with Supabase Storage

### 3. User Progress Tracking
- ✅ Track study progress for each material
- ✅ Time spent on materials
- ✅ Completion status
- ✅ Last accessed timestamps

### 4. User Favorites
- ✅ Add/remove materials to favorites
- ✅ View favorite materials
- ✅ Quick access to saved content

### 5. User Notes
- ✅ Add personal notes to materials
- ✅ Page-specific notes
- ✅ Edit and delete notes

### 6. Study Sessions
- ✅ Track study session duration
- ✅ Session history
- ✅ Analytics on study patterns

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Secure user authentication with Supabase Auth
- **File Security**: Controlled access to uploaded files
- **Input Validation**: Server-side validation for all inputs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase settings
2. **Authentication Errors**: Check if your API keys are correct and the user is properly authenticated
3. **File Upload Issues**: Ensure the storage bucket is properly configured and public
4. **Database Errors**: Verify that the schema was created correctly

### Debug Mode

To enable debug mode, add this to your browser console:
```javascript
localStorage.setItem('supabase.debug', 'true');
```

## Next Steps

1. **Customize the UI**: Modify the authentication forms to match your website's design
2. **Add More Features**: Implement search, filtering, and advanced analytics
3. **Mobile Optimization**: Ensure the authentication works well on mobile devices
4. **Email Templates**: Customize email templates for verification and password reset
5. **Analytics**: Add Google Analytics or similar to track user behavior

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for JavaScript errors
3. Check the Supabase dashboard logs for server-side errors
4. Ensure all files are properly loaded and in the correct locations

## Production Deployment

Before going live:
1. Update the Site URL in Supabase settings to your production domain
2. Enable email confirmations
3. Set up proper CORS policies
4. Configure backup and monitoring
5. Test all authentication flows thoroughly 