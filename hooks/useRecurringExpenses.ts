'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RecurringExpense } from '@/lib/recurring-utils';

export function useRecurringExpenses(userId: string | undefined) {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all recurring expenses
  const fetchRecurring = async () => {
    if (!userId) {
      setRecurring([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

      setRecurring(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recurring expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recurring expenses');
      setRecurring([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, [userId]);

  // Add a new recurring expense
  const addRecurring = async (
    data: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<RecurringExpense | null> => {
    if (!userId) return null;

    try {
      const { data: newRecurring, error } = await supabase
        .from('recurring_expenses')
        .insert({
          ...data,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setRecurring(prev => [...prev, newRecurring].sort((a, b) => 
        new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
      ));

      return newRecurring;
    } catch (err) {
      console.error('Error adding recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to add recurring expense');
      return null;
    }
  };

  // Update a recurring expense
  const updateRecurring = async (
    id: string,
    updates: Partial<RecurringExpense>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setRecurring(prev =>
        prev.map(r => (r.id === id ? { ...r, ...updates } : r))
      );

      return true;
    } catch (err) {
      console.error('Error updating recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to update recurring expense');
      return false;
    }
  };

  // Delete a recurring expense
  const deleteRecurring = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setRecurring(prev => prev.filter(r => r.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete recurring expense');
      return false;
    }
  };

  // Toggle active status
  const toggleActive = async (id: string): Promise<boolean> => {
    const recurring = getById(id);
    if (!recurring) return false;

    return updateRecurring(id, { is_active: !recurring.is_active });
  };

  // Get recurring expense by ID
  const getById = (id: string): RecurringExpense | undefined => {
    return recurring.find(r => r.id === id);
  };

  // Get active recurring expenses
  const getActive = (): RecurringExpense[] => {
    return recurring.filter(r => r.is_active);
  };

  // Get due recurring expenses
  const getDue = (): RecurringExpense[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recurring.filter(r => {
      if (!r.is_active) return false;
      const dueDate = new Date(r.next_due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    });
  };

  return {
    recurring,
    loading,
    error,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    getById,
    getActive,
    getDue,
    refetch: fetchRecurring,
  };
}
