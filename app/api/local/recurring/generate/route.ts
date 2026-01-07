import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import {
  calculateNextDueDate,
  isRecurringDue,
  isRecurringExpired,
  type RecurringExpense,
} from '@/lib/recurring-utils';
import { randomUUID} from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get all active recurring expenses that are due
    const recurring = db
      .prepare('SELECT * FROM recurring_expenses WHERE is_active = 1 AND auto_create = 1')
      .all() as any[];

    const generated: any[] = [];
    const updated: string[] = [];
    const deactivated: string[] = [];

    // Process each recurring expense
    for (const rec of recurring) {
      try {
        // Parse JSON fields
        const parsedRec: RecurringExpense = {
          ...rec,
          split: Boolean(rec.split),
          split_ratio: JSON.parse(rec.split_ratio),
          auto_create: Boolean(rec.auto_create),
          is_active: Boolean(rec.is_active),
        };

        // Skip if not due
        if (!isRecurringDue(parsedRec.next_due_date)) {
          continue;
        }

        // Check if expired
        if (isRecurringExpired(parsedRec.next_due_date, parsedRec.end_date)) {
          // Deactivate expired recurring expense
          db.prepare('UPDATE recurring_expenses SET is_active = 0 WHERE id = ?').run(rec.id);
          deactivated.push(rec.id);
          continue;
        }

        // Create expense entry
        const expenseId = randomUUID();
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO expenses (
            id, name, price, quantity, category, split, split_ratio,
            source, recurring_expense_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          expenseId,
          parsedRec.name,
          parsedRec.amount,
          1,
          parsedRec.category,
          parsedRec.split ? 1 : 0,
          JSON.stringify(parsedRec.split_ratio),
          'manual',
          parsedRec.id,
          now,
          now
        );

        const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId);
        generated.push(newExpense);

        // Calculate next due date
        const currentDue = new Date(parsedRec.next_due_date);
        const nextDue = calculateNextDueDate(currentDue, parsedRec.frequency);

        // Update recurring expense with new next_due_date
        db.prepare('UPDATE recurring_expenses SET next_due_date = ? WHERE id = ?')
          .run(nextDue.toISOString().split('T')[0], rec.id);

        updated.push(rec.id);

      } catch (err) {
        console.error(`Error processing recurring expense ${rec.id}:`, err);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      generated: generated.length,
      updated: updated.length,
      deactivated: deactivated.length,
      expenses: generated,
    });

  } catch (error) {
    console.error('Generate recurring expenses error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recurring expenses' },
      { status: 500 }
    );
  }
}
