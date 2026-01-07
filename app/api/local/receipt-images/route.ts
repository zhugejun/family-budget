import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { randomUUID } from 'crypto';

// GET - Fetch all receipt images
export async function GET() {
  try {
    const images = db
      .prepare('SELECT * FROM receipt_images ORDER BY uploaded_at DESC')
      .all();

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching receipt images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt images' },
      { status: 500 }
    );
  }
}

// POST - Add receipt image metadata
export async function POST(request: NextRequest) {
  try {
    const image = await request.json();
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO receipt_images (
        id, receipt_group, image_path, file_name, file_size, mime_type, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      image.receipt_group,
      image.image_path,
      image.file_name || null,
      image.file_size || null,
      image.mime_type || null,
      now
    );

    const created = db
      .prepare('SELECT * FROM receipt_images WHERE id = ?')
      .get(id);

    return NextResponse.json({ image: created });
  } catch (error) {
    console.error('Error creating receipt image:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete receipt image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM receipt_images WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting receipt image:', error);
    return NextResponse.json(
      { error: 'Failed to delete receipt image' },
      { status: 500 }
    );
  }
}
