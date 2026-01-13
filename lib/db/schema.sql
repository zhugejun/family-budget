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
  payment_card TEXT,
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
