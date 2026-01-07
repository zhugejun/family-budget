import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { randomUUID } from 'crypto';

// GET - Fetch all expenses
export async function GET() {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all();
    
    // Parse JSON fields
    const parsed = expenses.map((exp: any) => ({
      ...exp,
      split: Boolean(exp.split),
      split_ratio: JSON.parse(exp.split_ratio),
    }));

    return NextResponse.json({ expenses: parsed });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST - Add expense
export async function POST(request: NextRequest) {
  try {
    const expense = await request.json();
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO expenses (
        id, name, price, quantity, category, split, split_ratio,
        source, receipt_group, receipt_image_id, recurring_expense_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      expense.name,
      expense.price,
      expense.quantity || 1,
      expense.category,
      expense.split ? 1 : 0,
      JSON.stringify(expense.split_ratio),
      expense.source || 'manual',
      expense.receipt_group || null,
      expense.receipt_image_id || null,
      expense.recurring_expense_id || null,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as any;

    return NextResponse.json({
      expense: {
        ...created,
        split: Boolean(created.split),
        split_ratio: JSON.parse(created.split_ratio),
      },
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

// PUT - Update expense
export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();
    
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'split_ratio') {
        fields.push('split_ratio = ?');
        values.push(JSON.stringify(value));
      } else if (key === 'split') {
        fields.push('split = ?');
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as any;

    return NextResponse.json({
      expense: {
        ...updated,
        split: Boolean(updated.split),
        split_ratio: JSON.parse(updated.split_ratio),
      },
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE - Delete expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
