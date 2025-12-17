export async function fetchSessionList(page = 1, pageSize = 20) {
  try {
    const url = `/api/chat/history?page=${page}&page_size=${pageSize}`
    const response = await fetch(url)
    if (!response.ok) return { items: [], total: 0 }
    const payload = await response.json()
    return payload.data || { items: [], total: 0 }
  } catch (e) {
    console.error(e)
    return { items: [], total: 0 }
  }
}

export async function fetchSessionHistory(sessionId) {
  try {
    const url = `/api/chat/history?session_id=${encodeURIComponent(sessionId)}`
    const response = await fetch(url)
    if (!response.ok) return { history: [], session_id: sessionId }
    const payload = await response.json()
    return payload.data || { history: [], session_id: sessionId }
  } catch (e) {
    console.error(e)
    return { history: [], session_id: sessionId }
  }
}
