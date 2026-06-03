import { ElementSelector } from './elementSelector'
import { extractUIData } from './extractor'
import type { ExtractionOptions, ExtractedUIData } from '../types'

declare global {
  interface Window {
    __UI_DNA_INJECTED__?: boolean
  }
}

// Prevent duplicate listener registrations when the content script is injected programmatically
if (!window.__UI_DNA_INJECTED__) {
  window.__UI_DNA_INJECTED__ = true

// Safely send messages to the extension background; guard against
// "Extension context invalidated" errors when the extension reloads.
const safeSendMessage = (message: unknown): void => {
  try {
    // defensive checks in case runtime is unavailable during reload
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
      chrome.runtime.sendMessage(message, () => {
        void chrome.runtime.lastError
      })
    }
  } catch (err) {
    // ignore failures caused by extension unload/reload; useful during development
    // eslint-disable-next-line no-console
    console.debug('[ui-dna] safeSendMessage failed', err)
  }
}

const selector = new ElementSelector()
let selectedElement: HTMLElement | null = null
let lastHoveredElement: HTMLElement | null = null

const DEFAULT_OPTIONS: ExtractionOptions = {
  typography: true,
  colors: true,
  layout: true,
  animations: true,
  heroSection: true,
  buttonsAndCTA: true,
  spacingSystem: true,
  designLanguage: true,
  responsiveBehavior: true,
  hoverEffects: true,
  componentStructure: true,
}

const postSelectionNotice = (element: HTMLElement): void => {
  selectedElement = element
  safeSendMessage({
    type: 'UI_DNA_ELEMENT_SELECTED',
    payload: {
      tag: element.tagName.toLowerCase(),
      className: element.className?.toString() ?? '',
      id: element.id ?? '',
      textPreview: (element.textContent ?? '').trim().slice(0, 120),
    },
  })
}

const postHoverNotice = (element: HTMLElement): void => {
  lastHoveredElement = element
  safeSendMessage({
    type: 'UI_DNA_HOVER_UPDATED',
    payload: {
      tag: element.tagName.toLowerCase(),
      className: element.className?.toString() ?? '',
      id: element.id ?? '',
      textPreview: (element.textContent ?? '').trim().slice(0, 90),
    },
  })
}

const buildQuickPrompt = (element: HTMLElement): string => {
  const computed = getComputedStyle(element)
  const section = selector.getSelectedElement() ?? element
  const type = section.tagName.toLowerCase()
  const title = type === 'nav' ? 'navigation' : type === 'button' ? 'cta' : 'content section'

  return [
    `Design a premium ${title} inspired by this hovered UI area.`,
    `Use ${computed.fontFamily.split(',')[0] || 'a modern sans-serif'} typography, ${computed.borderRadius} radius geometry, and ${computed.backgroundColor} surfaces.`,
    `The interaction language should feel cinematic, polished, and intentionally minimal.`,
  ].join(' ')
}

const performExtraction = async (options: ExtractionOptions): Promise<ExtractedUIData> => {
  const root = selectedElement ?? document.body
  const extracted = extractUIData(root)

  // Options are reserved for future selective filtering in the extraction pipeline.
  if (Object.values(options).some(Boolean) === false) {
    return extracted
  }

  return extracted
}

const analyzeHoveredSection = async (): Promise<void> => {
  if (!lastHoveredElement) {
    safeSendMessage({ type: 'UI_DNA_Q_ANALYZE_RESULT', payload: { error: 'Hover a section first.' } })
    return
  }

  const data = extractUIData(lastHoveredElement)
  const quickPrompt = buildQuickPrompt(lastHoveredElement)

  safeSendMessage({ type: 'UI_DNA_Q_ANALYZE_RESULT', payload: { data, quickPrompt } })
}

const copyQuickPrompt = async (): Promise<void> => {
  if (!lastHoveredElement) {
    return
  }

  const prompt = buildQuickPrompt(lastHoveredElement)
  await navigator.clipboard.writeText(prompt)
  safeSendMessage({ type: 'UI_DNA_COPY_FEEDBACK', payload: { label: 'Prompt copied successfully' } })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'UI_DNA_START_SELECTION') {
    selector.start(postSelectionNotice, postHoverNotice, analyzeHoveredSection)
      sendResponse({ ok: true })
    return true
  }

  if (message?.type === 'UI_DNA_STOP_SELECTION') {
    selector.stop()
    sendResponse({ ok: true })
    return true
  }

  if (message?.type === 'UI_DNA_EXTRACT') {
    void performExtraction(message.payload?.options ?? DEFAULT_OPTIONS)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Extraction failed',
        })
      })

    return true
  }

  if (message?.type === 'UI_DNA_QUICK_ANALYZE') {
    void analyzeHoveredSection()
    sendResponse({ ok: true })
    return true
  }

  if (message?.type === 'UI_DNA_TOGGLE_OVERLAY') {
    selector.toggleOverlay()
    sendResponse({ ok: true })
    return true
  }

  if (message?.type === 'UI_DNA_COPY_PROMPT') {
    void copyQuickPrompt().then(() => sendResponse({ ok: true })).catch((error: unknown) => {
      sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Copy failed' })
    })
    return true
  }

  return false
})
}
