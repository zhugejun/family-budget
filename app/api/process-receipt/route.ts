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
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
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
  text: `Extract all items from this receipt with their FINAL prices after discounts.

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

Return ONLY a valid JSON array, no markdown, no explanation.
Format: [{"name": "item name", "price": 8.99, "quantity": 1, "category": "Groceries"}]

Available categories: ${categories.join(', ')}.
If you can't read the receipt clearly, return an empty array [].`
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
    
    const text = data.content?.[0]?.text || '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    
    const items = JSON.parse(cleaned)
    console.log('Extracted items:', items)
    
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
    
    return NextResponse.json({ items: combined })
  } catch (error: any) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process receipt' },
      { status: 500 }
    )
  }
}