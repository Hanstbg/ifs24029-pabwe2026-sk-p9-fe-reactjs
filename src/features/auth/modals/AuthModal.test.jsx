import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthModal from './AuthModal'
import { login, register } from '../api/authApi'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({ showSuccessAlert: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe('AuthModal', () => {
  it('berganti mode, menutup, dan login sukses', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onAuthenticated = vi.fn()
    login.mockResolvedValue({ token: 't', user: { username: 'u' } })
    render(<AuthModal onClose={onClose} onAuthenticated={onAuthenticated} />)

    await user.click(screen.getByRole('button', { name: 'Belum punya akun? Daftar' }))
    expect(document.getElementById('register-username')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sudah punya akun? Masuk' }))

    await user.type(document.getElementById('login-username'), 'u')
    await user.type(document.getElementById('login-password'), 'p')
    await user.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({ username: 'u' }))

    await user.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('setelah registrasi kembali ke mode login', async () => {
    const user = userEvent.setup()
    register.mockResolvedValue({})
    render(<AuthModal onClose={vi.fn()} onAuthenticated={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Belum punya akun? Daftar' }))
    await user.type(document.getElementById('register-username'), 'u')
    await user.type(document.getElementById('register-email'), 'u@u.com')
    await user.type(document.getElementById('register-password'), 'p')
    await user.click(document.getElementById('register-submit'))
    await waitFor(() => expect(document.getElementById('login-username')).toBeInTheDocument())
  })
})
