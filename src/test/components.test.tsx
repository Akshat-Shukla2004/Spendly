import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, Badge, EmptyState, Spinner } from '@/components/ui'

// ─── Button ───────────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Test</Button>)
    fireEvent.click(screen.getByText('Test'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Test</Button>)
    fireEvent.click(screen.getByText('Test'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ─── Badge ────────────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Food</Badge>)
    expect(screen.getByText('Food')).toBeInTheDocument()
  })
})

// ─── EmptyState ───────────────────────────────────────────────────────────────

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon="💸" title="No expenses" description="Add one" />)
    expect(screen.getByText('No expenses')).toBeInTheDocument()
    expect(screen.getByText('Add one')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <EmptyState
        icon="💸"
        title="No expenses"
        action={<button>Add Now</button>}
      />
    )
    expect(screen.getByText('Add Now')).toBeInTheDocument()
  })
})

// ─── Spinner ──────────────────────────────────────────────────────────────────

describe('Spinner', () => {
  it('renders an SVG', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
