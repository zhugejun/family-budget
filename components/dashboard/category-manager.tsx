'use client';

import React, { useState } from 'react';
import { PieChart, Plus, Edit3, Check, X } from 'lucide-react';

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (name: string) => Promise<void>;
}

export function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await onAddCategory(newCategory);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const startEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const saveEditCategory = async () => {
    if (!editingCategory) return;
    try {
      await onUpdateCategory(editingCategory, editCategoryValue);
      setEditingCategory(null);
      setEditCategoryValue('');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className='mt-6 pt-6 border-t border-stone-200'>
      <h3 className='text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2'>
        <PieChart className='w-4 h-4' />
        Expense Categories
      </h3>

      {/* Add new category */}
      <div className='flex gap-2 mb-3'>
        <input
          type='text'
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          placeholder='New category name'
          className='flex-1 px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300'
        />
        <button
          onClick={handleAddCategory}
          disabled={!newCategory.trim()}
          className='px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <Plus className='w-4 h-4' />
        </button>
      </div>

      {/* Category list */}
      <div className='flex flex-wrap gap-2'>
        {categories.map((cat) => (
          <div
            key={cat}
            className='group flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1'
          >
            {editingCategory === cat ? (
              <>
                <input
                  type='text'
                  value={editCategoryValue}
                  onChange={(e) => setEditCategoryValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditCategory()}
                  className='w-24 px-1 py-0.5 text-sm border border-amber-300 rounded focus:outline-none'
                  autoFocus
                />
                <button
                  onClick={saveEditCategory}
                  className='p-0.5 text-emerald-600 hover:bg-emerald-50 rounded'
                >
                  <Check className='w-3 h-3' />
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className='p-0.5 text-stone-400 hover:bg-stone-100 rounded'
                >
                  <X className='w-3 h-3' />
                </button>
              </>
            ) : (
              <>
                <span className='text-sm text-stone-700'>{cat}</span>
                <button
                  onClick={() => startEditCategory(cat)}
                  className='p-0.5 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Edit3 className='w-3 h-3' />
                </button>
                {categories.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(cat)}
                    className='p-0.5 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3' />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <p className='text-xs text-stone-400 mt-2'>
        Click a category to edit. Receipt scanning will use these categories.
      </p>
    </div>
  );
}
