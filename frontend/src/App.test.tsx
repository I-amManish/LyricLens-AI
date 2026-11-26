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
      screen.getByText(
        "Don't just listen to music. Become the music."
      )
    ).toBeInTheDocument()
  })

  it('renders the live studio', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Live Studio' })
    ).toBeInTheDocument()
  })

  it('renders the camera control', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: 'Enable Camera' })
    ).toBeInTheDocument()
  })

  it('renders the music upload control', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: 'Upload Music' })
    ).toBeInTheDocument()
  })

  it('renders the image upload control', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: 'Upload Image' })
    ).toBeInTheDocument()
  })
})