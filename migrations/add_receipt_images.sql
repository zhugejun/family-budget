-- Receipt Images Migration
-- Add this to your Supabase SQL Editor or run it on your database

-- Create receipt_images table
CREATE TABLE IF NOT EXISTS receipt_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receipt_group TEXT NOT NULL, -- links to expense receipt_group
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_images_user_id ON receipt_images(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_images_receipt_group ON receipt_images(receipt_group);
CREATE INDEX IF NOT EXISTS idx_receipt_images_uploaded_at ON receipt_images(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE receipt_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own receipt images"
  ON receipt_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipt images"
  ON receipt_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt images"
  ON receipt_images FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Add receipt_image_id to expenses table to link directly
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image_id UUID REFERENCES receipt_images(id) ON DELETE SET NULL;

COMMENT ON TABLE receipt_images IS 'Stores original receipt images uploaded by users';
COMMENT ON COLUMN receipt_images.receipt_group IS 'Links to expenses.receipt_group for grouping';
COMMENT ON COLUMN receipt_images.thumbnail_url IS 'Optional thumbnail URL for gallery view';
