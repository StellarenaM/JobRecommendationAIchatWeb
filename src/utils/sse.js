export async function startChatStream(payload, callbacks) {
  const { onStart, onChunk, onEnd, onError } = callbacks

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr === '[DONE]') return

          try {
            const data = JSON.parse(dataStr)

            // Adaptive handling based on common patterns
            console.log('[SSE] Received:', data)

            if (data.event === 'start' || (data.session_id && !data.content && !data.jobs)) {
                 onStart && onStart(data)
            }

            if (data.event === 'chunk' || data.content) {
              onChunk && onChunk(data)
            }

            if (data.event === 'end' || data.jobs || data.type === 'end') {
              // Handle nested data structure from backend
              if (data.event === 'end' && data.data) {
                  onEnd && onEnd(data.data)
              } else {
                  onEnd && onEnd(data)
              }
            }
          } catch (e) {
            console.error('[SSE] Parse error:', e, 'Raw:', dataStr)
          }
        }
      }
    }
  } catch (error) {
    console.error('[SSE] Connection error:', error)
    onError && onError(error)
  }
}
