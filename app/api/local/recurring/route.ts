import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { randomUUID } from 'crypto';

// GET - Fetch all recurring expenses
export async function GET() {
  try {
    const recurring = db
      .prepare('SELECT * FROM recurring_expenses ORDER BY created_at DESC')
      .all();

    // Parse JSON fields
    const parsed = recurring.map((rec: any) => ({
      ...rec,
      split: Boolean(rec.split),
      split_ratio: JSON.parse(rec.split_ratio),
      auto_create: Boolean(rec.auto_create),
      is_active: Boolean(rec.is_active),
    }));

    return NextResponse.json({ recurring: parsed });
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring expenses' },
      { status: 500 }
    );
  }
}

// POST - Add recurring expense
export async function POST(request: NextRequest) {
  try {
    const rec = await request.json();
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO recurring_expenses (
        id, name, amount, category, frequency, start_date, end_date,
        next_due_date, split, split_ratio, auto_create, is_active, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      rec.name,
      rec.amount,
      rec.category,
      rec.frequency,
      rec.start_date,
      rec.end_date || null,
      rec.next_due_date,
      rec.split ? 1 : 0,
      JSON.stringify(rec.split_ratio),
      rec.auto_create ? 1 : 0,
      rec.is_active !== undefined ? (rec.is_active ? 1 : 0) : 1,
      rec.notes || null,
      now,
      now
    );

    const created = db
      .prepare('SELECT * FROM recurring_expenses WHERE id = ?')
      .get(id) as any;

    return NextResponse.json({
      recurring: {
        ...created,
        split: Boolean(created.split),
        split_ratio: JSON.parse(created.split_ratio),
        auto_create: Boolean(created.auto_create),
        is_active: Boolean(created.is_active),
      },
    });
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring expense' },
      { status: 500 }
    );
  }
}

// PUT - Update recurring expense
export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'split_ratio') {
        fields.push('split_ratio = ?');
        values.push(JSON.stringify(value));
      } else if (key === 'split' || key === 'auto_create' || key === 'is_active') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(
      `UPDATE recurring_expenses SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    const updated = db
      .prepare('SELECT * FROM recurring_expenses WHERE id = ?')
      .get(id) as any;

    return NextResponse.json({
      recurring: {
        ...updated,
        split: Boolean(updated.split),
        split_ratio: JSON.parse(updated.split_ratio),
        auto_create: Boolean(updated.auto_create),
        is_active: Boolean(updated.is_active),
      },
    });
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring expense' },
      { status: 500 }
    );
  }
}

// DELETE - Delete recurring expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM recurring_expenses WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring expense' },
      { status: 500 }
    );
  }
}
