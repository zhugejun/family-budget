import { NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';

// Simple endpoint to clean up invalid receipt images
export async function POST() {
  try {
    // Delete all receipt images (since we're starting fresh with local storage)
    const result = db.prepare('DELETE FROM receipt_images').run();
    
    console.log(`Cleaned up ${result.changes} old receipt images`);
    
    return NextResponse.json({ 
      success: true, 
      deleted: result.changes,
      message: 'Old receipt images cleared. Upload new receipts to see them in the gallery.'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to clean up images' },
      { status: 500 }
    );
  }
}

// Get current count
export async function GET() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM receipt_images').get() as { count: number };
    
    return NextResponse.json({ 
      count: count.count,
      message: count.count > 0 ? `${count.count} images in gallery` : 'No images in gallery'
    });
  } catch (error) {
    console.error('Get count error:', error);
    return NextResponse.json(
      { error: 'Failed to get image count' },
      { status: 500 }
    );
  }
}
