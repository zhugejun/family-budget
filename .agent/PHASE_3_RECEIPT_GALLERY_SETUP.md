# Phase 3: Receipt Image Gallery - Setup Guide

## Prerequisites

You must have a Supabase project set up. If you haven't, follow the main SETUP.md first.

## Step 1: Set Up Supabase Storage

### 1.1 Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Enter these settings:
   - **Name**: `receipt-images`
   - **Public bucket**: ✅ **Yes** (checked)
   - Click **"Create bucket"**

### 1.2 Configure Storage Policies

1. Click on the `receipt-images` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Create the following policies:

**Policy 1: Allow authenticated users to upload**

```sql
CREATE POLICY "Allow users to upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipt-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: Allow authenticated users to view their own images**

```sql
CREATE POLICY "Allow users to view their own images"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'receipt-images');
```

**Policy 3: Allow authenticated users to delete their own images**

```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipt-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 2: Run Database Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `migrations/add_receipt_images.sql`
3. Paste and click **"Run"**

This will:

- Create the `receipt_images` table
- Add indexes for performance
- Set up Row Level Security policies
- Add optional `receipt_image_id` column to expenses table

---

## Step 3: Verify Setup

### Test Storage Access

1. Go to Storage > receipt-images
2. Try uploading a test image manually
3. Verify you can see and delete it

### Test Database

Run this query in SQL Editor:

```sql
SELECT * FROM receipt_images LIMIT 1;
```

You should see the table exists (even if empty).

---

## Step 4: Test the Feature

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard`

3. Go to **"Scan Receipt"** tab

4. Upload a receipt image

5. After processing, click the **"Gallery"** tab

6. You should see your receipt image in the gallery!

---

## Features Available

### Gallery View

- Grid layout of receipt thumbnails
- Hover to see receipt details
- Click to view full-size
- Delete button on hover

### Lightbox View

- Full-screen image viewing
- Zoom in/out controls (50% - 300%)
- Download original image
- Delete from lightbox
- ESC key to close
- Date and file information

### Automatic Integration

- Receipt images are automatically saved when you scan receipts
- Images are linked to expense groups
- Images persist across sessions

---

## File Size Limits

- **Maximum file size**: 10MB per image
- **Supported formats**: JPEG, PNG, WebP
- **Recommended**: Keep images under 5MB for faster uploads

---

## Storage Usage

Each image counts toward your Supabase storage quota:

- **Free tier**: 1GB storage
- Images are stored at full resolution
- Consider periodically cleaning old receipts

---

## Troubleshooting

### "Failed to upload image" Error

**Check**:

1. Supabase Storage bucket exists and is public
2. Storage policies are correctly set
3. File size is under 10MB
4. File type is JPEG, PNG, or WebP

**Fix**:

```bash
# Check environment variables
cat .env.local

# Should have:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Images Not Showing in Gallery

**Check**:

1. Database migration completed successfully
2. RLS policies are enabled on `receipt_images` table
3. User is authenticated

**Fix**:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'receipt_images';

-- Should show rowsecurity = true
```

### "Unauthorized" Error

**Check**:

1. User is logged in
2. Auth session is valid

**Fix**:

- Log out and log back in
- Clear browser cache
- Check Supabase auth logs

---

## API Endpoints

The following API routes handle receipt images:

### POST `/api/receipts`

Upload a new receipt image

**Request**:

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Image file
  - `receiptGroup`: Receipt group name

**Response**:

```json
{
  "success": true,
  "image": {
    "id": "uuid",
    "image_url": "https://...",
    "receipt_group": "Receipt - Jan 6, 2026",
    ...
  }
}
```

### DELETE `/api/receipts?id={imageId}`

Delete a receipt image

**Response**:

```json
{
  "success": true
}
```

---

## Data Model

### receipt_images Table

```typescript
{
  id: string                 // UUID primary key
  user_id: string           // References auth.users
  receipt_group: string     // Groups expenses together
  image_url: string         // Public URL to image
  thumbnail_url?: string    // Optional thumbnail
  file_name?: string        // Original filename
  file_size?: number        // Bytes
  mime_type?: string        // image/jpeg, etc.
  uploaded_at: string       // Timestamp
}
```

### Updated Expense Model

```typescript
{
  ...existing fields,
  receipt_image_id?: string  // Links to receipt_images.id
}
```

---

## Security Notes

- ✅ Row Level Security enabled
- ✅ Users can only access their own images
- ✅ File type validation (server-side)
- ✅ File size limits enforced
- ✅ Authenticated uploads only
- ✅ Images stored in user-specific folders

---

## Next Steps

Your Receipt Image Gallery is now set up! You can:

1. ✅ Upload receipts and see them in the gallery
2. ✅ View full-size images in the lightbox
3. ✅ Download original receipts
4. ✅ Delete unwanted images
5. ✅ Link images to expense groups

Continue to **Phase 4: Recurring Expenses** or test the current features!

---

## Optional: Local Storage Alternative

If you prefer NOT to use Supabase Storage, you can store images locally:

1. Create directory: `public/receipts/`
2. Modify `/app/api/receipts/route.ts` to save to filesystem
3. Update image URLs to use relative paths
4. Note: Images won't sync across devices

See `.agent/IMPLEMENTATION_PLAN.md` for detailed local storage instructions.
