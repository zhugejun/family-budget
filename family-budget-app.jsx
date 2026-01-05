import React, { useState, useCallback } from 'react';
import { Upload, Plus, Trash2, Users, Receipt, Edit3, Check, X, Loader2, Camera, DollarSign, PieChart, Settings, RotateCcw } from 'lucide-react';

const FAMILY_MEMBERS = ['You', 'Partner'];
const DEFAULT_CATEGORIES = ['Groceries', 'Dining', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Other'];

export default function FamilyBudgetApp() {
  const [expenses, setExpenses] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [editingId, setEditingId] = useState(null);
  const [manualItem, setManualItem] = useState({ name: '', price: '', category: 'Other' });
  const [dragOver, setDragOver] = useState(false);
  const [defaultRatio, setDefaultRatio] = useState({ [FAMILY_MEMBERS[0]]: 50, [FAMILY_MEMBERS[1]]: 50 });
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const processReceiptWithClaude = async (base64Image) => {
    setIsProcessing(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64Image }
              },
              {
                type: "text",
                text: `Extract all items from this receipt. Return ONLY valid JSON array, no markdown, no explanation. Format:
[{"name": "item name", "price": 12.99, "quantity": 1, "category": "Groceries"}]
Categories: ${categories.join(', ')}.
If you can't read the receipt clearly, return an empty array [].`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '[]';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const items = JSON.parse(cleaned);
      
      const newExpenses = items.map((item, idx) => ({
        id: Date.now() + idx,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
        category: item.category || 'Other',
        split: false,
        splitRatio: { ...defaultRatio },
        source: 'receipt'
      }));
      
      setExpenses(prev => [...prev, ...newExpenses]);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Could not process receipt. Please try again or add items manually.');
    }
    setIsProcessing(false);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      processReceiptWithClaude(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, []);

  const addManualItem = () => {
    if (!manualItem.name || !manualItem.price) return;
    setExpenses(prev => [...prev, {
      id: Date.now(),
      name: manualItem.name,
      price: parseFloat(manualItem.price) || 0,
      quantity: 1,
      category: manualItem.category,
      split: false,
      splitRatio: { ...defaultRatio },
      source: 'manual'
    }]);
    setManualItem({ name: '', price: '', category: 'Other' });
  };

  const updateExpense = (id, field, value) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const updateSplitRatio = (id, member, value) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const newRatio = { ...exp.splitRatio, [member]: parseInt(value) || 0 };
      return { ...exp, splitRatio: newRatio };
    }));
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const resetToDefaultRatio = (id) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, splitRatio: { ...defaultRatio } } : exp
    ));
  };

  const updateDefaultRatio = (member, value) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const otherMember = FAMILY_MEMBERS.find(m => m !== member);
    setDefaultRatio({
      [member]: newValue,
      [otherMember]: 100 - newValue
    });
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      setNewCategory('');
    }
  };

  const deleteCategory = (cat) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c !== cat));
    // Update any expenses using this category to 'Other' or first available
    const fallback = categories.find(c => c !== cat) || 'Other';
    setExpenses(prev => prev.map(exp => 
      exp.category === cat ? { ...exp, category: fallback } : exp
    ));
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const saveEditCategory = () => {
    const trimmed = editCategoryValue.trim();
    if (trimmed && trimmed !== editingCategory && !categories.includes(trimmed)) {
      setCategories(prev => prev.map(c => c === editingCategory ? trimmed : c));
      setExpenses(prev => prev.map(exp => 
        exp.category === editingCategory ? { ...exp, category: trimmed } : exp
      ));
    }
    setEditingCategory(null);
    setEditCategoryValue('');
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.price * exp.quantity), 0);
  
  const calculateSplits = () => {
    const splits = { [FAMILY_MEMBERS[0]]: 0, [FAMILY_MEMBERS[1]]: 0 };
    expenses.forEach(exp => {
      const total = exp.price * exp.quantity;
      if (exp.split) {
        const ratioSum = exp.splitRatio[FAMILY_MEMBERS[0]] + exp.splitRatio[FAMILY_MEMBERS[1]];
        splits[FAMILY_MEMBERS[0]] += (total * exp.splitRatio[FAMILY_MEMBERS[0]]) / ratioSum;
        splits[FAMILY_MEMBERS[1]] += (total * exp.splitRatio[FAMILY_MEMBERS[1]]) / ratioSum;
      } else {
        splits[FAMILY_MEMBERS[0]] += total;
      }
    });
    return splits;
  };

  const splits = calculateSplits();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-amber-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Fraunces', serif" }}>
                Family Budget
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-100/80 rounded-full px-4 py-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800">${totalAmount.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl border border-stone-200">
              <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Default Split Ratio
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-stone-600">{FAMILY_MEMBERS[0]}</span>
                    <span className="text-sm font-bold text-emerald-600">{defaultRatio[FAMILY_MEMBERS[0]]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={defaultRatio[FAMILY_MEMBERS[0]]}
                    onChange={(e) => updateDefaultRatio(FAMILY_MEMBERS[0], e.target.value)}
                    className="w-full h-2 bg-gradient-to-r from-emerald-300 to-violet-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-stone-600">{FAMILY_MEMBERS[1]}</span>
                    <span className="text-sm font-bold text-violet-600">{defaultRatio[FAMILY_MEMBERS[1]]}%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-3">New items will use this ratio. You can still customize individual items.</p>
              
              {/* Category Management */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Expense Categories
                </h3>
                
                {/* Add new category */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="New category name"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Category list */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1">
                      {editingCategory === cat ? (
                        <>
                          <input
                            type="text"
                            value={editCategoryValue}
                            onChange={(e) => setEditCategoryValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditCategory()}
                            className="w-24 px-1 py-0.5 text-sm border border-amber-300 rounded focus:outline-none"
                            autoFocus
                          />
                          <button onClick={saveEditCategory} className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditingCategory(null)} className="p-0.5 text-stone-400 hover:bg-stone-100 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-stone-700">{cat}</span>
                          <button 
                            onClick={() => startEditCategory(cat)}
                            className="p-0.5 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          {categories.length > 1 && (
                            <button 
                              onClick={() => deleteCategory(cat)}
                              className="p-0.5 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-2">Click a category to edit. Receipt scanning will use these categories.</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {FAMILY_MEMBERS.map((member, idx) => (
            <div key={member} className={`p-5 rounded-2xl border ${idx === 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-emerald-200 text-emerald-700' : 'bg-violet-200 text-violet-700'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-medium text-stone-600">{member}</span>
              </div>
              <p className={`text-2xl font-bold ${idx === 0 ? 'text-emerald-700' : 'text-violet-700'}`} style={{ fontFamily: "'Fraunces', serif" }}>
                ${splits[member].toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'upload', icon: Camera, label: 'Scan Receipt' },
            { id: 'manual', icon: Plus, label: 'Add Manual' },
            { id: 'expenses', icon: PieChart, label: `Expenses (${expenses.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-stone-800 text-white shadow-lg' 
                  : 'bg-white/60 text-stone-600 hover:bg-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              dragOver 
                ? 'border-amber-400 bg-amber-50' 
                : 'border-stone-300 bg-white/50 hover:border-amber-300 hover:bg-white/80'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                </div>
                <p className="text-stone-600 font-medium">Processing receipt with AI...</p>
                <p className="text-stone-400 text-sm">Extracting items and prices</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-stone-700 font-medium text-lg mb-2">Drop receipt image here</p>
                <p className="text-stone-400 mb-4">or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm">
                  <Camera className="w-4 h-4" />
                  Supports JPG, PNG
                </div>
              </>
            )}
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Add Expense Manually
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Item name"
                value={manualItem.name}
                onChange={(e) => setManualItem(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={manualItem.price}
                onChange={(e) => setManualItem(prev => ({ ...prev, price: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              />
              <select
                value={manualItem.category}
                onChange={(e) => setManualItem(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button
              onClick={addManualItem}
              disabled={!manualItem.name || !manualItem.price}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
            >
              Add Expense
            </button>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="bg-white/50 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-500">No expenses yet. Upload a receipt or add manually!</p>
              </div>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-stone-200 hover:shadow-lg transition-all">
                  {editingId === expense.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm"
                        />
                        <input
                          type="number"
                          value={expense.price}
                          step="0.01"
                          onChange={(e) => updateExpense(expense.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-24 px-3 py-2 rounded-lg border border-stone-200 text-sm"
                        />
                        <button onClick={() => setEditingId(null)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                      <select
                        value={expense.category}
                        onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-stone-800">{expense.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">{expense.category}</span>
                            {expense.source === 'receipt' && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">OCR</span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-stone-700" style={{ fontFamily: "'Fraunces', serif" }}>
                            ${(expense.price * expense.quantity).toFixed(2)}
                            {expense.quantity > 1 && <span className="text-sm font-normal text-stone-400 ml-1">×{expense.quantity}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingId(expense.id)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteExpense(expense.id)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Split Controls */}
                      <div className="pt-3 border-t border-stone-100">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={expense.split}
                              onChange={(e) => updateExpense(expense.id, 'split', e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${expense.split ? 'bg-violet-500' : 'bg-stone-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${expense.split ? 'translate-x-5' : 'translate-x-1'}`} />
                            </div>
                          </div>
                          <span className="text-sm text-stone-600">Split this expense</span>
                        </label>
                        
                        {expense.split && (
                          <div className="mt-3 flex items-center gap-4 bg-violet-50 rounded-xl p-3">
                            <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
                            {FAMILY_MEMBERS.map((member, idx) => (
                              <div key={member} className="flex items-center gap-2">
                                <span className="text-sm text-stone-600">{member}</span>
                                <input
                                  type="number"
                                  value={expense.splitRatio[member]}
                                  onChange={(e) => updateSplitRatio(expense.id, member, e.target.value)}
                                  className="w-16 px-2 py-1 rounded-lg border border-violet-200 text-sm text-center"
                                />
                                <span className="text-sm text-stone-400">%</span>
                              </div>
                            ))}
                            {(expense.splitRatio[FAMILY_MEMBERS[0]] !== defaultRatio[FAMILY_MEMBERS[0]] || 
                              expense.splitRatio[FAMILY_MEMBERS[1]] !== defaultRatio[FAMILY_MEMBERS[1]]) && (
                              <button
                                onClick={() => resetToDefaultRatio(expense.id)}
                                className="ml-auto flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-2 py-1 rounded-lg transition-colors"
                                title="Reset to default ratio"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span> How it works
          </h3>
          <ul className="text-stone-300 text-sm space-y-1">
            <li>• <strong>Scan Receipt:</strong> Upload a photo and AI extracts items automatically</li>
            <li>• <strong>Edit if needed:</strong> Click the pencil icon to fix OCR mistakes</li>
            <li>• <strong>Split expenses:</strong> Toggle split and set custom ratios (50/50, 70/30, etc.)</li>
            <li>• <strong>Track totals:</strong> See who owes what at a glance</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
