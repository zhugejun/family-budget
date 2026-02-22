'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Loader2,
  DollarSign,
  PieChart,
  Settings,
  Camera,
  Plus,
  BarChart3,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { useLocalExpenses } from '@/hooks/useLocalExpenses';
import { useLocalCategories } from '@/hooks/useLocalCategories';
import { useLocalReceiptImages } from '@/hooks/useLocalReceiptImages';
import { useLocalRecurring } from '@/hooks/useLocalRecurring';
import { useLocalSettings } from '@/hooks/useLocalSettings';
import { processReceiptWithClaude } from '@/lib/claude';
import { calculateSplits } from '@/lib/calculations';
import { filterByMonth, getCurrentMonth } from '@/lib/date-utils';
import { processReceiptFile, validateFileSize } from '@/lib/image-processing';
import { ExpenseGroups } from '@/components/dashboard/expense-groups';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ReceiptUploadZone } from '@/components/dashboard/receipt-upload-zone';
import { ManualExpenseForm } from '@/components/dashboard/manual-expense-form';
import { SettingsDialog } from '@/components/dashboard/settings-panel';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { AnalyticsPanel } from '@/components/dashboard/analytics-panel';
import { ReceiptGallery } from '@/components/dashboard/receipt-gallery';
import { RecurringExpenseForm } from '@/components/dashboard/recurring-expense-form';
import { RecurringExpensesList } from '@/components/dashboard/recurring-expenses-list';
import type { RecurringExpense } from '@/lib/recurring-utils';

const FAMILY_MEMBERS = ['You', 'Partner'];

