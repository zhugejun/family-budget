'use client';

import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import type { Expense } from '@/lib/calculations';
import { ExpenseEditDialog } from './expense-edit-dialog';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
  onUpdateSplitRatio: (id: string, member: string, value: string) => void;
  onResetRatio: (id: string) => void;
}

export function ExpenseTable({
  expenses,
  categories,
  familyMembers,
  defaultRatio,
  onUpdate,
  onDelete,
  onUpdateSplitRatio,
  onResetRatio,
}: ExpenseTableProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map((e) => e.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => onDelete(id));
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
  };

  const handleMarkAsSplit = () => {
    selectedIds.forEach((id) => {
      const expense = expenses.find((e) => e.id === id);
      if (expense && !expense.split) {
        onUpdate(id, 'split', true);
      }
    });
  };

  const handleUnmarkSplit = () => {
    selectedIds.forEach((id) => {
      const expense = expenses.find((e) => e.id === id);
      if (expense && expense.split) {
        onUpdate(id, 'split', false);
      }
    });
  };

  const hasSelection = selectedIds.size > 0;

  // Calculate split/unsplit counts
  const selectedExpenses = expenses.filter((e) => selectedIds.has(e.id));
  const hasSplitItems = selectedExpenses.some((e) => e.split);
  const hasNonSplitItems = selectedExpenses.some((e) => !e.split);

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {hasSelection && (
        <div className='mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-200'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-stone-700'>
              {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className='p-1 text-stone-400 hover:text-stone-600 rounded'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleMarkAsSplit}
              disabled={!hasNonSplitItems}
              className='px-3 py-1.5 text-sm bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Mark as Split
            </button>
            <button
              onClick={handleUnmarkSplit}
              disabled={!hasSplitItems}
              className='px-3 py-1.5 text-sm bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Unmark Split
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className='px-3 py-1.5 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors'
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className='bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='px-6 py-5'>
              <h3 className='text-lg font-bold text-stone-800 mb-2'>
                Delete {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''}?
              </h3>
              <p className='text-sm text-stone-600'>
                This action cannot be undone. The selected expenses will be
                permanently removed.
              </p>
            </div>
            <div className='px-6 py-4 bg-stone-50 rounded-b-3xl flex justify-end gap-3'>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className='px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-xl transition-colors font-medium'
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className='px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white/80 backdrop-blur rounded-2xl border border-stone-200 overflow-hidden'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-stone-200 bg-stone-50/50'>
              <th className='w-12 px-4 py-3'>
                <input
                  type='checkbox'
                  checked={
                    selectedIds.size === expenses.length && expenses.length > 0
                  }
                  onChange={toggleSelectAll}
                  className='w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer'
                />
              </th>
              <th className='text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide'>
                Item
              </th>
              <th className='text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide w-32'>
                Category
              </th>
              <th className='text-center px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide w-20'>
                Qty
              </th>
              <th className='text-center px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide w-24'>
                Split
              </th>
              <th className='text-right px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide w-32'>
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className={`group border-b border-stone-100 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  expense.split
                    ? 'bg-violet-50/30 hover:bg-violet-50/50'
                    : 'bg-white hover:bg-stone-50/50'
                } ${
                  selectedIds.has(expense.id)
                    ? 'ring-2 ring-amber-400 ring-inset'
                    : ''
                }`}
              >
                {/* Checkbox */}
                <td className='px-4 py-4'>
                  <input
                    type='checkbox'
                    checked={selectedIds.has(expense.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(expense.id);
                    }}
                    className='w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer'
                  />
                </td>

                {/* Item Name */}
                <td
                  className='px-4 py-4 cursor-pointer'
                  onClick={() => setEditingExpense(expense)}
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-stone-800'>
                      {expense.name}
                    </span>
                    {expense.source === 'receipt' && (
                      <span className='text-xs px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-medium'>
                        OCR
                      </span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td
                  className='px-4 py-4 cursor-pointer'
                  onClick={() => setEditingExpense(expense)}
                >
                  <span className='text-sm text-stone-600'>
                    {expense.category}
                  </span>
                </td>

                {/* Quantity */}
                <td
                  className='px-4 py-4 text-center cursor-pointer'
                  onClick={() => setEditingExpense(expense)}
                >
                  <span className='text-sm text-stone-600'>
                    {expense.quantity}
                  </span>
                </td>

                {/* Split Indicator */}
                <td
                  className='px-4 py-4 cursor-pointer'
                  onClick={() => setEditingExpense(expense)}
                >
                  <div className='flex items-center justify-center'>
                    {expense.split ? (
                      <div className='flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full'>
                        <Users className='w-3.5 h-3.5' />
                        <span className='text-xs font-medium'>Split</span>
                      </div>
                    ) : (
                      <span className='text-xs text-stone-400'>—</span>
                    )}
                  </div>
                </td>

                {/* Price */}
                <td
                  className='px-4 py-4 text-right cursor-pointer'
                  onClick={() => setEditingExpense(expense)}
                >
                  <span className='text-lg font-bold text-stone-800 font-serif'>
                    ${(expense.price * expense.quantity).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='border-t-2 border-stone-300 bg-stone-50'>
              <td colSpan={5} className='px-4 py-4 text-right'>
                <span className='text-sm font-semibold text-stone-700'>
                  Total:
                </span>
              </td>
              <td className='px-4 py-4 text-right'>
                <span className='text-xl font-bold text-stone-800 font-serif'>
                  $
                  {expenses
                    .reduce((sum, exp) => sum + exp.price * exp.quantity, 0)
                    .toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>

        {expenses.length === 0 && (
          <div className='text-center py-12 text-stone-500'>
            No expenses yet. Upload a receipt or add manually!
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingExpense && (
        <ExpenseEditDialog
          expense={editingExpense}
          categories={categories}
          familyMembers={familyMembers}
          defaultRatio={defaultRatio}
          onClose={() => setEditingExpense(null)}
          onUpdate={onUpdate}
          onUpdateSplitRatio={onUpdateSplitRatio}
          onResetRatio={onResetRatio}
        />
      )}
    </>
  );
}
