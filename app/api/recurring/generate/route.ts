import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import {
  calculateNextDueDate,
  isRecurringDue,
  isRecurringExpired,
  type RecurringExpense,
} from '@/lib/recurring-utils';

// Create Supabase server client
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active recurring expenses that are due
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('auto_create', true);

    if (fetchError) {
      console.error('Error fetching recurring expenses:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch recurring expenses' },
        { status: 500 }
      );
    }

    const generated: any[] = [];
    const updated: string[] = [];
    const deactivated: string[] = [];

    // Process each recurring expense
    for (const rec of recurring as RecurringExpense[]) {
      try {
        // Skip if not due
        if (!isRecurringDue(rec.next_due_date)) {
          continue;
        }

        // Check if expired
        if (isRecurringExpired(rec.next_due_date, rec.end_date)) {
          // Deactivate expired recurring expense
          await supabase
            .from('recurring_expenses')
            .update({ is_active: false })
            .eq('id', rec.id);
          
          deactivated.push(rec.id);
          continue;
        }

        // Create expense entry
        const { data: newExpense, error: insertError } = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            name: rec.name,
            price: rec.amount,
            quantity: 1,
            category: rec.category,
            split: rec.split,
            split_ratio: rec.split_ratio,
            source: 'manual',
            recurring_expense_id: rec.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating expense for ${rec.name}:`, insertError);
          continue;
        }

        generated.push(newExpense);

        // Calculate next due date
        const currentDue = new Date(rec.next_due_date);
        const nextDue = calculateNextDueDate(currentDue, rec.frequency);

        // Update recurring expense with new next_due_date
        await supabase
          .from('recurring_expenses')
          .update({ next_due_date: nextDue.toISOString().split('T')[0] })
          .eq('id', rec.id);

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
