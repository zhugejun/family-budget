-- Clean up old receipt images data that might have invalid structure
-- Run this if you're seeing errors about missing image_path

-- Delete all old receipt images (they were from Supabase storage anyway)
DELETE FROM receipt_images;

-- Verify the table is empty
SELECT COUNT(*) as remaining_images FROM receipt_images;
