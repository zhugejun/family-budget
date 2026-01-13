# Payment Card Extraction Feature

## Overview

The Family Budget app now automatically extracts payment card information from receipts during processing. This helps track which credit or debit card was used for each expense.

## What Information Is Extracted?

- **Card Type**: Visa, Mastercard, Amex, Debit, etc.
- **Last 4 Digits**: The last 4 digits of the card number
- **Format Example**: "Visa 1234", "Mastercard 5678", "Amex 9012"

## How It Works

### 1. Receipt Processing

When you upload a receipt, the AI (Claude Vision API) automatically:

- Scans the receipt for payment card information
- Looks for common patterns like "VISA \***\*1234" or "MC \*\***5678"
- Extracts the card type and last 4 digits

### 2. Data Storage

The payment card information is stored with each expense item in the database:

- Database field: `payment_card` (TEXT, nullable)
- Example values: "Visa 1234", "Mastercard 5678", or NULL if not found

### 3. Display

Once extracted, you can view the payment card information:

- **Edit Dialog**: When you click to edit an expense from a receipt, the card info appears in a blue badge below the category field
- **Read-Only**: Card information is extracted from receipts and cannot be manually edited

## Database Migration

For existing databases, run this SQL migration to add the new column:

```sql
ALTER TABLE expenses ADD COLUMN payment_card TEXT;
```

The migration script is located at: `lib/db/migrations/add_payment_card.sql`

## Files Modified

1. **Database Schema** (`lib/db/schema.sql`)

   - Added `payment_card TEXT` column to expenses table

2. **API Route** (`app/api/process-receipt/route.ts`)

   - Updated AI prompt to extract payment card information
   - Modified response parsing to handle new JSON structure

3. **Type Definitions** (`lib/calculations.ts`)

   - Added `payment_card?: string` to Expense interface

4. **Client Library** (`lib/claude.ts`)

   - Updated return type to include `payment_card`

5. **Dashboard Page** (`app/dashboard/page.tsx`)

   - Updated to destructure and store `payment_card` from API response

6. **Edit Dialog** (`components/dashboard/expense-edit-dialog.tsx`)
   - Added visual display of payment card information

## Notes

- **Optional Field**: Payment card is optional - if the AI cannot find card information on a receipt, it will be set to `undefined`
- **Privacy**: Only the last 4 digits are stored (this is standard on receipts)
- **Receipt Source Only**: This feature only works for expenses created from receipt scanning, not manual entries
- **No Manual Entry**: Currently, users cannot manually add or edit card information
