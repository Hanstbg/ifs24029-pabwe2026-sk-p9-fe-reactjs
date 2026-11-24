import { beforeEach, describe, expect, it, vi } from 'vitest'
import Swal from 'sweetalert2'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('toolsHelper', () => {
  it('formatDate memformat tanggal Indonesia atau strip', () => {
    expect(formatDate('2026-11-18T05:00:00Z')).toContain('2026')
    expect(formatDate(null)).toBe('-')
  })

  it('menampilkan alert sukses dan gagal', async () => {
    await showSuccessAlert('ok')
    await showErrorAlert('gagal')
    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: 'success', text: 'ok' }))
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: 'error', text: 'gagal' }))
  })

  it('showConfirmDialog mengembalikan isConfirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await showConfirmDialog('Hapus?', 'x')).toBe(true)
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await showConfirmDialog('Hapus?', 'x')).toBe(false)
  })
})
