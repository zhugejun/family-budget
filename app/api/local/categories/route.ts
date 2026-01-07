import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { randomUUID } from 'crypto';

// GET - Fetch all categories
export async function GET() {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    const categoryNames = categories.map((c: any) => c.name);
    
    return NextResponse.json({ categories: categoryNames });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - Add category
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const id = randomUUID();

    db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').run(id, name);

    return NextResponse.json({ success: true, category: name });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT - Update category  
export async function PUT(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json();

    // Update category name
    db.prepare('UPDATE categories SET name = ? WHERE name = ?').run(newName, oldName);
    
    // Update all expenses with this category
    db.prepare('UPDATE expenses SET category = ? WHERE category = ?').run(newName, oldName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    // Update expenses to 'Other' category
    db.prepare('UPDATE expenses SET category = ? WHERE category = ?').run('Other', name);
    
    // Delete category
    db.prepare('DELETE FROM categories WHERE name = ?').run(name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
