# Family Budget App - Project Prompt

## Overview

Build a family budget web app that helps households track shared expenses, split costs between members, and manage receipts with AI-powered OCR.

## Tech Stack

- **Frontend**: Next.js + Tailwind CSS
- **Receipt OCR**: Claude API (Vision) - claude-sonnet-4-20250929
- **Database**: Supabase
- **Auth**: Supabase
- **Hosting**: Vercel

## Core Features (Implemented)

### 1. Receipt Scanning

- Drag & drop or click to upload receipt images
- Claude Vision API extracts: item name, price, quantity, category
- Returns structured JSON for easy parsing
- Handles messy/crumpled receipts

### 2. Expense Management

- View all expenses in a list
- Edit any item (name, price, category) - fixes OCR mistakes
- Delete items
- Manual entry for non-receipt expenses
- Source tracking (receipt vs manual)

### 3. Expense Splitting

- Toggle split on/off per item
- Custom ratio per item (e.g., 70/30, 60/40)
- Global default ratio in settings (applies to new items)
- "Reset to default" button when item ratio differs from global
- Real-time calculation of who owes what

### 4. Category Management

- Default categories: Groceries, Dining, Transport, Utilities, Entertainment, Health, Other
- Add custom categories
- Edit existing categories (updates all linked expenses)
- Delete categories (expenses auto-reassign)
- Receipt OCR uses custom categories

### 5. Settings Panel

- Default split ratio slider (linked: adjust one, other updates)
- Category CRUD interface
- Collapsible panel in header

## Data Model

```javascript
// Expense
{
  id: number,
  name: string,
  price: number,
  quantity: number,
  category: string,
  split: boolean,
  splitRatio: { "You": number, "Partner": number },
  source: "receipt" | "manual",
  date: Date // to add
}

// App State
{
  expenses: Expense[],
  categories: string[],
  defaultRatio: { "You": number, "Partner": number },
  familyMembers: string[] // currently hardcoded, make dynamic
}
```

## Features to Add

### Phase 1: Persistence

- [ ] Add Supabase/Firebase for data storage
- [ ] User authentication
- [ ] Sync across devices
- [ ] Store receipt images

### Phase 2: Dashboard

- [ ] Monthly spending summary
- [ ] Category breakdown (pie chart)
- [ ] Spending trends over time (line chart)
- [ ] Budget vs actual comparison
- [ ] Filter by date range, category, member

### Phase 3: Enhanced Features

- [ ] Dynamic family members (add/remove/rename)
- [ ] Recurring expenses
- [ ] Budget limits per category with alerts
- [ ] Export to CSV/PDF
- [ ] Receipt image gallery
- [ ] Search and filter expenses
- [ ] Tags in addition to categories

### Phase 4: Advanced

- [ ] Multiple households/groups
- [ ] Settle up / payment tracking
- [ ] Integration with bank accounts (Plaid)
- [ ] Mobile app (React Native)
- [ ] Shared shopping lists
- [ ] Price tracking / inflation alerts

## Claude API Integration

```javascript
// Receipt OCR call
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Extract all items from this receipt. Return ONLY valid JSON array:
[{"name": "item", "price": 12.99, "quantity": 1, "category": "Groceries"}]
Categories: ${categories.join(', ')}.
Return [] if unreadable.`,
          },
        ],
      },
    ],
  }),
});
```

## UI/UX Guidelines

- Warm, friendly color palette (amber/orange accents)
- Clean, minimal interface
- Mobile-responsive
- Instant feedback (loading states, success/error)
- Non-destructive actions (confirm before delete)
- Keyboard shortcuts for power users

## File Structure (Suggested)

```
/src
  /components
    Header.jsx
    ExpenseList.jsx
    ExpenseItem.jsx
    ReceiptUploader.jsx
    ManualEntryForm.jsx
    SettingsPanel.jsx
    Dashboard.jsx
    SplitControls.jsx
  /hooks
    useExpenses.js
    useCategories.js
    useReceipt.js
  /lib
    claude.js        # API calls
    supabase.js      # Database
    calculations.js  # Split math
  /pages
    index.jsx
    dashboard.jsx
  App.jsx
```

## Current Limitations

- No persistence (data lost on refresh)
- Hardcoded family members ("You", "Partner")
- No authentication
- No date tracking on expenses
- Single currency assumed

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Add Claude API key to environment
4. Run: `npm run dev`

---

Use this prompt to continue building or to onboard another developer/AI assistant to the project.
