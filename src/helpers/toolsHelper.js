// SweetAlert2 (~60 KB) dimuat hanya saat alert pertama kali ditampilkan,
// sehingga tidak ikut membebani bundle awal (mengurangi unused JavaScript).
const loadSwal = () => import('sweetalert2').then((m) => m.default)

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

export const showSuccessAlert = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })
}

export const showErrorAlert = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'error', title: 'Gagal', text: message })
}

export const showConfirmDialog = async (title, text) => {
  const Swal = await loadSwal()
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}
