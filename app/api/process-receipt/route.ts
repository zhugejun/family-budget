import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, categories } = await request.json()

    const apiKey = process.env.CLAUDE_API_KEY
    
    if (!apiKey) {
      console.error('Claude API key not configured')
      return NextResponse.json(
        { error: 'Claude API key not configured. Please add CLAUDE_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    console.log('Processing receipt with Claude API...')

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01" // Latest stable API version per Anthropic docs
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { 
                type: "base64", 
                media_type: "image/jpeg", 
                data: image 
              }
            },
            {
  type: "text",
  text: `Extract all items from this receipt with their FINAL prices after discounts, identify the payment method if visible, and extract the receipt date.

IMPORTANT - Discount Handling:
- Discounts appear on the line BELOW their item, with a trailing minus (e.g., "3.00-")
- Discount lines often have coupon codes like "0000365824 / 1114874"
- The item code in the discount line (after the /) matches the item above
- SUBTRACT the discount from the item's price and return the NET price
- Do NOT create separate line items for discounts

Examples:
  "COOKIE BAR         11.99"
  "0000366012 / 1114874   3.00-"
  → Return: {"name": "COOKIE BAR", "price": 8.99, "quantity": 1, "category": "..."}

  "POPCRN ZEBRA       7.99"
  "0000365824 / 1124714   3.00-"
  → Return: {"name": "POPCRN ZEBRA", "price": 4.99, "quantity": 1, "category": "..."}

Payment Card Extraction:
- Look for credit/debit card information near the bottom of the receipt
- Common patterns: "VISA ****1234", "MC ****5678", "AMEX ****9012", "DEBIT ****4567"
- Extract the card type and last 4 digits (e.g., "Visa 1234", "Mastercard 5678")
- If no card info is visible, set "payment_card" to null

Receipt Date Extraction:
- Look for the transaction date on the receipt (usually near the top or bottom)
- Common formats: "01/15/2026", "Jan 15, 2026", "2026-01-15", "01-15-26"
- Return the date in ISO format: "YYYY-MM-DD" (e.g., "2026-01-15")
- If no date is visible, set "receipt_date" to null

Return ONLY a valid JSON object with this structure:
{
  "receipt_date": "2026-01-15" or null,
  "payment_card": "Visa 1234" or null,
  "items": [{"name": "item name", "price": 8.99, "quantity": 1, "category": "Groceries"}]
}

Available categories: ${categories.join(', ')}.
If you can't read the receipt clearly, return {"receipt_date": null, "payment_card": null, "items": []}.`
}
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, errorText)
      
      let errorMessage = `Claude API error: ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorMessage
      } catch (e) {
        // Use default error message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Claude API response:', data)
    
    const text = data.content?.[0]?.text || '{"receipt_date": null, "payment_card": null, "items": []}'
    const cleaned = text.replace(/```json|```/g, '').trim()
    
    const result = JSON.parse(cleaned)
    console.log('Extracted result:', result)
    
    // Handle both old array format and new object format for backwards compatibility
    const items = Array.isArray(result) ? result : (result.items || [])
    const paymentCard = Array.isArray(result) ? null : (result.payment_card || null)
    const receiptDate = Array.isArray(result) ? null : (result.receipt_date || null)
    
    console.log('Receipt date:', receiptDate)
    console.log('Payment card:', paymentCard)
    console.log('Items:', items)
    
    // Combine duplicate items (same name and price)
    const combined = items.reduce((acc: any[], item: any) => {
      const existing = acc.find(
        (i) => i.name === item.name && i.price === item.price
      )
      if (existing) {
        existing.quantity += item.quantity || 1
      } else {
        acc.push({ ...item, quantity: item.quantity || 1 })
      }
      return acc
    }, [])
    
    console.log('Combined items:', combined)
    
    return NextResponse.json({ items: combined, payment_card: paymentCard, receipt_date: receiptDate })
  } catch (error: any) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process receipt' },
      { status: 500 }
    )
  }
}