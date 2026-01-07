'use client';

import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { RecurringExpense } from '@/lib/recurring-utils';
import {
  getFrequencyText,
  formatDate,
  getRecurringStatus,
  calculateAnnualCost,
} from '@/lib/recurring-utils';

interface RecurringExpensesListProps {
  recurring: RecurringExpense[];
  onEdit: (recurring: RecurringExpense) => void;
  onDelete: (id: string) => Promise<boolean>;
  onToggleActive: (id: string) => Promise<boolean>;
  loading?: boolean;
}

export function RecurringExpensesList({
  recurring,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false,
}: RecurringExpensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (rec: RecurringExpense) => {
    if (
      !confirm(
        `Delete recurring expense "${rec.name}"?\n\nThis will not delete previously generated expenses.`
      )
    ) {
      return;
    }

    setDeletingId(rec.id);
    await onDelete(rec.id);
    setDeletingId(null);
  };

  const handleToggleActive = async (rec: RecurringExpense) => {
    setTogglingId(rec.id);
    await onToggleActive(rec.id);
    setTogglingId(null);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full' />
      </div>
    );
  }

  if (recurring.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        <div className='w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4'>
          <RefreshCw className='w-10 h-10 text-stone-400' />
        </div>
        <h3 className='text-xl font-bold text-stone-800 mb-2'>
          No Recurring Expenses
        </h3>
        <p className='text-stone-500 text-center max-w-md'>
          Add subscriptions, rent, or other recurring bills to automatically
          track them
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {recurring.map((rec) => {
        const status = getRecurringStatus(rec);
        const annualCost = calculateAnnualCost(rec.amount, rec.frequency);

        return (
          <div
            key={rec.id}
            className={`bg-white rounded-xl p-4 border-2 transition-all ${
              status.status === 'due'
                ? 'border-rose-200 shadow-lg shadow-rose-100'
                : status.status === 'paused'
                ? 'border-stone-200 opacity-60'
                : 'border-stone-200 hover:border-amber-200'
            }`}
          >
            <div className='flex items-start justify-between gap-4'>
              {/* Left: Details */}
              <div className='flex-1'>
                <div className='flex items-start gap-3 mb-2'>
                  <div
                    className={`p-2 rounded-lg ${
                      status.status === 'due'
                        ? 'bg-rose-100'
                        : status.status === 'paused'
                        ? 'bg-stone-100'
                        : 'bg-emerald-100'
                    }`}
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        status.status === 'due'
                          ? 'text-rose-600'
                          : status.status === 'paused'
                          ? 'text-stone-500'
                          : 'text-emerald-600'
                      }`}
                    />
                  </div>

                  <div className='flex-1'>
                    <h3 className='font-bold text-stone-800 text-lg'>
                      {rec.name}
                    </h3>
                    <p className='text-sm text-stone-600'>{rec.category}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-3'>
                  <div>
                    <p className='text-xs text-stone-500 mb-1'>Amount</p>
                    <p className='font-semibold text-stone-800'>
                      ${rec.amount.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-stone-500 mb-1'>Frequency</p>
                    <p className='font-semibold text-stone-800'>
                      {getFrequencyText(rec.frequency)}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-stone-500 mb-1'>Next Due</p>
                    <p className='font-semibold text-stone-800'>
                      {formatDate(rec.next_due_date)}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-stone-500 mb-1'>Annual Cost</p>
                    <p className='font-semibold text-stone-800'>
                      ${annualCost.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Status & Notes */}
                <div className='flex items-center gap-4 mt-3'>
                  <div className={`flex items-center gap-1.5 ${status.color}`}>
                    {status.status === 'due' && (
                      <AlertCircle className='w-4 h-4' />
                    )}
                    {status.status === 'paused' && (
                      <Pause className='w-4 h-4' />
                    )}
                    <span className='text-sm font-medium'>
                      {status.message}
                    </span>
                  </div>

                  {rec.split && (
                    <span className='text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded'>
                      Split
                    </span>
                  )}

                  {!rec.auto_create && (
                    <span className='text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded'>
                      Manual
                    </span>
                  )}

                  {rec.end_date && (
                    <span className='text-xs text-stone-500'>
                      Ends {formatDate(rec.end_date)}
                    </span>
                  )}
                </div>

                {rec.notes && (
                  <p className='text-sm text-stone-600 mt-2 italic'>
                    {rec.notes}
                  </p>
                )}
              </div>

              {/* Right: Actions */}
              <div className='flex flex-col gap-2'>
                <button
                  onClick={() => handleToggleActive(rec)}
                  disabled={togglingId === rec.id}
                  className={`p-2 rounded-lg transition-colors ${
                    rec.is_active
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600'
                  }`}
                  title={rec.is_active ? 'Pause' : 'Resume'}
                >
                  {togglingId === rec.id ? (
                    <div className='w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin' />
                  ) : rec.is_active ? (
                    <Pause className='w-5 h-5' />
                  ) : (
                    <Play className='w-5 h-5' />
                  )}
                </button>

                <button
                  onClick={() => onEdit(rec)}
                  className='p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-lg transition-colors'
                  title='Edit'
                >
                  <Edit2 className='w-5 h-5' />
                </button>

                <button
                  onClick={() => handleDelete(rec)}
                  disabled={deletingId === rec.id}
                  className='p-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors disabled:opacity-50'
                  title='Delete'
                >
                  {deletingId === rec.id ? (
                    <div className='w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <Trash2 className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
