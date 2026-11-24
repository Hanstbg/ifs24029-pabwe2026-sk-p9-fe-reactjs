import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total: 5, terbit: 3, draf: 2 }} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('5')
    expect(screen.getByTestId('stat-terbit')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-draf')).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
  })
})
