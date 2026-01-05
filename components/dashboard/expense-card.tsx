'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, Check, Users, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Expense } from '@/lib/calculations';

interface ExpenseCardProps {
  expense: Expense;
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onUpdate: (id: string, field: keyof Expense, value: any) => void;
  onDelete: (id: string) => void;
  onUpdateSplitRatio: (id: string, member: string, value: string) => void;
  onResetRatio: (id: string) => void;
}

export function ExpenseCard({
  expense,
  categories,
  familyMembers,
  defaultRatio,
  onUpdate,
  onDelete,
  onUpdateSplitRatio,
  onResetRatio,
}: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const isRatioDifferentFromDefault = familyMembers.some(
    (member) => expense.split_ratio[member] !== defaultRatio[member]
  );

  return (
    <div className='bg-white/80 backdrop-blur rounded-2xl p-4 border border-stone-200 hover:shadow-lg transition-all'>
      {isEditing ? (
        /* Edit Mode */
        <div className='space-y-3'>
          <div className='flex gap-3'>
            <input
              type='text'
              value={expense.name}
              onChange={(e) => onUpdate(expense.id, 'name', e.target.value)}
              className='flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm'
            />
            <input
              type='number'
              value={expense.price}
              step='0.01'
              onChange={(e) =>
                onUpdate(expense.id, 'price', parseFloat(e.target.value) || 0)
              }
              className='w-24 px-3 py-2 rounded-lg border border-stone-200 text-sm'
            />
            <button
              onClick={() => setIsEditing(false)}
              className='p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200'
            >
              <Check className='w-4 h-4' />
            </button>
          </div>
          <select
            value={expense.category}
            onChange={(e) => onUpdate(expense.id, 'category', e.target.value)}
            className='w-full px-3 py-2 rounded-lg border border-stone-200 text-sm'
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* View Mode */
        <div>
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <h4 className='font-medium text-stone-800'>{expense.name}</h4>
                <span className='text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full'>
                  {expense.category}
                </span>
                {expense.source === 'receipt' && (
                  <span className='text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full'>
                    OCR
                  </span>
                )}
              </div>
              <p className='text-lg font-bold text-stone-700 font-serif'>
                ${(expense.price * expense.quantity).toFixed(2)}
                {expense.quantity > 1 && (
                  <span className='text-sm font-normal text-stone-400 ml-1'>
                    ×{expense.quantity}
                  </span>
                )}
              </p>
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setIsEditing(true)}
                className='p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg'
              >
                <Edit3 className='w-4 h-4' />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className='p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Split Controls */}
          <div className='pt-3 border-t border-stone-100'>
            <div className='flex items-center gap-3'>
              <Switch
                checked={expense.split}
                onCheckedChange={(checked) =>
                  onUpdate(expense.id, 'split', checked)
                }
              />
              <label className='text-sm text-stone-600 cursor-pointer'>
                Split this expense
              </label>
            </div>

            {expense.split && (
              <div className='mt-3 flex items-center gap-4 bg-violet-50 rounded-xl p-3'>
                <Users className='w-4 h-4 text-violet-500 flex-shrink-0' />
                {familyMembers.map((member) => (
                  <div key={member} className='flex items-center gap-2'>
                    <span className='text-sm text-stone-600'>{member}</span>
                    <input
                      type='number'
                      value={expense.split_ratio[member]}
                      onChange={(e) =>
                        onUpdateSplitRatio(expense.id, member, e.target.value)
                      }
                      className='w-16 px-2 py-1 rounded-lg border border-violet-200 text-sm text-center'
                    />
                    <span className='text-sm text-stone-400'>%</span>
                  </div>
                ))}
                {isRatioDifferentFromDefault && (
                  <button
                    onClick={() => onResetRatio(expense.id)}
                    className='ml-auto flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-2 py-1 rounded-lg transition-colors'
                    title='Reset to default ratio'
                  >
                    <RotateCcw className='w-3 h-3' />
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
