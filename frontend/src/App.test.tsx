import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('LyricLens AI', () => {
  it('renders the application title', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'LyricLens AI' })
    ).toBeInTheDocument()
  })

  it('renders the application tagline', () => {
    render(<App />)

    expect(
      screen.getByText("Don't just listen to music. Become the music.")
    ).toBeInTheDocument()
  })
})