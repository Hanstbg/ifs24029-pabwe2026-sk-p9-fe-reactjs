import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

export default function MarkdownViewer({ content }) {
  const elRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    viewerRef.current = new Viewer({ el: elRef.current, initialValue: content })
    return () => viewerRef.current.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    viewerRef.current.setMarkdown(content)
  }, [content])

  return <div ref={elRef} data-testid="markdown-viewer" />
}
