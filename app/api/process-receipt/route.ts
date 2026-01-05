import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, categories } = await request.json()

    const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
    
    if (!apiKey) {
      console.error('Claude API key not configured')
      return NextResponse.json(
        { error: 'Claude API key not configured. Please add NEXT_PUBLIC_CLAUDE_API_KEY to your .env.local file.' },
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
              text: `Extract all items from this receipt. Return ONLY valid JSON array, no markdown, no explanation. Format:
[{"name": "item name", "price": 12.99, "quantity": 1, "category": "Groceries"}]
Categories: ${categories.join(', ')}.
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
    
    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process receipt' },
      { status: 500 }
    )
  }
}

