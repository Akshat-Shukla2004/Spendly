import type { CategoryMeta, CategoryName } from '@/types'

// ─── Category Registry ────────────────────────────────────────────────────────

export const CATEGORIES: Record<CategoryName, CategoryMeta> = {
  Food:          { icon: '🍜', color: '#FF6B6B', bgColor: 'rgba(255,107,107,0.12)' },
  Travel:        { icon: '✈️',  color: '#4ECDC4', bgColor: 'rgba(78,205,196,0.12)' },
  Shopping:      { icon: '🛍️', color: '#FFE66D', bgColor: 'rgba(255,230,109,0.12)' },
  Entertainment: { icon: '🎬', color: '#A855F7', bgColor: 'rgba(168,85,247,0.12)'  },
  Health:        { icon: '💊', color: '#06D6A0', bgColor: 'rgba(6,214,160,0.12)'   },
  Utilities:     { icon: '⚡', color: '#F77F00', bgColor: 'rgba(247,127,0,0.12)'   },
  Other:         { icon: '📦', color: '#94A3B8', bgColor: 'rgba(148,163,184,0.12)' },
} as const

export const CATEGORY_NAMES = Object.keys(CATEGORIES) as CategoryName[]

// ─── Auto-categorisation Rules ────────────────────────────────────────────────

export const CATEGORY_RULES: Array<{ pattern: RegExp; category: CategoryName }> = [
  { pattern: /food|eat|cafe|coffee|restaurant|pizza|burger|lunch|dinner|breakfast|sushi|grocery|groceries|snack|takeout|takeaway|doordash|ubereats|zomato|swiggy/i, category: 'Food' },
  { pattern: /uber|lyft|taxi|flight|train|bus|metro|hotel|travel|trip|airport|airbnb|booking|hostel|rail|ferry/i, category: 'Travel' },
  { pattern: /amazon|shop|buy|order|clothes|shoes|mall|purchase|flipkart|myntra|nykaa|meesho|h&m|zara|ikea/i, category: 'Shopping' },
  { pattern: /netflix|spotify|movie|game|concert|ticket|show|stream|prime|disney|hulu|xbox|playstation|steam/i, category: 'Entertainment' },
  { pattern: /gym|doctor|pharmacy|medicine|health|clinic|hospital|yoga|fitness|dentist|insurance|medic/i, category: 'Health' },
  { pattern: /electric|electricity|water|gas|internet|phone|bill|utility|wifi|broadband|recharge/i, category: 'Utilities' },
]

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const SEED_EXPENSES = [
  { description: 'Sushi dinner',       amount: 45.00, category: 'Food'          as CategoryName, date: '2026-02-10', note: 'Anniversary dinner' },
  { description: 'Uber to airport',    amount: 28.50, category: 'Travel'        as CategoryName, date: '2026-02-09', note: '' },
  { description: 'Netflix subscription',amount: 15.99,category: 'Entertainment' as CategoryName, date: '2026-02-08', note: 'Monthly' },
  { description: 'Grocery run',        amount: 72.30, category: 'Food'          as CategoryName, date: '2026-02-07', note: 'Big Shop' },
  { description: 'Gym membership',     amount: 40.00, category: 'Health'        as CategoryName, date: '2026-02-06', note: '' },
  { description: 'Amazon order',       amount: 89.99, category: 'Shopping'      as CategoryName, date: '2026-02-05', note: 'Books + cable' },
  { description: 'Electricity bill',   amount: 110.00,category: 'Utilities'     as CategoryName, date: '2026-02-04', note: '' },
  { description: 'Coffee & pastry',    amount: 12.50, category: 'Food'          as CategoryName, date: '2026-02-03', note: '' },
  { description: 'Spotify premium',    amount: 9.99,  category: 'Entertainment' as CategoryName, date: '2026-02-02', note: '' },
  { description: 'Hotel booking',      amount: 145.00,category: 'Travel'        as CategoryName, date: '2026-02-01', note: 'Business trip' },
  { description: 'Lunch with team',    amount: 38.00, category: 'Food'          as CategoryName, date: '2026-01-31', note: '' },
  { description: 'Phone bill',         amount: 35.00, category: 'Utilities'     as CategoryName, date: '2026-01-30', note: '' },
]

export const DEFAULT_BUDGET_LIMITS: Array<{ category: CategoryName; limit: number }> = [
  { category: 'Food', limit: 300 },
  { category: 'Shopping', limit: 200 },
  { category: 'Entertainment', limit: 100 },
]