export default function DashboardPage() {
  const {
    expenses,
    loading: expensesLoading,
    addMultipleExpenses,
    updateExpense,
    deleteExpense,
    refetch: refetchExpenses,
  } = useLocalExpenses();
  const {
    categories,
    addCategory: addCategoryHook,
    updateCategory: updateCategoryHook,
    deleteCategory: deleteCategoryHook,
  } = useLocalCategories();
  const {
    images: receiptImages,
    loading: imagesLoading,
    addImage: uploadImage,
    deleteImage,
    refetch: refetchImages,
  } = useLocalReceiptImages();
  const {
    recurring,
    loading: recurringLoading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    refetch: refetchRecurring,
  } = useLocalRecurring();
  const { settings } = useLocalSettings();

  // Wrapper function to upload image file
  const uploadImageFile = async (file: File, receiptGroup: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiptGroup', receiptGroup);

    const response = await fetch('/api/local/receipts', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.image;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringExpense | null>(null);

  const [defaultRatio, setDefaultRatio] = useState({
    [FAMILY_MEMBERS[0]]: 50,
    [FAMILY_MEMBERS[1]]: 50,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Month filtering state
  const [selectedYear, setSelectedYear] = useState(
    () => getCurrentMonth().year,
  );
  const [selectedMonth, setSelectedMonth] = useState(
    () => getCurrentMonth().month,
  );

  // Filter expenses by selected month
  const filteredExpenses = filterByMonth(expenses, selectedYear, selectedMonth);

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Auto-generate due recurring expenses on mount
  useEffect(() => {
    const generateDueExpenses = async () => {
      try {
        const response = await fetch('/api/local/recurring/generate', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.generated > 0) {
            console.log(`Generated ${data.generated} recurring expenses`);
            // Refetch expenses and recurring to update UI
            refetchRecurring();
            refetchExpenses();
          }
        }
      } catch (error) {
        console.error('Error generating recurring expenses:', error);
      }
    };

    generateDueExpenses();
  }, []);

  const handleReceiptProcessing = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const { items, payment_card, receipt_date } =
        await processReceiptWithClaude(base64Image, categories);

      // Generate receipt group name with receipt date or current timestamp
      const groupDate = receipt_date
        ? new Date(receipt_date + 'T12:00:00')
        : new Date();
      const now = new Date();
      const receiptGroup = `Receipt - ${groupDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} ${now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;

      // If receipt_date is available, use it as the created_at timestamp
      const createdAt = receipt_date
        ? new Date(receipt_date + 'T12:00:00').toISOString()
        : undefined;

      const newExpenses = items.map((item) => ({
        name: item.name,
        price: parseFloat(item.price.toString()) || 0,
        quantity: item.quantity || 1,
        category: item.category || 'Other',
        split: false,
        split_ratio: { ...defaultRatio },
        source: 'receipt' as const,
        receipt_group: receiptGroup,
        payment_card: payment_card ?? undefined,
        created_at: createdAt,
      }));

      await addMultipleExpenses(newExpenses);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert(
        'Could not process receipt. Please try again or add items manually.',
      );
    }
    setIsProcessing(false);
  };

  // State for batch upload progress
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    currentFile?: string;
  } | null>(null);

  const handleMultipleImageUpload = async (files: File[]) => {
    // Validate all file sizes first
    const oversizedFiles = files.filter((file) => !validateFileSize(file, 10));
    if (oversizedFiles.length > 0) {
      alert(
        `${oversizedFiles.length} file(s) exceed 10MB limit. They will be skipped.`,
      );
      files = files.filter((file) => validateFileSize(file, 10));
    }

    if (files.length === 0) return;

    setIsProcessing(true);
    setUploadProgress({
      total: files.length,
      completed: 0,
      failed: 0,
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setUploadProgress({
        total: files.length,
        completed: i,
        failed: failCount,
        currentFile: file.name,
      });

      try {
        // Process the file (compress, convert to grayscale, or convert PDF to image)
        const processedBase64 = await processReceiptFile(file);

        // Process receipt with AI
        const { items, payment_card, receipt_date } =
          await processReceiptWithClaude(processedBase64, categories);

        // Generate receipt group name using receipt date if available
        const groupDate = receipt_date
          ? new Date(receipt_date + 'T12:00:00')
          : new Date();
        const now = new Date();
        const receiptGroup = `Receipt - ${groupDate.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          },
        )} ${now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })} (${i + 1}/${files.length})`;

        // If receipt_date is available, use it as the created_at timestamp
        const createdAt = receipt_date
          ? new Date(receipt_date + 'T12:00:00').toISOString()
          : undefined;

        // Upload original image (keep original for gallery)
        const uploadedImage = await uploadImageFile(file, receiptGroup);

        // Create expenses
        const newExpenses = items.map((item) => ({
          name: item.name,
          price: parseFloat(item.price.toString()) || 0,
          quantity: item.quantity || 1,
          category: item.category || 'Other',
          split: false,
          split_ratio: { ...defaultRatio },
          source: 'receipt' as const,
          receipt_group: receiptGroup,
          receipt_image_id: uploadedImage?.id,
          payment_card: payment_card ?? undefined,
          created_at: createdAt,
        }));

        await addMultipleExpenses(newExpenses);
        successCount++;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        failCount++;
      }
    }

    // Final update
    setUploadProgress({
      total: files.length,
      completed: successCount,
      failed: failCount,
    });

    // Refresh the images gallery
    if (successCount > 0) {
      await refetchImages();
    }

    // Show summary
    setTimeout(() => {
      setIsProcessing(false);
      setUploadProgress(null);

      if (failCount > 0) {
        alert(
          `Batch processing complete!\n✓ ${successCount} successful\n✗ ${failCount} failed`,
        );
      }
    }, 1500);
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

  const handleMoveToMonth = async (
    expenseIds: string[],
    targetDate: string,
  ) => {
    for (const id of expenseIds) {
      await updateExpense(id, { created_at: targetDate });
    }
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

  // Recurring expense handlers
  const handleAddRecurring = async (
    data: Omit<
      RecurringExpense,
      'id' | 'user_id' | 'created_at' | 'updated_at'
    >,
  ) => {
    await addRecurring(data);
    setShowRecurringForm(false);
  };

  const handleEditRecurring = (recurring: RecurringExpense) => {
    setEditingRecurring(recurring);
    setShowRecurringForm(true);
  };

  const handleUpdateRecurring = async (
    data: Omit<
      RecurringExpense,
      'id' | 'user_id' | 'created_at' | 'updated_at'
    >,
  ) => {
    if (!editingRecurring) return;
    await updateRecurring(editingRecurring.id, data);
    setShowRecurringForm(false);
    setEditingRecurring(null);
  };

  const handleCancelRecurringForm = () => {
    setShowRecurringForm(false);
    setEditingRecurring(null);
  };

  const updateDefaultRatio = (member: string, value: string) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherMember = FAMILY_MEMBERS.find((m) => m !== member)!;
    setDefaultRatio({
      [member]: newValue,
      [otherMember]: 100 - newValue,
    });
  };

  // Calculate totals from filtered expenses
  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + exp.price * exp.quantity,
    0,
  );
  const splits = calculateSplits(filteredExpenses, FAMILY_MEMBERS);

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
        <div className='max-w-6xl mx-auto px-6 py-4'>
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

          {/* Settings Dialog */}
          <SettingsDialog
            open={showSettings}
            onOpenChange={setShowSettings}
            familyMembers={FAMILY_MEMBERS}
            defaultRatio={defaultRatio}
            onUpdateDefaultRatio={updateDefaultRatio}
            categories={categories}
            onAddCategory={addCategoryHook}
            onUpdateCategory={updateCategoryHook}
            onDeleteCategory={deleteCategoryHook}
          />
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-8'>
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

        {/* Month Selector */}
        <div className='mb-6'>
          <MonthSelector
            year={selectedYear}
            month={selectedMonth}
            onChange={handleMonthChange}
            expenseCount={filteredExpenses.length}
          />
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6'>
          {[
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            {
              id: 'expenses',
              icon: PieChart,
              label: `Expenses (${filteredExpenses.length})`,
            },
            { id: 'upload', icon: Camera, label: 'Scan Receipt' },
            { id: 'manual', icon: Plus, label: 'Add Manual' },
            {
              id: 'gallery',
              icon: ImageIcon,
              label: `Gallery (${receiptImages.length})`,
            },
            {
              id: 'recurring',
              icon: RefreshCw,
              label: `Recurring (${recurring.length})`,
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

        {activeTab === 'upload' && (
          <ReceiptUploadZone
            isProcessing={isProcessing}
            onMultipleImageUpload={handleMultipleImageUpload}
            processingStatus={uploadProgress || undefined}
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
            expenses={filteredExpenses}
            categories={categories}
            familyMembers={FAMILY_MEMBERS}
            defaultRatio={defaultRatio}
            onUpdate={updateExpenseField}
            onDelete={deleteExpense}
            onUpdateSplitRatio={updateSplitRatio}
            onResetRatio={resetToDefaultRatio}
            onMoveToMonth={handleMoveToMonth}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            expenses={filteredExpenses}
            allExpenses={expenses}
            familyMembers={FAMILY_MEMBERS}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className='mb-4'>
              <h2 className='text-2xl font-bold text-stone-800'>
                Receipt Images
              </h2>
              <p className='text-stone-600'>
                View and manage your saved receipt photos
              </p>
            </div>
            <ReceiptGallery
              images={receiptImages}
              onDelete={deleteImage}
              loading={imagesLoading}
            />
          </div>
        )}

        {/* Recurring Tab */}
        {activeTab === 'recurring' && (
          <div>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold text-stone-800'>
                  Recurring Expenses
                </h2>
                <p className='text-stone-600'>
                  Manage subscriptions, rent, and other recurring bills
                </p>
              </div>
              <button
                onClick={() => setShowRecurringForm(true)}
                className='flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors'
              >
                <Plus className='w-5 h-5' />
                Add Recurring
              </button>
            </div>
            <RecurringExpensesList
              recurring={recurring}
              onEdit={handleEditRecurring}
              onDelete={deleteRecurring}
              onToggleActive={toggleActive}
              loading={recurringLoading}
            />
          </div>
        )}

        {/* Recurring Expense Form Modal */}
        <RecurringExpenseForm
          open={showRecurringForm}
          onOpenChange={(open) => {
            if (!open) handleCancelRecurringForm();
          }}
          onSubmit={
            editingRecurring ? handleUpdateRecurring : handleAddRecurring
          }
          initialData={editingRecurring || undefined}
          categories={categories}
          familyMembers={FAMILY_MEMBERS}
          defaultRatio={defaultRatio}
        />

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
