import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthForm from './AuthForm'
import { login, register } from '../api/authApi'
import { showSuccessAlert } from '../../../helpers/toolsHelper'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({ showSuccessAlert: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe('AuthForm', () => {
  it('login berhasil menyimpan sesi', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    login.mockResolvedValue({ token: 'tok', user: { username: 'budi' } })
    render(<AuthForm mode="login" onSuccess={onSuccess} />)
    await user.type(document.getElementById('login-username'), 'budi')
    await user.type(document.getElementById('login-password'), 'rahasia')
    await user.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ username: 'budi' }))
    expect(login).toHaveBeenCalledWith({ username: 'budi', password: 'rahasia' })
    expect(localStorage.getItem('delcom_blog_token')).toBe('tok')
  })

  it('login gagal menampilkan pesan error', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('Kredensial salah'))
    render(<AuthForm mode="login" onSuccess={vi.fn()} />)
    await user.type(document.getElementById('login-username'), 'a')
    await user.type(document.getElementById('login-password'), 'b')
    await user.click(document.getElementById('login-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kredensial salah')
    expect(document.getElementById('login-submit')).toBeEnabled()
  })

  it('menampilkan status memproses saat menunggu', async () => {
    const user = userEvent.setup()
    let resolve
    login.mockReturnValue(new Promise((r) => { resolve = r }))
    render(<AuthForm mode="login" onSuccess={vi.fn()} />)
    expect(document.getElementById('login-submit')).toHaveTextContent('Masuk')
    await user.type(document.getElementById('login-username'), 'a')
    await user.type(document.getElementById('login-password'), 'b')
    await user.click(document.getElementById('login-submit'))
    expect(document.getElementById('login-submit')).toHaveTextContent('Memproses...')
    expect(document.getElementById('login-submit')).toBeDisabled()
    resolve({ token: 't', user: {} })
    await waitFor(() => expect(document.getElementById('login-submit')).toBeEnabled())
  })

  it('registrasi berhasil memanggil onSuccess(null)', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    register.mockResolvedValue({})
    render(<AuthForm mode="register" onSuccess={onSuccess} />)
    expect(document.getElementById('register-submit')).toHaveTextContent('Daftar')
    await user.type(document.getElementById('register-username'), 'budi')
    await user.type(document.getElementById('register-email'), 'b@mail.com')
    await user.type(document.getElementById('register-password'), 'rahasia')
    await user.click(document.getElementById('register-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(null))
    expect(register).toHaveBeenCalledWith({ username: 'budi', email: 'b@mail.com', password: 'rahasia' })
    expect(showSuccessAlert).toHaveBeenCalled()
  })

  it('registrasi gagal menampilkan error', async () => {
    const user = userEvent.setup()
    register.mockRejectedValue(new Error('Username dipakai'))
    render(<AuthForm mode="register" onSuccess={vi.fn()} />)
    await user.type(document.getElementById('register-username'), 'a')
    await user.type(document.getElementById('register-email'), 'a@a.com')
    await user.type(document.getElementById('register-password'), 'b')
    await user.click(document.getElementById('register-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Username dipakai')
  })
})
