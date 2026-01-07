'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  X,
  Search,
  Filter,
} from 'lucide-react';
import type { Expense } from '@/lib/calculations';
import { ExpenseEditDialog } from './expense-edit-dialog';

interface ExpenseGroupsProps {
  expenses: Expense[];
  categories: string[];
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
  onUpdateSplitRatio: (id: string, member: string, value: string) => void;
  onResetRatio: (id: string) => void;
}

interface ExpenseGroup {
  id: string;
  name: string;
  date: string;
  expenses: Expense[];
  total: number;
}

export function ExpenseGroups({
  expenses,
  categories,
  familyMembers,
  defaultRatio,
  onUpdate,
  onDelete,
  onUpdateSplitRatio,
  onResetRatio,
}: ExpenseGroupsProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Group expenses by receipt_group or source
  const groups = useMemo(() => {
    const grouped = new Map<string, ExpenseGroup>();

    expenses.forEach((expense) => {
      const groupKey =
        expense.receipt_group ||
        (expense.source === 'receipt' ? 'receipt-ungrouped' : 'manual');

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          id: groupKey,
          name:
            expense.receipt_group ||
            (expense.source === 'receipt' ? 'Receipt Items' : 'Manual Entries'),
          date: expense.created_at || new Date().toISOString(),
          expenses: [],
          total: 0,
        });
      }

      const group = grouped.get(groupKey)!;
      group.expenses.push(expense);
      group.total += expense.price * expense.quantity;
    });

    // Convert to array and sort by date (newest first)
    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses]);

  // Filter groups based on search and category
  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => {
        const filteredExpenses = group.expenses.filter((expense) => {
          const matchesSearch = searchQuery
            ? expense.name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
          const matchesCategory =
            categoryFilter === 'all' || expense.category === categoryFilter;
          return matchesSearch && matchesCategory;
        });

        if (filteredExpenses.length === 0) return null;

        return {
          ...group,
          expenses: filteredExpenses,
          total: filteredExpenses.reduce(
            (sum, exp) => sum + exp.price * exp.quantity,
            0
          ),
        };
      })
      .filter((group): group is ExpenseGroup => group !== null);
  }, [groups, searchQuery, categoryFilter]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleGroupSelection = (group: ExpenseGroup) => {
    const groupExpenseIds = group.expenses.map((e) => e.id);
    const allSelected = groupExpenseIds.every((id) => selectedIds.has(id));

    const newSelected = new Set(selectedIds);
    if (allSelected) {
      groupExpenseIds.forEach((id) => newSelected.delete(id));
    } else {
      groupExpenseIds.forEach((id) => newSelected.add(id));
    }
    setSelectedIds(newSelected);
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
  const selectedExpenses = expenses.filter((e) => selectedIds.has(e.id));
  const hasSplitItems = selectedExpenses.some((e) => e.split);
  const hasNonSplitItems = selectedExpenses.some((e) => !e.split);

  const grandTotal = filteredGroups.reduce(
    (sum, group) => sum + group.total,
    0
  );

  return (
    <>
      {/* Search and Filter Bar */}
      <div className='mb-4 flex flex-col sm:flex-row gap-3'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400' />
          <input
            type='text'
            placeholder='Search expenses...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
          />
        </div>
        <div className='relative'>
          <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400' />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent appearance-none cursor-pointer'
          >
            <option value='all'>All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Expense Groups */}
      <div className='space-y-3'>
        {filteredGroups.length === 0 ? (
          <div className='bg-white/50 rounded-3xl p-12 text-center'>
            <p className='text-stone-500'>
              {searchQuery || categoryFilter !== 'all'
                ? 'No expenses match your filters.'
                : 'No expenses yet. Upload a receipt or add manually!'}
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const groupExpenseIds = group.expenses.map((e) => e.id);
            const allSelected = groupExpenseIds.every((id) =>
              selectedIds.has(id)
            );
            const someSelected = groupExpenseIds.some((id) =>
              selectedIds.has(id)
            );

            return (
              <div
                key={group.id}
                className='bg-white/80 backdrop-blur rounded-2xl border border-stone-200 overflow-hidden'
              >
                {/* Group Header */}
                <div className='flex items-center gap-3 p-4 hover:bg-stone-50/50 transition-colors'>
                  <input
                    type='checkbox'
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleGroupSelection(group)}
                    className='w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer'
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className='flex-1 flex items-center gap-3 text-left'
                  >
                    {isExpanded ? (
                      <ChevronDown className='w-5 h-5 text-stone-400' />
                    ) : (
                      <ChevronRight className='w-5 h-5 text-stone-400' />
                    )}
                    <div className='flex-1'>
                      <div className='font-semibold text-stone-800'>
                        {group.name}
                      </div>
                      <div className='text-xs text-stone-500'>
                        {new Date(group.date).toLocaleDateString()} •{' '}
                        {group.expenses.length} item
                        {group.expenses.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className='text-lg font-bold text-stone-800 font-serif'>
                      ${group.total.toFixed(2)}
                    </div>
                  </button>
                </div>

                {/* Group Items (Expanded) */}
                {isExpanded && (
                  <div className='border-t border-stone-200'>
                    <table className='w-full'>
                      <tbody>
                        {group.expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className={`group border-b border-stone-100 last:border-0 transition-all hover:bg-stone-50 ${
                              expense.split ? 'bg-violet-50/30' : ''
                            } ${
                              selectedIds.has(expense.id)
                                ? 'ring-2 ring-inset ring-amber-400'
                                : ''
                            }`}
                          >
                            <td className='w-12 px-4 py-3'>
                              <input
                                type='checkbox'
                                checked={selectedIds.has(expense.id)}
                                onChange={() => toggleSelection(expense.id)}
                                className='w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer'
                              />
                            </td>
                            <td
                              className='px-4 py-3 cursor-pointer'
                              onClick={() => setEditingExpense(expense)}
                            >
                              <span className='font-medium text-stone-800'>
                                {expense.name}
                              </span>
                            </td>
                            <td
                              className='px-4 py-3 cursor-pointer'
                              onClick={() => setEditingExpense(expense)}
                            >
                              <span className='text-sm text-stone-600'>
                                {expense.category}
                              </span>
                            </td>
                            <td
                              className='px-4 py-3 text-center cursor-pointer'
                              onClick={() => setEditingExpense(expense)}
                            >
                              <span className='text-sm text-stone-600'>
                                {expense.quantity}
                              </span>
                            </td>
                            <td
                              className='px-4 py-3 cursor-pointer'
                              onClick={() => setEditingExpense(expense)}
                            >
                              <div className='flex items-center justify-center'>
                                {expense.split ? (
                                  <div className='flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full'>
                                    <Users className='w-3.5 h-3.5' />
                                    <span className='text-xs font-medium'>
                                      Split
                                    </span>
                                  </div>
                                ) : (
                                  <span className='text-xs text-stone-400'>
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className='px-4 py-3 text-right cursor-pointer'
                              onClick={() => setEditingExpense(expense)}
                            >
                              <span className='text-base font-bold text-stone-800 font-serif'>
                                ${(expense.price * expense.quantity).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Grand Total */}
      {filteredGroups.length > 0 && (
        <div className='mt-4 bg-stone-800 rounded-2xl p-4 flex items-center justify-between'>
          <span className='text-sm font-semibold text-white'>Grand Total:</span>
          <span className='text-2xl font-bold text-white font-serif'>
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      )}

      {/* Edit Dialog */}
      <ExpenseEditDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        familyMembers={familyMembers}
        defaultRatio={defaultRatio}
        onUpdate={onUpdate}
        onUpdateSplitRatio={onUpdateSplitRatio}
        onResetRatio={onResetRatio}
      />
    </>
  );
}
