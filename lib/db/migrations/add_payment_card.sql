-- Migration: Add payment_card column to expenses table
-- This migration adds support for storing which credit/debit card was used for each expense

-- Add the payment_card column to existing expenses table
ALTER TABLE expenses ADD COLUMN payment_card TEXT;

-- No default value needed - NULL indicates card info not available
