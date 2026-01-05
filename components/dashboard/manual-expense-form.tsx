'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ManualExpenseFormProps {
  categories: string[];
  onAddExpense: (item: {
    name: string;
    price: string;
    category: string;
  }) => void;
}

export function ManualExpenseForm({
  categories,
  onAddExpense,
}: ManualExpenseFormProps) {
  const [manualItem, setManualItem] = useState({
    name: '',
    price: '',
    category: categories[0] || 'Other',
  });

  const handleSubmit = () => {
    if (!manualItem.name || !manualItem.price) return;
    onAddExpense(manualItem);
    setManualItem({ name: '', price: '', category: categories[0] || 'Other' });
  };

  return (
    <div className='bg-white/70 backdrop-blur rounded-3xl p-6 border border-stone-200'>
      <h3 className='font-semibold text-stone-800 mb-4 flex items-center gap-2'>
        <Plus className='w-5 h-5 text-amber-600' />
        Add Expense Manually
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
        <input
          type='text'
          placeholder='Item name'
          value={manualItem.name}
          onChange={(e) =>
            setManualItem((prev) => ({ ...prev, name: e.target.value }))
          }
          className='px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
        />
        <input
          type='number'
          placeholder='Price'
          step='0.01'
          value={manualItem.price}
          onChange={(e) =>
            setManualItem((prev) => ({ ...prev, price: e.target.value }))
          }
          className='px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
        />
        <select
          value={manualItem.category}
          onChange={(e) =>
            setManualItem((prev) => ({
              ...prev,
              category: e.target.value,
            }))
          }
          className='px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!manualItem.name || !manualItem.price}
        className='w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200'
      >
        Add Expense
      </button>
    </div>
  );
}
