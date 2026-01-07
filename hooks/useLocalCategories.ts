'use client';

import { useState, useEffect } from 'react';

export function useLocalCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/local/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string) => {
    await fetch('/api/local/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCategories(prev => [...prev, name].sort());
  };

  const updateCategory = async (oldName: string, newName: string) => {
    await fetch('/api/local/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    });
    setCategories(prev => prev.map(c => c === oldName ? newName : c).sort());
  };

  const deleteCategory = async (name: string) => {
    await fetch(`/api/local/categories?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    setCategories(prev => prev.filter(c => c !== name));
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
