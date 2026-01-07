'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { RecurringExpense, FrequencyType } from '@/lib/recurring-utils';
import { calculateNextDueDate } from '@/lib/recurring-utils';

interface RecurringExpenseFormProps {
  onSubmit: (
    data: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  onCancel: () => void;
  initialData?: RecurringExpense;
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
}

export function RecurringExpenseForm({
  onSubmit,
  onCancel,
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
      const start = new Date(startDate);
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-stone-200'>
          <h2 className='text-2xl font-bold text-stone-800'>
            {initialData ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
          </h2>
          <button
            onClick={onCancel}
            className='p-2 hover:bg-stone-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
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
              <p className='text-sm font-medium text-stone-700 mb-3'>
                Split Ratio
              </p>
              {familyMembers.map((member) => (
                <div key={member} className='flex items-center gap-3 mb-2'>
                  <label className='w-24 text-sm text-stone-600'>
                    {member}
                  </label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={splitRatio[member] || 0}
                    onChange={(e) => updateSplitRatio(member, e.target.value)}
                    className='flex-1'
                  />
                  <span className='w-16 text-sm font-medium text-stone-800'>
                    {splitRatio[member] || 0}%
                  </span>
                </div>
              ))}
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

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Update'
                : 'Add Recurring Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
