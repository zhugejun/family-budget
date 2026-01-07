'use client';

import { useState, useEffect } from 'react';
import type { RecurringExpense } from '@/lib/recurring-utils';

export function useLocalRecurring() {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurring = async () => {
    try {
      const response = await fetch('/api/local/recurring');
      const data = await response.json();
      setRecurring(data.recurring || []);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const addRecurring = async (
    expense: Omit<RecurringExpense, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const response = await fetch('/api/local/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    setRecurring(prev => [...prev, data.recurring]);
    return data.recurring;
  };

  const updateRecurring = async (
    id: string,
    updates: Partial<RecurringExpense>
  ) => {
    const response = await fetch('/api/local/recurring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    const data = await response.json();
    setRecurring(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
    return data.recurring;
  };

  const deleteRecurring = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/local/recurring?id=${id}`, { method: 'DELETE' });
      setRecurring(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      return false;
    }
  };

  const toggleActive = async (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return;
    return updateRecurring(id, { is_active: !item.is_active });
  };

  return {
    recurring,
    loading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    refetch: fetchRecurring,
  };
}
