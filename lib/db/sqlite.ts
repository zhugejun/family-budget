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
    console.log('✅ Database initialized successfully at', DB_PATH);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Initialize on first import
initDatabase();

export default db;
