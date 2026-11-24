import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from './AuthPage'
import { login, register } from '../api/authApi'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({ showSuccessAlert: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe('AuthPage', () => {
  it('mode login: tautan ke registrasi dan login sukses', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onAuthenticated = vi.fn()
    login.mockResolvedValue({ token: 't', user: { username: 'u' } })
    render(<AuthPage mode="login" onNavigate={onNavigate} onAuthenticated={onAuthenticated} />)
    expect(screen.getByRole('heading', { name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    await user.type(document.getElementById('login-username'), 'u')
    await user.type(document.getElementById('login-password'), 'p')
    await user.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({ username: 'u' }))
  })

  it('mode register: tautan ke login dan registrasi mengarah ke /login', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    register.mockResolvedValue({})
    render(<AuthPage mode="register" onNavigate={onNavigate} onAuthenticated={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Buat akun penulis' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')

    await user.type(document.getElementById('register-username'), 'u')
    await user.type(document.getElementById('register-email'), 'u@u.com')
    await user.type(document.getElementById('register-password'), 'p')
    await user.click(document.getElementById('register-submit'))
    await waitFor(() => expect(onNavigate).toHaveBeenLastCalledWith('/login'))
  })
})
