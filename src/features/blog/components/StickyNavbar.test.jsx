import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const setup = (props = {}) => {
  const handlers = {
    onToggleTheme: vi.fn(), onAccent: vi.fn(), onNavigate: vi.fn(), onLogin: vi.fn(), onLogout: vi.fn(),
  }
  render(
    <StickyNavbar user={null} theme="light" accent="indigo" accents={['indigo', 'rose']} {...handlers} {...props} />,
  )
  return { user: userEvent.setup(), ...handlers }
}

describe('StickyNavbar', () => {
  it('tamu: login, daftar, dan navigasi beranda', async () => {
    const { user, onLogin, onNavigate } = setup()
    await user.click(screen.getAllByRole('button', { name: 'Masuk' })[0])
    expect(onLogin).toHaveBeenCalled()
    await user.click(screen.getAllByRole('link', { name: 'Daftar' })[0])
    expect(onNavigate).toHaveBeenCalledWith('/register')
    await user.click(screen.getAllByRole('link', { name: 'Artikel' })[0])
    expect(onNavigate).toHaveBeenCalledWith('/')
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })

  it('member: workspace dan keluar, tanpa menu admin', async () => {
    const { user, onLogout, onNavigate } = setup({ user: { username: 'budi', role: 'member' } })
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Workspace' }))
    expect(onNavigate).toHaveBeenCalledWith('/author')
    await user.click(screen.getByRole('button', { name: 'Keluar (budi)' }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('admin melihat menu admin', async () => {
    const { user, onNavigate } = setup({ user: { username: 'adm', role: 'admin' } })
    await user.click(screen.getByRole('link', { name: 'Admin' }))
    expect(onNavigate).toHaveBeenCalledWith('/admin')
  })

  it('tema dan aksen', async () => {
    const { user, onToggleTheme, onAccent } = setup()
    await user.click(screen.getByRole('button', { name: 'Ganti tema' }))
    expect(onToggleTheme).toHaveBeenCalled()
    await user.selectOptions(screen.getByLabelText('Warna aksen'), 'rose')
    expect(onAccent).toHaveBeenCalledWith('rose')
  })

  it('ikon tema gelap', () => {
    setup({ theme: 'dark' })
    expect(screen.getByRole('button', { name: 'Ganti tema' })).toBeInTheDocument()
  })

  it('menu mobile terbuka, memakai item, dan tertutup', async () => {
    const { user, onLogin } = setup()
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Masuk' })[1])
    expect(onLogin).toHaveBeenCalled()
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('tombol menu bisa membuka lalu menutup', async () => {
    const { user } = setup({ user: { username: 'b', role: 'member' } })
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(screen.getAllByRole('button', { name: 'Keluar (b)' })[1])
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })
})
