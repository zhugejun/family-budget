/**
 * Process receipt image using Claude Vision API via our API route
 * @param base64Image - Base64 encoded image
 * @param categories - Available expense categories
 * @returns Object containing array of extracted expense items and payment card info
 */
export async function processReceiptWithClaude(
  base64Image: string,
  categories: string[]
): Promise<{
  items: Array<{
    name: string
    price: number
    quantity: number
    category: string
  }>
  payment_card: string | null
  receipt_date: string | null
}> {
  const response = await fetch('/api/process-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      categories,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to process receipt')
  }

  const data = await response.json()
  return { items: data.items, payment_card: data.payment_card, receipt_date: data.receipt_date }
}

