'use client';

import { useState, useEffect } from 'react';
import type { Expense } from '@/lib/calculations';

export function useLocalExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/local/expenses');
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await fetch('/api/local/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    setExpenses(prev => [data.expense, ...prev]);
    return data.expense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const response = await fetch('/api/local/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    const data = await response.json();
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e));
    return data.expense;
  };

  const deleteExpense = async (id: string) => {
    await fetch(`/api/local/expenses?id=${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addMultipleExpenses = async (newExpenses: Omit<Expense, 'id' | 'created_at' | 'updated_at'>[]) => {
    const added: Expense[] = [];
    for (const exp of newExpenses) {
      const result = await addExpense(exp);
      added.push(result);
    }
    return added;
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addMultipleExpenses,
    refetch: fetchExpenses,
  };
}
