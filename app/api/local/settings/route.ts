import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/sqlite';

// GET - Fetch all settings
export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM settings').all() as any[];

    // Convert array to object
    const settingsObj: any = {};
    settings.forEach((setting) => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const now = new Date().toISOString();

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `).run(key, stringValue, now);
    }

    // Fetch updated settings
    const settings = db.prepare('SELECT * FROM settings').all() as any[];
    const settingsObj: any = {};
    settings.forEach((setting) => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
