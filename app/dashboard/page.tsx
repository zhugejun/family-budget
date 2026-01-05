'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Loader2,
  DollarSign,
  PieChart,
  Settings,
  Camera,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { processReceiptWithClaude } from '@/lib/claude';
import { calculateSplits } from '@/lib/calculations';
import { ExpenseGroups } from '@/components/dashboard/expense-groups';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ReceiptUploadZone } from '@/components/dashboard/receipt-upload-zone';
import { ManualExpenseForm } from '@/components/dashboard/manual-expense-form';
import { SettingsPanel } from '@/components/dashboard/settings-panel';

const FAMILY_MEMBERS = ['You', 'Partner'];

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    expenses,
    loading: expensesLoading,
    addMultipleExpenses,
    updateExpense,
    deleteExpense,
  } = useExpenses(user?.id);
  const {
    categories,
    addCategory: addCategoryHook,
    updateCategory: updateCategoryHook,
    deleteCategory: deleteCategoryHook,
  } = useCategories(user?.id);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const [defaultRatio, setDefaultRatio] = useState({
    [FAMILY_MEMBERS[0]]: 50,
    [FAMILY_MEMBERS[1]]: 50,
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleReceiptProcessing = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const items = await processReceiptWithClaude(base64Image, categories);

      const newExpenses = items.map((item) => ({
        name: item.name,
        price: parseFloat(item.price.toString()) || 0,
        quantity: item.quantity || 1,
        category: item.category || 'Other',
        split: false,
        split_ratio: { ...defaultRatio },
        source: 'manual' as const,
      }));

      await addMultipleExpenses(newExpenses);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert(
        'Could not process receipt. Please try again or add items manually.'
      );
    }
    setIsProcessing(false);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (base64) handleReceiptProcessing(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddManualExpense = async (item: {
    name: string;
    price: string;
    category: string;
  }) => {
    const newExpense = {
      name: item.name,
      price: parseFloat(item.price) || 0,
      quantity: 1,
      category: item.category,
      split: false,
      split_ratio: { ...defaultRatio },
      source: 'manual' as const,
    };

    await addMultipleExpenses([newExpense]);
  };

  const updateExpenseField = (id: string, field: string, value: any) => {
    updateExpense(id, { [field]: value });
  };

  const updateSplitRatio = (id: string, member: string, value: string) => {
    const expense = expenses.find((exp) => exp.id === id);
    if (!expense) return;

    const newRatio = { ...expense.split_ratio, [member]: parseInt(value) || 0 };
    updateExpense(id, { split_ratio: newRatio });
  };

  const resetToDefaultRatio = (id: string) => {
    updateExpense(id, { split_ratio: { ...defaultRatio } });
  };

  const updateDefaultRatio = (member: string, value: string) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherMember = FAMILY_MEMBERS.find((m) => m !== member)!;
    setDefaultRatio({
      [member]: newValue,
      [otherMember]: 100 - newValue,
    });
  };

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + exp.price * exp.quantity,
    0
  );
  const splits = calculateSplits(expenses, FAMILY_MEMBERS);

  if (expensesLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-12 h-12 text-amber-600 animate-spin' />
          <p className='text-stone-600 font-medium'>Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'>
      {/* Header */}
      <header className='bg-white/70 backdrop-blur-lg border-b border-amber-200/50 sticky top-0 z-50'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200'>
                <Receipt className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-stone-800 font-serif'>
                Family Budget
              </h1>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 bg-amber-100/80 rounded-full px-4 py-2'>
                <DollarSign className='w-4 h-4 text-amber-600' />
                <span className='font-semibold text-amber-800'>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all ${
                  showSettings
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Settings className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <SettingsPanel
              familyMembers={FAMILY_MEMBERS}
              defaultRatio={defaultRatio}
              onUpdateDefaultRatio={updateDefaultRatio}
              categories={categories}
              onAddCategory={addCategoryHook}
              onUpdateCategory={updateCategoryHook}
              onDeleteCategory={deleteCategoryHook}
            />
          )}
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-6 py-8'>
        {/* Summary Cards */}
        <div className='grid grid-cols-2 gap-4 mb-8'>
          {FAMILY_MEMBERS.map((member, idx) => (
            <SummaryCard
              key={member}
              member={member}
              amount={splits[member]}
              variant={idx === 0 ? 'emerald' : 'violet'}
            />
          ))}
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6'>
          {[
            { id: 'upload', icon: Camera, label: 'Scan Receipt' },
            { id: 'manual', icon: Plus, label: 'Add Manual' },
            {
              id: 'expenses',
              icon: PieChart,
              label: `Expenses (${expenses.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-800 text-white shadow-lg'
                  : 'bg-white/60 text-stone-600 hover:bg-white'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <ReceiptUploadZone
            isProcessing={isProcessing}
            onImageUpload={handleImageUpload}
          />
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <ManualExpenseForm
            categories={categories}
            onAddExpense={handleAddManualExpense}
          />
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <ExpenseGroups
            expenses={expenses}
            categories={categories}
            familyMembers={FAMILY_MEMBERS}
            defaultRatio={defaultRatio}
            onUpdate={updateExpenseField}
            onDelete={deleteExpense}
            onUpdateSplitRatio={updateSplitRatio}
            onResetRatio={resetToDefaultRatio}
          />
        )}

        {/* Info Box */}
        <div className='mt-8 bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-6 text-white'>
          <h3 className='font-semibold mb-2 flex items-center gap-2'>
            <span className='text-lg'>💡</span> How it works
          </h3>
          <ul className='text-stone-300 text-sm space-y-1'>
            <li>
              • <strong>Scan Receipt:</strong> Upload a photo and AI extracts
              items automatically
            </li>
            <li>
              • <strong>Edit if needed:</strong> Click the pencil icon to fix
              OCR mistakes
            </li>
            <li>
              • <strong>Split expenses:</strong> Toggle split and set custom
              ratios (50/50, 70/30, etc.)
            </li>
            <li>
              • <strong>Track totals:</strong> See who owes what at a glance
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
