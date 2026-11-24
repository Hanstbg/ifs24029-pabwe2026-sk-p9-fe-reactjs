import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value, onChange }) {
  const elRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: elRef.current,
      height: '55vh',
      initialValue: value,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      events: { change: () => onChangeRef.current(editor.getMarkdown()) },
    })
    return () => editor.destroy()
    // editor dibuat sekali; nilai selanjutnya dikelola oleh editor itu sendiri
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={elRef} data-testid="markdown-editor" />
}
