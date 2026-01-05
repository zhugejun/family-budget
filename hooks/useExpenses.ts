'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Expense } from '@/lib/calculations'

/**
 * Custom hook for managing expenses with Supabase persistence
 */
export function useExpenses(userId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load expenses from Supabase
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadExpenses()
  }, [userId])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (err: any) {
      console.error('Error loading expenses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newExpense = {
        ...expense,
        user_id: userId,
        created_at: new Date().toISOString()
      }

      if (userId) {
        const { data, error } = await supabase
          .from('expenses')
          .insert([newExpense])
          .select()
          .single()

        if (error) throw error
        setExpenses(prev => [data, ...prev])
        return data
      } else {
        // Local-only mode (no auth)
        const localExpense = { ...newExpense, id: Date.now().toString() } as Expense
        setExpenses(prev => [localExpense, ...prev])
        return localExpense
      }
    } catch (err: any) {
      console.error('Error adding expense:', err)
      setError(err.message)
      throw err
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('expenses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      }

      setExpenses(prev => prev.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      ))
    } catch (err: any) {
      console.error('Error updating expense:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id))
    } catch (err: any) {
      console.error('Error deleting expense:', err)
      setError(err.message)
      throw err
    }
  }

  const addMultipleExpenses = async (expenseArray: Omit<Expense, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const newExpenses = expenseArray.map(exp => ({
        ...exp,
        user_id: userId,
        created_at: new Date().toISOString()
      }))

      if (userId) {
        const { data, error } = await supabase
          .from('expenses')
          .insert(newExpenses)
          .select()

        if (error) throw error
        setExpenses(prev => [...(data || []), ...prev])
        return data
      } else {
        // Local-only mode
        const localExpenses = newExpenses.map((exp, idx) => ({ 
          ...exp, 
          id: (Date.now() + idx).toString()
        })) as Expense[]
        setExpenses(prev => [...localExpenses, ...prev])
        return localExpenses
      }
    } catch (err: any) {
      console.error('Error adding multiple expenses:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addMultipleExpenses,
    refreshExpenses: loadExpenses
  }
}
