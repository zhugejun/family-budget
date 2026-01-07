# Local SQLite3 Deployment Guide

## Overview

This guide will help you set up the Family Budget App to run **completely locally** with:

- ✅ SQLite3 database (no Supabase needed)
- ✅ No authentication/login required
- ✅ All data stored locally
- ✅ Fully offline capable
- ✅ Single-user mode

---

## Step 1: Install Dependencies

```bash
cd /Users/gejun/Documents/nextjs/family-expense

# Install SQLite3 package
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

---

## Step 2: Create SQLite Database Schema

Create the database initialization file:

**File**: `lib/db/schema.sql`

```sql
-- Create tables for local SQLite database

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT NOT NULL,
  split INTEGER DEFAULT 0,
  split_ratio TEXT DEFAULT '{"You": 50, "Partner": 50}',
  source TEXT CHECK(source IN ('receipt', 'manual')) DEFAULT 'manual',
  receipt_group TEXT,
  receipt_image_id TEXT,
  recurring_expense_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipt_images (
  id TEXT PRIMARY KEY,
  receipt_group TEXT NOT NULL,
  image_path TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')) NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  next_due_date TEXT NOT NULL,
  split INTEGER DEFAULT 0,
  split_ratio TEXT DEFAULT '{"You": 50, "Partner": 50}',
  auto_create INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_created ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(recurring_expense_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_expenses(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_expenses(is_active);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name) VALUES
  ('1', 'Groceries'),
  ('2', 'Dining'),
  ('3', 'Transportation'),
  ('4', 'Entertainment'),
  ('5', 'Shopping'),
  ('6', 'Health'),
  ('7', 'Utilities'),
  ('8', 'Other');

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('family_members', '["You", "Partner"]'),
  ('default_ratio', '{"You": 50, "Partner": 50}');
```

---

## Step 3: Create Database Connection Helper

**File**: `lib/db/sqlite.ts`

```typescript
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const DB_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'budget.db');
const SCHEMA_PATH = join(process.cwd(), 'lib', 'db', 'schema.sql');

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Create database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  try {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Initialize on first import
initDatabase();

export default db;
```

---

## Step 4: Create Local Data Hooks

**File**: `hooks/useLocalExpenses.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';

export interface Expense {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  split: boolean;
  split_ratio: Record<string, number>;
  source: 'receipt' | 'manual';
  receipt_group?: string;
  receipt_image_id?: string;
  recurring_expense_id?: string;
  created_at: string;
  updated_at: string;
}

export function useLocalExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/local/expenses');
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (
    expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const response = await fetch('/api/local/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    setExpenses((prev) => [data.expense, ...prev]);
    return data.expense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const response = await fetch('/api/local/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    const data = await response.json();
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    return data.expense;
  };

  const deleteExpense = async (id: string) => {
    await fetch(`/api/local/expenses?id=${id}`, { method: 'DELETE' });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addMultipleExpenses = async (
    expenses: Omit<Expense, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    const response = await fetch('/api/local/expenses/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses }),
    });
    const data = await response.json();
    setExpenses((prev) => [...data.expenses, ...prev]);
    return data.expenses;
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addMultipleExpenses,
    refetch: fetchExpenses,
  };
}
```

---

## Step 5: Create API Routes

**File**: `app/api/local/expenses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';
import { randomUUID } from 'crypto';

// GET - Fetch all expenses
export async function GET() {
  try {
    const expenses = db
      .prepare('SELECT * FROM expenses ORDER BY created_at DESC')
      .all();

    // Parse JSON fields
    const parsed = expenses.map((exp: any) => ({
      ...exp,
      split: Boolean(exp.split),
      split_ratio: JSON.parse(exp.split_ratio),
    }));

    return NextResponse.json({ expenses: parsed });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
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

    const created = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as any;

    return NextResponse.json({
      expense: {
        ...created,
        split: Boolean(created.split),
        split_ratio: JSON.parse(created.split_ratio),
      },
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
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

    const stmt = db.prepare(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    const updated = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as any;

    return NextResponse.json({
      expense: {
        ...updated,
        split: Boolean(updated.split),
        split_ratio: JSON.parse(updated.split_ratio),
      },
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
```

---

## Step 6: Simplify Dashboard (No Auth)

Update `app/dashboard/page.tsx` to use local storage instead of Supabase:

```typescript
// Replace imports
import { useLocalExpenses } from '@/hooks/useLocalExpenses';
import { useLocalCategories } from '@/hooks/useLocalCategories';
import { useLocalRecurring } from '@/hooks/useLocalRecurring';

// Remove
// import { useAuth } from '@/hooks/useAuth';

// In component, replace:
const { expenses, loading, ... } = useLocalExpenses();
const { categories, ... } = useLocalCategories();
const { recurring, ... } = useLocalRecurring();

// Remove user checks - no auth needed!
```

---

## Step 7: Remove Auth & Middleware

**Delete or disable**:

- `middleware.ts` (route protection)
- `app/auth/*` (login pages)
- `hooks/useAuth.ts`

**Update** `app/page.tsx`:

```typescript
// Redirect directly to dashboard
export default function Home() {
  redirect('/dashboard');
}
```

---

## Step 8: Run Locally

```bash
# Initialize database (first time)
npm run dev

# Database will be created at:
# data/budget.db

# Access at:
# http://localhost:3000
```

---

## File Structure

```
family-expense/
├── data/
│   └── budget.db          # SQLite database (auto-created)
├── lib/
│   └── db/
│       ├── schema.sql     # Database schema
│       └── sqlite.ts      # DB connection
├── hooks/
│   ├── useLocalExpenses.ts
│   ├── useLocalCategories.ts
│   └── useLocalRecurring.ts
├── app/
│   ├── api/
│   │   └── local/         # Local API routes
│   │       ├── expenses/
│   │       ├── categories/
│   │       └── recurring/
│   └── dashboard/
│       └── page.tsx       # No auth required!
```

---

## Migration from Supabase

If you want to migrate existing Supabase data:

1. Export from Supabase:

```sql
-- In Supabase SQL editor
COPY (SELECT * FROM expenses) TO '/path/expenses.csv' CSV HEADER;
```

2. Import to SQLite:

```bash
sqlite3 data/budget.db
.mode csv
.import expenses.csv expenses
```

---

## Advantages

✅ **No Cloud Dependencies** - Works completely offline  
✅ **No Auth** - Instant access, no login  
✅ **Fast** - Local database = instant queries  
✅ **Private** - All data stays on your machine  
✅ **Simple** - Just run `npm run dev`  
✅ **Free** - No Supabase costs

---

## Limitations

⚠️ **Single User** - No multi-user support  
⚠️ **Local Only** - Data not synced across devices  
⚠️ **No Cloud Backup** - Need manual backups  
⚠️ **Receipt Storage** - Images stored locally in `public/receipts/`

---

## Backup Your Data

```bash
# Backup database
cp data/budget.db data/budget_backup_$(date +%Y%m%d).db

# Restore
cp data/budget_backup_YYYYMMDD.db data/budget.db
```

---

## Next Steps

1. Create the files listed above
2. Run `npm install better-sqlite3 @types/better-sqlite3`
3. Start with `npm run dev`
4. Access at `http://localhost:3000`

**Your local, auth-free budget app is ready!** 🎉

No Supabase, no login, just pure local simplicity!
