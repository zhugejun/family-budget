'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Expense } from '@/lib/calculations';

interface ExpenseEditDialogProps {
  expense: Expense;
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onClose: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onUpdateSplitRatio: (id: string, member: string, value: string) => void;
  onResetRatio: (id: string) => void;
}

export function ExpenseEditDialog({
  expense,
  categories,
  familyMembers,
  defaultRatio,
  onClose,
  onUpdate,
  onUpdateSplitRatio,
  onResetRatio,
}: ExpenseEditDialogProps) {
  const [localExpense, setLocalExpense] = useState(expense);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalExpense(expense);
  }, [expense]);

  const handleUpdate = (field: string, value: any) => {
    setLocalExpense((prev) => ({ ...prev, [field]: value }));
    onUpdate(expense.id, field, value);
  };

  const handleSplitRatioChange = (member: string, value: string) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherMember = familyMembers.find((m) => m !== member)!;
    const newRatio = {
      [member]: newValue,
      [otherMember]: 100 - newValue,
    };
    setLocalExpense((prev) => ({ ...prev, split_ratio: newRatio }));
    onUpdateSplitRatio(expense.id, member, value);
  };

  const isRatioDifferentFromDefault = familyMembers.some(
    (member) => localExpense.split_ratio[member] !== defaultRatio[member]
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-stone-200'>
          <h2 className='text-xl font-bold text-stone-800'>Edit Expense</h2>
          <button
            onClick={onClose}
            className='p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='px-6 py-6 space-y-5'>
          {/* Item Name */}
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Item Name
            </label>
            <input
              type='text'
              value={localExpense.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className='w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
            />
          </div>

          {/* Price & Quantity */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Price
              </label>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-stone-500'>
                  $
                </span>
                <input
                  type='number'
                  step='0.01'
                  value={localExpense.price}
                  onChange={(e) =>
                    handleUpdate('price', parseFloat(e.target.value) || 0)
                  }
                  className='w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Quantity
              </label>
              <input
                type='number'
                min='1'
                value={localExpense.quantity}
                onChange={(e) =>
                  handleUpdate('quantity', parseInt(e.target.value) || 1)
                }
                className='w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Category
            </label>
            <select
              value={localExpense.category}
              onChange={(e) => handleUpdate('category', e.target.value)}
              className='w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Total */}
          <div className='p-4 bg-amber-50 rounded-xl border border-amber-200'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-stone-600'>
                Total Amount
              </span>
              <span className='text-2xl font-bold text-amber-700 font-serif'>
                ${(localExpense.price * localExpense.quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Split Toggle */}
          <div className='pt-4 border-t border-stone-200'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <div className='font-medium text-stone-800 mb-1'>
                  Split this expense
                </div>
                <div className='text-sm text-stone-500'>
                  Divide the cost between family members
                </div>
              </div>
              <Switch
                checked={localExpense.split}
                onCheckedChange={(checked) => handleUpdate('split', checked)}
              />
            </div>

            {/* Split Ratio Controls */}
            {localExpense.split && (
              <div className='bg-violet-50 rounded-xl p-4 border border-violet-200'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2 text-sm font-medium text-violet-700'>
                    <Users className='w-4 h-4' />
                    Split Ratio
                  </div>
                  {isRatioDifferentFromDefault && (
                    <button
                      onClick={() => {
                        onResetRatio(expense.id);
                        setLocalExpense((prev) => ({
                          ...prev,
                          split_ratio: { ...defaultRatio },
                        }));
                      }}
                      className='flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-2 py-1 rounded-lg transition-colors'
                    >
                      <RotateCcw className='w-3 h-3' />
                      Reset
                    </button>
                  )}
                </div>

                {/* Compact Single-Line Split Control */}
                <div>
                  {/* Percentages */}
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-emerald-700'>
                      {familyMembers[0]} (
                      {localExpense.split_ratio[familyMembers[0]]}%)
                    </span>
                    <span className='text-sm font-medium text-violet-700'>
                      {familyMembers[1]} (
                      {localExpense.split_ratio[familyMembers[1]]}%)
                    </span>
                  </div>

                  {/* Slider */}
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={localExpense.split_ratio[familyMembers[0]]}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleSplitRatioChange(familyMembers[0], value);
                    }}
                    className='w-full h-2 bg-gradient-to-r from-emerald-300 to-violet-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-stone-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer'
                  />

                  {/* Payment Amounts */}
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-base font-bold text-emerald-700'>
                      $
                      {(
                        (localExpense.price *
                          localExpense.quantity *
                          localExpense.split_ratio[familyMembers[0]]) /
                        100
                      ).toFixed(2)}
                    </span>
                    <span className='text-base font-bold text-violet-700'>
                      $
                      {(
                        (localExpense.price *
                          localExpense.quantity *
                          localExpense.split_ratio[familyMembers[1]]) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-stone-200 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors font-medium'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
