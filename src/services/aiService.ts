import type { Expense, CategoryName, AIInsight } from '@/types'
import { CATEGORIES } from '@/utils/constants'
import { storage } from './storage'

const AI_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function buildPrompt(expenses: Expense[]): string {
  const categoryTotals = (Object.keys(CATEGORIES) as CategoryName[])
    .map((cat) => {
      const total = expenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.amount, 0)
      return total > 0 ? `${cat}: $${total.toFixed(2)}` : null
    })
    .filter(Boolean)
    .join(', ')

  const recentItems = expenses
    .slice(0, 6)
    .map((e) => `"${e.description}" $${e.amount.toFixed(2)}`)
    .join(', ')

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0)

  return `You are a friendly, smart personal finance advisor. Analyze this user's spending:

Category totals: ${categoryTotals}
Recent purchases: ${recentItems}
Total tracked: $${grandTotal.toFixed(2)}

Respond with a JSON object with exactly these fields:
- "text": A specific, warm, actionable 2-sentence saving tip that references their ACTUAL spending. Be concrete. Do NOT start with "I".
- "type": one of "tip" | "warning" | "positive"
  - "warning" if food or shopping > 40% of total
  - "positive" if spending looks controlled and balanced  
  - "tip" otherwise

Return ONLY valid JSON. No markdown. No explanation.`
}

export async function fetchAIInsight(expenses: Expense[]): Promise<AIInsight> {
  // Return cache if fresh
  const cached = storage.getCachedInsight()
  if (cached && Date.now() - cached.ts < AI_CACHE_TTL) {
    return {
      text: cached.text,
      type: 'tip',
      generatedAt: new Date(cached.ts).toISOString(),
    }
  }

  const prompt = buildPrompt(expenses)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  const rawText: string = data?.content?.[0]?.text ?? ''

  let parsed: { text: string; type: AIInsight['type'] }
  try {
    parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim())
  } catch {
    parsed = { text: rawText || 'Keep tracking your expenses for personalised insights!', type: 'tip' }
  }

  const insight: AIInsight = {
    text: parsed.text,
    type: parsed.type ?? 'tip',
    generatedAt: new Date().toISOString(),
  }

  storage.setCachedInsight(insight.text)
  return insight
}
