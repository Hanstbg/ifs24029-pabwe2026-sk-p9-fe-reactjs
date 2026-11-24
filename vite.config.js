import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Menyisipkan (inline) CSS entry langsung ke index.html sehingga browser tidak perlu
// menunggu request CSS terpisah (render-blocking) sebelum menggambar halaman pertama.
function inlineEntryCss() {
  return {
    name: 'inline-entry-css',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        return html.replace(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g, (tag, href) => {
          const file = href.replace(/^\//, '')
          const asset = ctx.bundle[file]
          if (!asset || asset.type !== 'asset') return tag
          delete ctx.bundle[file]
          return `<style>${asset.source}</style>`
        })
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineEntryCss()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        // React dipisah ke chunk vendor: jarang berubah antar-deploy sehingga
        // cache browser tetap valid walau kode aplikasi diperbarui.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/setupTests.js', 'src/main.jsx'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
