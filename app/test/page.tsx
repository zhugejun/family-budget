'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testName, setTestName] = useState('Test Expense');
  const [testPrice, setTestPrice] = useState('10.00');
  const [testCategory, setTestCategory] = useState('Groceries');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        fetch('/api/local/expenses'),
        fetch('/api/local/categories'),
      ]);

      const expData = await expRes.json();
      const catData = await catRes.json();

      setExpenses(expData.expenses || []);
      setCategories(catData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestExpense = async () => {
    try {
      const response = await fetch('/api/local/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testName,
          price: parseFloat(testPrice),
          quantity: 1,
          category: testCategory,
          split: false,
          split_ratio: { You: 50, Partner: 50 },
          source: 'manual',
        }),
      });

      const data = await response.json();
      console.log('Added expense:', data);
      loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await fetch(`/api/local/expenses?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (loading) {
    return <div className='p-8'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>🧪 SQLite Test Page</h1>

        {/* Database Status */}
        <div className='bg-white rounded-lg p-6 mb-6 shadow'>
          <h2 className='text-xl font-bold mb-4'>Database Status</h2>
          <div className='space-y-2'>
            <p>✅ Database Connected</p>
            <p>📊 Total Expenses: {expenses.length}</p>
            <p>🏷️ Total Categories: {categories.length}</p>
            <p>
              📁 Database Location:{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                data/budget.db
              </code>
            </p>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className='bg-white rounded-lg p-6 mb-6 shadow'>
          <h2 className='text-xl font-bold mb-4'>Add Test Expense</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Name</label>
              <input
                type='text'
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Price</label>
              <input
                type='number'
                step='0.01'
                value={testPrice}
                onChange={(e) => setTestPrice(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Category</label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg'
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addTestExpense}
              className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700'
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className='bg-white rounded-lg p-6 shadow'>
          <h2 className='text-xl font-bold mb-4'>
            Expenses ({expenses.length})
          </h2>
          {expenses.length === 0 ? (
            <p className='text-gray-500'>No expenses yet. Add one above!</p>
          ) : (
            <div className='space-y-2'>
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium'>{exp.name}</p>
                    <p className='text-sm text-gray-600'>
                      ${exp.price} - {exp.category}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {new Date(exp.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className='px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg'
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Test Links */}
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='font-bold mb-2'>📡 Test API Directly:</h3>
          <div className='space-y-1 text-sm'>
            <p>
              <a
                href='/api/local/expenses'
                target='_blank'
                className='text-blue-600 hover:underline'
              >
                GET /api/local/expenses
              </a>
            </p>
            <p>
              <a
                href='/api/local/categories'
                target='_blank'
                className='text-blue-600 hover:underline'
              >
                GET /api/local/categories
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
