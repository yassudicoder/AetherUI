const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    uiDna: {
      lastRun: null,
      provider: 'auto',
    },
  })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'UI_DNA_RUN_ANALYSIS') {
    return false
  }

  void fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message.payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Analysis request failed')
      }

      return res.json()
    })
    .then((data) => {
      chrome.storage.local.set({
        uiDna: {
          lastRun: new Date().toISOString(),
          lastResponse: data,
        },
      })
      sendResponse({ ok: true, data })
    })
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown analysis error',
      })
    })

  return true
})
