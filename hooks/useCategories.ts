'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_CATEGORIES = ['Groceries', 'Dining', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Other']

/**
 * Custom hook for managing expense categories
 */
export function useCategories(userId?: string) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  // Load categories from Supabase or use defaults
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadCategories()
  }, [userId])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_settings')
        .select('categories')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data?.categories) {
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveCategories = async (newCategories: string[]) => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: userId, 
            categories: newCategories,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      setCategories(newCategories)
    } catch (err) {
      console.error('Error saving categories:', err)
      throw err
    }
  }

  const addCategory = async (category: string) => {
    const trimmed = category.trim()
    if (!trimmed || categories.includes(trimmed)) return

    const newCategories = [...categories, trimmed]
    await saveCategories(newCategories)
  }

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    const trimmed = newCategory.trim()
    if (!trimmed || trimmed === oldCategory || categories.includes(trimmed)) return

    const newCategories = categories.map(c => c === oldCategory ? trimmed : c)
    await saveCategories(newCategories)
    
    // Also update expenses using this category
    if (userId) {
      await supabase
        .from('expenses')
        .update({ category: trimmed })
        .eq('user_id', userId)
        .eq('category', oldCategory)
    }
  }

  const deleteCategory = async (category: string) => {
    if (categories.length <= 1) return

    const newCategories = categories.filter(c => c !== category)
    await saveCategories(newCategories)

    // Update expenses to use fallback category
    const fallback = newCategories[0] || 'Other'
    if (userId) {
      await supabase
        .from('expenses')
        .update({ category: fallback })
        .eq('user_id', userId)
        .eq('category', category)
    }
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory
  }
}
