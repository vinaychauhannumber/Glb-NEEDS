-- GLB Needs Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    department TEXT,
    year_of_study INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT REFERENCES departments(name) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (name, department)
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    subject TEXT,
    type TEXT CHECK (type IN ('notes', 'question_paper', 'syllabus', 'model_answer', 'video', 'pdf')),
    file_url TEXT,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (department, subject) REFERENCES subjects (department, name) ON DELETE CASCADE
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES study_materials(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES study_materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

-- Create user_notes table
CREATE TABLE IF NOT EXISTS user_notes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES study_materials(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    page_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES study_materials(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_department ON study_materials(department);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_type ON study_materials(type);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_by ON study_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_material_id ON user_progress(material_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for study_materials
CREATE POLICY "Anyone can view study materials" ON study_materials
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create study materials" ON study_materials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own study materials" ON study_materials
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own study materials" ON study_materials
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON user_progress
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_notes
CREATE POLICY "Users can view their own notes" ON user_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON user_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON user_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON user_notes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
('Computer Science And Engineering', 'Computer Science and Engineering department'),
('Information Technology', 'Information Technology department'),
('Artificial Intelligence', 'Artificial Intelligence department'),
('Mechanical Engineering', 'Mechanical Engineering department'),
('Electrical Engineering', 'Electrical Engineering department'),
('Chemical Engineering', 'Chemical Engineering department')
ON CONFLICT (name) DO NOTHING;

-- Insert default subjects for Computer Science
INSERT INTO subjects (name, department, description) VALUES
('COA', 'Computer Science And Engineering', 'Computer Organization and Architecture'),
('Data Structures', 'Computer Science And Engineering', 'Data Structures and Algorithms'),
('DSTL', 'Computer Science And Engineering', 'Data Structures and Algorithms Lab'),
('Maths-4', 'Computer Science And Engineering', 'Mathematics IV'),
('Python', 'Computer Science And Engineering', 'Python Programming'),
('OS', 'Computer Science And Engineering', 'Operating Systems'),
('Java', 'Computer Science And Engineering', 'Java Programming'),
('Software Testing', 'Computer Science And Engineering', 'Software Testing and Quality Assurance'),
('Advanced Computer Networks', 'Computer Science And Engineering', 'Advanced Computer Networks')
ON CONFLICT DO NOTHING;

-- Insert default subjects for Information Technology
INSERT INTO subjects (name, department, description) VALUES
('OS', 'Information Technology', 'Operating Systems'),
('Software Engineering', 'Information Technology', 'Software Engineering'),
('Information Security', 'Information Technology', 'Information Security'),
('Java Programming', 'Information Technology', 'Java Programming'),
('Communication Technology', 'Information Technology', 'Communication Technology'),
('Hardware & Maintenance', 'Information Technology', 'Hardware and Maintenance'),
('Data Communication & Networking', 'Information Technology', 'Data Communication and Networking'),
('Microprocessor', 'Information Technology', 'Microprocessor and Interfacing'),
('OOP', 'Information Technology', 'Object Oriented Programming'),
('Multimedia Technology', 'Information Technology', 'Multimedia Technology')
ON CONFLICT DO NOTHING;

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 