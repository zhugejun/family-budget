export interface Expense {
  id: string
  user_id?: string
  name: string
  price: number
  quantity: number
  category: string
  split: boolean
  split_ratio: Record<string, number>
  source: 'receipt' | 'manual'
  receipt_group?: string // e.g., "Costco 12/12/2025"
  receipt_image_id?: string // Links to receipt_images table
  created_at?: string
  updated_at?: string
}

export interface ReceiptImage {
  id: string
  user_id: string
  receipt_group: string
  image_url: string
  thumbnail_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  uploaded_at: string
}

/**
 * Calculate split amounts for each family member
 */
export function calculateSplits(
  expenses: Expense[],
  familyMembers: string[]
): Record<string, number> {
  const splits: Record<string, number> = {}
  
  // Initialize splits for all members
  familyMembers.forEach(member => {
    splits[member] = 0
  })

  expenses.forEach(exp => {
    const total = exp.price * exp.quantity

    if (exp.split) {
      // Calculate ratio sum to handle cases where ratios don't add to 100
      const ratioSum = familyMembers.reduce((sum, member) => {
        return sum + (exp.split_ratio[member] || 0)
      }, 0)

      // Distribute based on ratios
      familyMembers.forEach(member => {
        splits[member] += (total * (exp.split_ratio[member] || 0)) / ratioSum
      })
    } else {
      // If not split, assign to first member (typically "You")
      splits[familyMembers[0]] += total
    }
  })

  return splits
}

/**
 * Calculate total amount from expenses
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + (exp.price * exp.quantity), 0)
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
