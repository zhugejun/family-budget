# Family Expense Tracker - Personal Use Features Implementation Plan

## Current State Analysis

### Existing Features

- ✅ Receipt scanning with AI (Claude)
- ✅ Manual expense entry
- ✅ Category management
- ✅ Split ratio customization
- ✅ Expense grouping by receipt
- ✅ Search and filter functionality
- ✅ Supabase backend with authentication

### Current Data Model (Supabase Schema)

```sql
expenses: {
  id: UUID
  user_id: UUID
  name: TEXT
  price: DECIMAL(10, 2)
  quantity: INTEGER
  category: TEXT
  split: BOOLEAN
  split_ratio: JSONB
  source: 'receipt' | 'manual'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

---

## Implementation Roadmap

This plan is organized in recommended implementation order, from quickest wins to more complex features.

---

## Phase 1: Month-by-Month Expense View 📅

**Effort**: ~2-3 hours | **Value**: High - immediate better organization

### Goal

Filter and display expenses by month only (not arbitrary date ranges). Users can navigate through months and see all expenses, totals, and splits for each specific month.

### Components to Create/Modify

- `lib/date-utils.ts` - Month filtering and date utilities
- `components/dashboard/month-selector.tsx` - Month picker UI with prev/next navigation
- Modify `components/dashboard/expense-groups.tsx` to accept month filter
- Modify `app/dashboard/page.tsx` to integrate month selector

### Features

- Month navigation controls: `< January 2026 >`
- Show all expenses within selected month
- Display monthly total and per-person splits
- Quick jump to "This Month" / "Last Month"
- Optional: Year selector for viewing older data
- Persist selected month in local state

### Data Processing

```typescript
// Filter expenses by month
function filterByMonth(expenses: Expense[], year: number, month: number) {
  return expenses.filter((exp) => {
    const date = new Date(exp.created_at);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

// Get available months from expenses
function getAvailableMonths(expenses: Expense[]) {
  // Return list of year-month combinations that have data
}
```

### Implementation Steps

1. Create `lib/date-utils.ts` with filtering functions
2. Build `MonthSelector` component with clean UI
3. Add month state to dashboard page
4. Pass filtered expenses to expense groups
5. Update summary cards to show monthly totals
6. Test with existing data across multiple months

---

## Phase 2: Dashboard Analytics 📊

**Effort**: ~4-6 hours | **Value**: High - visual insights into spending

### Goal

Add visual analytics to show spending patterns with interactive charts and trend analysis.

### Libraries Needed

```bash
npm install recharts
```

### Components to Create

- `lib/analytics.ts` - Data processing and aggregation functions
- `components/dashboard/analytics-panel.tsx` - Main analytics container
- `components/dashboard/spending-chart.tsx` - Line/bar chart showing spending over time
- `components/dashboard/category-pie-chart.tsx` - Pie chart for category breakdown
- `components/dashboard/trend-cards.tsx` - Quick stats cards
- `components/dashboard/spending-comparison.tsx` - Month-over-month comparison

### Features

- **Spending Over Time**: Line chart showing daily/weekly spending
- **Category Breakdown**: Pie chart with percentages by category
- **Trend Cards**:
  - Average daily spending
  - Highest expense this month
  - Most expensive category
  - Month-over-month change (↑ 12% vs last month)
- **Member Comparison**: Bar chart comparing "You" vs "Partner" spending
- **Top Expenses**: List of highest individual expenses
- Responsive design matching existing theme (amber/orange/rose gradients)

### Data Processing

Calculate and format:

- Total by day/week/month
- Average spending per day
- Category percentages and totals
- Month-over-month trends
- Split breakdowns per member

### UI Integration

- Add new "Analytics" tab to dashboard
- Use Recharts ResponsiveContainer for mobile
- Apply existing color scheme to charts
- Add tooltips with detailed breakdowns
- Export chart data as CSV option

### Implementation Steps

1. Install recharts library
2. Create `lib/analytics.ts` with data aggregation functions
3. Build individual chart components (start with category pie chart)
4. Create analytics panel container
5. Add "Analytics" tab to dashboard
6. Build spending over time chart
7. Add trend cards with calculations
8. Polish responsive design and colors
9. Test with various data scenarios

---

## Phase 3: Receipt Image Gallery 🖼️

**Effort**: ~4-5 hours | **Value**: Medium-High - useful for record keeping

### Goal

Store and view original receipt images linked to expense entries, with gallery view and lightbox.

### Database Changes

**Option A: Add column to expenses table**

```sql
ALTER TABLE expenses ADD COLUMN receipt_image_url TEXT;
```

**Option B: Separate table (recommended for multiple images per receipt)**

```sql
CREATE TABLE receipt_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_group TEXT NOT NULL, -- links to expense receipt_group
  image_url TEXT NOT NULL,
  image_name TEXT,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_receipt_images_user_id ON receipt_images(user_id);
CREATE INDEX idx_receipt_images_receipt_group ON receipt_images(receipt_group);
```

### Storage Solution

**Using Supabase Storage**:

- Create bucket: `receipt-images`
- Set RLS policies for user access
- Path structure: `{user_id}/{timestamp}_{filename}`
- Generate thumbnails for gallery view

**For Local Hosting**:

- Store in `public/receipts/{user_id}/` directory
- Serve via Next.js static file serving
- Use Next.js Image component for optimization

### Components to Create

- `components/dashboard/receipt-image-upload.tsx` - Enhanced upload with image preview
- `components/dashboard/receipt-gallery.tsx` - Grid view of receipt thumbnails
- `components/dashboard/receipt-lightbox.tsx` - Full-size image viewer modal
- `app/api/receipts/upload/route.ts` - Image upload handler
- `app/api/receipts/[id]/route.ts` - Get/delete specific receipt
- `hooks/useReceiptImages.ts` - Hook for receipt image operations

### Features

- Upload and save receipt image when scanning (save both AI data AND original image)
- Gallery view with thumbnail grid
- Click thumbnail to open lightbox with full-size image
- Link images to expense groups (show which expenses came from each receipt)
- Image zoom in lightbox
- Download original receipt
- Delete receipt image (with confirmation)
- Filter gallery by date range or category
- Search receipts by associated expense

### Implementation Steps

1. Set up Supabase Storage bucket (or local directory)
2. Create database table for receipt_images
3. Modify receipt upload flow to save image
4. Build upload component with preview
5. Create gallery component with grid layout
6. Implement lightbox modal
7. Add image management API routes
8. Create useReceiptImages hook
9. Integrate gallery into dashboard (new tab or modal)
10. Add delete functionality with confirmation
11. Test upload, view, and delete flows

---

## Phase 4: Recurring Expenses 🔄

**Effort**: ~5-7 hours | **Value**: Medium - helpful for regular expenses

### Goal

Define recurring expenses (rent, subscriptions) that auto-generate expense entries each period.

### Database Schema

```sql
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- optional, null = ongoing
  next_due_date DATE NOT NULL,
  split BOOLEAN DEFAULT FALSE,
  split_ratio JSONB DEFAULT '{"You": 50, "Partner": 50}'::jsonb,
  auto_create BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_next_due ON recurring_expenses(next_due_date);

-- Link generated expenses to their recurring source
ALTER TABLE expenses ADD COLUMN recurring_expense_id UUID REFERENCES recurring_expenses(id) ON DELETE SET NULL;
```

### Components to Create

- `components/dashboard/recurring-expense-form.tsx` - Add/edit recurring expense
- `components/dashboard/recurring-expenses-list.tsx` - List and manage recurring expenses
- `components/dashboard/upcoming-charges.tsx` - Show next charges coming up
- `app/api/recurring-expenses/route.ts` - CRUD API endpoints
- `app/api/recurring-expenses/generate/route.ts` - Generate due expenses
- `hooks/useRecurringExpenses.ts` - Hook for recurring expense operations
- `lib/recurring-utils.ts` - Calculation logic for next due dates

### Features

- **Add Recurring Expense**: Form with name, amount, category, frequency, start date
- **Frequency Options**: Daily, Weekly, Monthly, Yearly
- **Auto-generation**: Automatically create expense entries when due
- **Upcoming View**: Dashboard widget showing next 5 upcoming charges
- **Management**: Edit or delete recurring definitions
- **Pause/Resume**: Toggle auto_create to temporarily stop generation
- **End Date**: Optional end date for time-limited subscriptions
- **One-time Skip**: Skip generation for a specific occurrence
- **History**: View all generated expenses from a recurring source

### Auto-Generation Logic

```typescript
// Check and generate due recurring expenses
async function generateDueExpenses(userId: string) {
  // Get all active recurring expenses with next_due_date <= today
  // For each:
  //   1. Create expense entry
  //   2. Calculate next_due_date based on frequency
  //   3. Update recurring_expense record
  //   4. Check if past end_date, mark as inactive
}
```

**When to run**:

- On dashboard load (check once per session)
- Manual "Generate Now" button
- Optional: Cron job / scheduled task (if self-hosting)

### Implementation Steps

1. Create database table and RLS policies
2. Build recurring expense form component
3. Create API routes for CRUD operations
4. Implement useRecurringExpenses hook
5. Create recurring expenses list view
6. Build auto-generation logic in `lib/recurring-utils.ts`
7. Add generation API endpoint
8. Create upcoming charges widget
9. Integrate into dashboard (new tab or section)
10. Add pause/resume toggle
11. Implement skip functionality
12. Link generated expenses to recurring source
13. Test various frequencies and edge cases

---

## Phase 5: Local Hosting Without Supabase

**Effort**: ~3-4 hours | **Value**: Depends on hosting preference

### Goal

Run the app entirely locally without Supabase dependency, removing authentication for single-user personal use.

---

### Option 1: Local JSON Storage (Simplest)

**Storage Approach**:

- Store data in `data/expenses.json`, `data/settings.json`, `data/recurring.json`
- Use Node.js `fs` module (server-side) to read/write files
- No database server needed

**Implementation**:

1. **Create data directory and files**:

```bash
mkdir data
touch data/expenses.json data/settings.json data/recurring.json
```

2. **Create `lib/local-storage.ts`**:

```typescript
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function getExpenses() {
  const data = await fs.readFile(path.join(DATA_DIR, 'expenses.json'), 'utf-8');
  return JSON.parse(data);
}

export async function saveExpense(expense: Expense) {
  const expenses = await getExpenses();
  expenses.push(expense);
  await fs.writeFile(
    path.join(DATA_DIR, 'expenses.json'),
    JSON.stringify(expenses, null, 2)
  );
}

// Similar functions for update, delete, etc.
```

3. **Create API routes** (replace Supabase calls):

- `app/api/expenses/route.ts` - Read/write to JSON files
- `app/api/settings/route.ts`
- `app/api/recurring/route.ts`

4. **Remove authentication**:

- Delete `app/auth/` directory
- Remove `middleware.ts`
- Remove `useAuth` hook usage
- Remove `user_id` from all queries
- Make all pages publicly accessible

5. **Update hooks** to use local API routes instead of Supabase client

**Pros**:

- No database setup
- Simple file system
- Easy to backup (just copy data folder)
- Fast for small datasets

**Cons**:

- No concurrent user support
- Manual backups required
- File locking issues if modified externally
- Slower for large datasets

---

### Option 2: SQLite Database (Recommended for Personal Use)

**Storage Approach**:

- Use SQLite with `better-sqlite3` package
- Database file: `data/budget.db`
- File-based, no server needed
- Full SQL features

**Setup**:

```bash
npm install better-sqlite3
npm install @types/better-sqlite3 --save-dev
```

**Implementation**:

1. **Create `lib/sqlite.ts`**:

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'budget.db');
const db = new Database(dbPath);

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT NOT NULL,
      split BOOLEAN DEFAULT 0,
      split_ratio TEXT, -- JSON string
      source TEXT CHECK (source IN ('receipt', 'manual')),
      receipt_group TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      categories TEXT, -- JSON array
      default_ratio TEXT, -- JSON object
      family_members TEXT -- JSON array
    );
    
    CREATE TABLE IF NOT EXISTS recurring_expenses (
      -- similar schema
    );
  `);
}

export const queries = {
  getAllExpenses: db.prepare('SELECT * FROM expenses ORDER BY created_at DESC'),
  insertExpense: db.prepare(`
    INSERT INTO expenses (id, name, price, quantity, category, split, split_ratio, source, receipt_group)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  // etc.
};
```

2. **Create initialization script** (`scripts/init-local-db.ts`):

```typescript
import { initDatabase } from '../lib/sqlite';

initDatabase();
console.log('Database initialized!');
```

3. **Update API routes** to use SQLite instead of Supabase:

```typescript
// app/api/expenses/route.ts
import { queries } from '@/lib/sqlite';

export async function GET() {
  const expenses = queries.getAllExpenses.all();
  return Response.json(expenses);
}
```

4. **Remove authentication** (same as Option 1)

5. **Migration script** (optional):

```typescript
// scripts/migrate-from-supabase.ts
// Fetch all data from Supabase and insert into SQLite
```

**Pros**:

- Proper relational database
- Full SQL features (indexes, transactions, etc.)
- Better performance for larger datasets
- ACID compliance
- Easy backups (copy .db file)

**Cons**:

- Slightly more setup than JSON
- Need to manage database file
- Writing SQL queries

---

### Option 3: Self-Hosted PostgreSQL (Advanced)

**Storage Approach**:

- Run PostgreSQL locally (Docker or native install)
- Use `pg` package instead of Supabase client
- Keep same schema, remove RLS and auth

**Setup**:

1. **Install PostgreSQL**:

```bash
# Via Docker
docker run --name family-budget-db -e POSTGRES_PASSWORD=localpass -p 5432:5432 -d postgres

# Or via Homebrew (macOS)
brew install postgresql
brew services start postgresql
```

2. **Install pg driver**:

```bash
npm install pg
npm install @types/pg --save-dev
```

3. **Create `lib/postgres.ts`**:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'family_budget',
  user: 'postgres',
  password: 'localpass',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
```

4. **Run schema** (reuse existing `supabase-schema.sql`, remove RLS/auth parts)

5. **Update API routes** to use `pg` client

6. **Remove authentication**

**Pros**:

- Full PostgreSQL features
- Same schema as Supabase (easier migration)
- Scalable
- JSON field support

**Cons**:

- Need to run database server
- More resource intensive
- More complex setup and maintenance

---

### Removal Checklist (All Options)

When removing Supabase and auth:

- [ ] Delete `app/auth/` directory
- [ ] Remove `middleware.ts`
- [ ] Remove `lib/supabase.ts`
- [ ] Delete `hooks/useAuth.ts`
- [ ] Remove `user_id` from all database schemas
- [ ] Update all API routes to use new data layer
- [ ] Remove authentication checks from components
- [ ] Remove `auth.users` foreign key references
- [ ] Update environment variables
- [ ] Remove Supabase related packages
- [ ] Update documentation

---

## Technical Notes

### State Management

- Continue using React hooks for local state
- Custom hooks for data fetching: `useExpenses`, `useCategories`, `useRecurringExpenses`
- Consider Context API if state sharing becomes complex
- No need for Redux/Zustand for this app size

### Date Handling

- Use native `Date` object for month filtering
- Consider `date-fns` library for advanced date manipulation (formatting, adding months, etc.)
- Ensure timezone consistency (store in UTC, display in local)
- Handle edge cases (month boundaries, leap years)

### Image Optimization

- Use Next.js `<Image>` component for automatic optimization
- Generate and store thumbnails (200x200) for gallery view
- Lazy load images in gallery (only load visible items)
- Compress images before storage (reduce file size)
- Support common formats: JPEG, PNG, WebP

### Chart Performance

- Recharts handles ~1000 data points efficiently
- For large datasets, aggregate by week/month instead of daily
- Use `ResponsiveContainer` for mobile responsiveness
- Implement loading states during data processing
- Consider virtualization for large lists

### Error Handling

- Implement try-catch blocks in all API routes
- Show user-friendly error messages
- Log errors for debugging
- Handle network failures gracefully
- Validate user input before processing

---

## Next Steps

**Ready to start implementation in this order:**

1. ✅ **Phase 1: Month-by-Month View** (~2-3 hours)

   - Quick win, immediate value
   - Enhances existing expense viewing

2. ✅ **Phase 2: Dashboard Analytics** (~4-6 hours)

   - Visual insights into spending
   - Makes app more engaging

3. ✅ **Phase 3: Receipt Image Gallery** (~4-5 hours)

   - Useful for record keeping
   - Enhances receipt scanning feature

4. ✅ **Phase 4: Recurring Expenses** (~5-7 hours)

   - Handles regular bills/subscriptions
   - More complex but valuable

5. ✅ **Phase 5: Local Hosting** (~3-4 hours)
   - Optional: Only if moving away from Supabase
   - Choose storage method based on needs

**Let's begin with Phase 1: Month-by-Month View!**
