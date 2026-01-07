'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import type { RecurringExpense, FrequencyType } from '@/lib/recurring-utils';

interface RecurringExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  initialData?: RecurringExpense;
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
}

export function RecurringExpenseForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  categories,
  familyMembers,
  defaultRatio,
}: RecurringExpenseFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState(
    initialData?.category || categories[0] || ''
  );
  const [frequency, setFrequency] = useState<FrequencyType>(
    initialData?.frequency || 'monthly'
  );
  const [startDate, setStartDate] = useState(
    initialData?.start_date || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(initialData?.end_date || '');
  const [hasEndDate, setHasEndDate] = useState(!!initialData?.end_date);
  const [split, setSplit] = useState(initialData?.split || false);
  const [splitRatio, setSplitRatio] = useState(
    initialData?.split_ratio || defaultRatio
  );
  const [autoCreate, setAutoCreate] = useState(
    initialData?.auto_create ?? true
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate next_due_date based on start_date and frequency
      const nextDue = initialData?.next_due_date || startDate;

      await onSubmit({
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        frequency,
        start_date: startDate,
        end_date: hasEndDate && endDate ? endDate : undefined,
        next_due_date: nextDue,
        split,
        split_ratio: splitRatio,
        auto_create: autoCreate,
        is_active: initialData?.is_active ?? true,
        notes: notes.trim() || undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting recurring expense:', error);
      alert('Failed to save recurring expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSplitRatio = (member: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherMember = familyMembers.find((m) => m !== member)!;
    setSplitRatio({
      [member]: numValue,
      [otherMember]: 100 - numValue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
          </DialogTitle>
          <DialogDescription>
            Set up a subscription, rent, or other recurring bill
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='space-y-6 overflow-y-auto pr-2 max-h-[60vh]'
        >
          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Name <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Netflix Subscription'
              required
              className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>

          {/* Amount & Category Row */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Amount <span className='text-rose-500'>*</span>
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-2.5 text-stone-500'>
                  $
                </span>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='15.99'
                  required
                  className='w-full pl-8 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Category <span className='text-rose-500'>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Frequency <span className='text-rose-500'>*</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as FrequencyType)}
              required
              className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='biweekly'>Every 2 Weeks</option>
              <option value='monthly'>Monthly</option>
              <option value='yearly'>Yearly</option>
            </select>
          </div>

          {/* Start Date & End Date Row */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Start Date <span className='text-rose-500'>*</span>
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='flex items-center text-sm font-medium text-stone-700 mb-2'>
                <input
                  type='checkbox'
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className='mr-2'
                />
                End Date (Optional)
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!hasEndDate}
                min={startDate}
                className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed'
              />
            </div>
          </div>

          {/* Split toggle */}
          <div>
            <label className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={split}
                onChange={(e) => setSplit(e.target.checked)}
                className='w-5 h-5 text-amber-600 rounded focus:ring-amber-500'
              />
              <span className='text-sm font-medium text-stone-700'>
                Split this expense between family members
              </span>
            </label>
          </div>

          {/* Split Ratio */}
          {split && (
            <div className='bg-amber-50 p-4 rounded-xl'>
              <p className='text-sm font-medium text-stone-700 mb-4'>
                Split Ratio
              </p>

              {/* Member labels and percentages */}
              <div className='flex items-center justify-between mb-3'>
                <div className='text-center'>
                  <p className='text-xs text-stone-600 mb-1'>
                    {familyMembers[0]}
                  </p>
                  <p className='text-xl font-bold text-emerald-600'>
                    {splitRatio[familyMembers[0]] || 0}%
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-xs text-stone-600 mb-1'>
                    {familyMembers[1]}
                  </p>
                  <p className='text-xl font-bold text-violet-600'>
                    {splitRatio[familyMembers[1]] || 0}%
                  </p>
                </div>
              </div>

              {/* Slider */}
              <Slider
                value={[splitRatio[familyMembers[0]] || 50]}
                onValueChange={(value) =>
                  updateSplitRatio(familyMembers[0], value[0].toString())
                }
                min={0}
                max={100}
                step={1}
                className='w-full'
              />

              {/* Visual guide */}
              <div className='flex justify-between text-xs text-stone-400 mt-2'>
                <span>← {familyMembers[0]}</span>
                <span>{familyMembers[1]} →</span>
              </div>
            </div>
          )}

          {/* Auto-create toggle */}
          <div>
            <label className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={autoCreate}
                onChange={(e) => setAutoCreate(e.target.checked)}
                className='w-5 h-5 text-amber-600 rounded focus:ring-amber-500'
              />
              <span className='text-sm font-medium text-stone-700'>
                Automatically create expense entries when due
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add any additional notes...'
              rows={3}
              className='w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none'
            />
          </div>
        </form>

        <DialogFooter>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting
              ? 'Saving...'
              : initialData
              ? 'Update'
              : 'Add Recurring Expense'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
