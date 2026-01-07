import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const RECEIPTS_DIR = join(process.cwd(), 'public', 'receipts');

// Ensure receipts directory exists
async function ensureReceiptsDir() {
  if (!existsSync(RECEIPTS_DIR)) {
    await mkdir(RECEIPTS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureReceiptsDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const receiptGroup = formData.get('receiptGroup') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!receiptGroup) {
      return NextResponse.json(
        { error: 'Receipt group is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = join(RECEIPTS_DIR, fileName);
    const publicPath = `/receipts/${fileName}`;

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Save metadata to database
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO receipt_images (
        id, receipt_group, image_path, file_name, file_size, mime_type, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      receiptGroup,
      publicPath,
      file.name,
      file.size,
      file.type,
      now
    );

    const imageRecord = db.prepare('SELECT * FROM receipt_images WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      image: imageRecord,
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

// Delete receipt image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image record to find file path
    const image = db.prepare('SELECT * FROM receipt_images WHERE id = ?').get(imageId) as any;

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete file from disk
    const filePath = join(process.cwd(), 'public', image.image_path);
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    // Delete from database
    db.prepare('DELETE FROM receipt_images WHERE id = ?').run(imageId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Receipt deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
