import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Download, Loader2, Maximize2, Minimize2, ScanSearch, Sparkles, WandSparkles, X } from 'lucide-react'
import { ExtractionOptionsPanel } from './components/ExtractionOptionsPanel'
import { InspectorPanel } from './components/InspectorPanel'
import { OutputTabs } from './components/OutputTabs'
import { VisualDnaPreview } from './components/VisualDnaPreview'
import { ANALYSIS_TABS, type TabId } from './analysisTabs'
import { Badge, Button, Card, Section } from './components/ui'
import type { AnalysisOutput, ExtractionKey, ExtractionOptions, ExtractedUIData } from '../types'
import { buildLocalAnalysis } from '../ai/uiAnalyzer'

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

const EMPTY_OUTPUT: AnalysisOutput = {
  aiPrompt: 'Run analysis to generate an AI-ready interface prompt.',
  designAnalysis: 'Run analysis to generate design analysis output.',
  designDna: 'Run analysis to generate design DNA output.',
  buildPattern: 'Run analysis to generate build pattern output.',
  typography: 'Run analysis to generate typography analysis.',
  layout: 'Run analysis to generate layout analysis.',
  components: 'Run analysis to generate component analysis.',
  tailwindTokens: 'Run analysis to generate reusable tokens.',
  reactGuidance: 'Run analysis to generate React component guidance.',
  motionAnalysis: 'Run analysis to generate motion analysis.',
  jsonExport: '{\n  "message": "Run analysis first"\n}',
}

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id) {
    throw new Error('No active browser tab found.')
  }

  return tab
}

// Send a message to a tab, injecting the content script if the receiving end doesn't exist.
const sendToTabSafe = async (tabId: number, message: unknown): Promise<any> => {
  try {
    const res = await chrome.tabs.sendMessage(tabId, message)
    // If there's no listener, Chrome may resolve to undefined. Treat that as missing.
    if (typeof res === 'undefined') {
      // attempt to inject content script and retry once
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['assets/content.js'] })
        return await chrome.tabs.sendMessage(tabId, message)
      } catch (injectErr) {
        throw injectErr
      }
    }

    return res
  } catch (err) {
    // try to inject and retry once
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['assets/content.js'] })
      return await chrome.tabs.sendMessage(tabId, message)
    } catch (finalErr) {
      throw finalErr
    }
  }
}

const requestContentExtraction = async (options: ExtractionOptions): Promise<ExtractedUIData> => {
  const tab = await getActiveTab()
  const response = await sendToTabSafe(tab.id!, {
    type: 'UI_DNA_EXTRACT',
    payload: { options },
  })

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Failed to extract UI data from page.')
  }

  return response.data as ExtractedUIData
}

const runServerAnalysis = async (data: ExtractedUIData, options: ExtractionOptions): Promise<AnalysisOutput | null> => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'UI_DNA_RUN_ANALYSIS',
      payload: { data, options },
    })

    if (!response?.ok) {
      return null
    }

    return response.data as AnalysisOutput
  } catch {
    return null
  }
}

const toClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

function App() {
  const toastTimer = useRef<number | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('aiPrompt')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hoverSummary, setHoverSummary] = useState('Move across the page while selecting to inspect live design signals.')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastExtractedData, setLastExtractedData] = useState<ExtractedUIData | null>(null)
  const [options, setOptions] = useState<ExtractionOptions>(DEFAULT_OPTIONS)
  const [output, setOutput] = useState<AnalysisOutput>(EMPTY_OUTPUT)
  const [selectedElementSummary, setSelectedElementSummary] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const enabledCount = useMemo(() => Object.values(options).filter(Boolean).length, [options])
  const activeTabLabel = useMemo(() => ANALYSIS_TABS.find((tab) => tab.id === activeTab)?.label ?? 'Analysis', [activeTab])

  const showToast = useCallback((message: string, duration = 1500) => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }

    setToastMessage(message)
    toastTimer.current = window.setTimeout(() => setToastMessage(null), duration)
  }, [])

  const toggleOption = useCallback((key: ExtractionKey) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const startSelection = useCallback(async () => {
    setErrorMessage(null)

    try {
      const tab = await getActiveTab()
      await sendToTabSafe(tab.id!, { type: 'UI_DNA_START_SELECTION' })
      setIsSelecting(true)
      showToast('Live inspector enabled')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start selector.')
    }
  }, [showToast])

  const stopSelection = useCallback(async () => {
    try {
      const tab = await getActiveTab()
      await sendToTabSafe(tab.id!, { type: 'UI_DNA_STOP_SELECTION' })
      setIsSelecting(false)
    } catch {
      setIsSelecting(false)
    }
  }, [])

  const toggleOverlay = useCallback(async () => {
    try {
      const tab = await getActiveTab()
      await sendToTabSafe(tab.id!, { type: 'UI_DNA_TOGGLE_OVERLAY' })
      showToast('Overlay toggled', 1200)
    } catch {
      setErrorMessage('Overlay toggle is available after selection starts.')
    }
  }, [showToast])

  const runQuickAnalyze = useCallback(async () => {
    try {
      const tab = await getActiveTab()
      await sendToTabSafe(tab.id!, { type: 'UI_DNA_QUICK_ANALYZE' })
      showToast('Quick analysis requested', 1200)
    } catch {
      setErrorMessage('Start selection and hover a section first.')
    }
  }, [showToast])

  const runExtraction = useCallback(async () => {
    setErrorMessage(null)
    setIsRunning(true)

    try {
      const extracted = await requestContentExtraction(options)
      const local = buildLocalAnalysis(extracted)
      const server = await runServerAnalysis(extracted, options)
      setLastExtractedData(extracted)
      setOutput(server ?? local)
      setActiveTab('aiPrompt')
      showToast('Analysis generated')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Extraction failed.')
    } finally {
      setIsRunning(false)
    }
  }, [options, showToast])

  const copyAnalysisPart = useCallback(
    async (value: string, label: string) => {
      await toClipboard(value)
      showToast(`${label} copied`)
    },
    [showToast],
  )

  const copyPrompt = useCallback(async () => {
    await copyAnalysisPart(output.aiPrompt, 'Prompt')
  }, [copyAnalysisPart, output.aiPrompt])

  const copyFullAnalysis = useCallback(async () => {
    await copyAnalysisPart(
      [output.designDna, output.buildPattern, output.motionAnalysis, output.tailwindTokens, output.typography, output.layout, output.components].join('\n\n'),
      'Full analysis',
    )
  }, [copyAnalysisPart, output])

  const exportJson = useCallback(() => {
    const blob = new Blob([output.jsonExport], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'aetherui-analysis.json'
    link.click()
    URL.revokeObjectURL(url)
    showToast('JSON export downloaded')
  }, [output.jsonExport, showToast])

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const listener = (message: unknown) => {
      const payload = message as {
        type?: string
        payload?: {
          className?: string
          data?: ExtractedUIData
          error?: string
          id?: string
          label?: string
          quickPrompt?: string
          tag?: string
          textPreview?: string
        }
      }

      if (payload?.type === 'UI_DNA_ELEMENT_SELECTED') {
        setIsSelecting(false)
        const tag = payload.payload?.tag ?? 'div'
        const className = payload.payload?.className ? `.${payload.payload.className.split(' ')[0]}` : ''
        const id = payload.payload?.id ? `#${payload.payload.id}` : ''
        const text = payload.payload?.textPreview ? ` "${payload.payload.textPreview}"` : ''
        setSelectedElementSummary(`${tag}${id}${className}${text}`)
        showToast('Section selected')
        return
      }

      if (payload?.type === 'UI_DNA_SELECTION_EXITED') {
        setIsSelecting(false)
        return
      }

      if (payload?.type === 'UI_DNA_HOVER_UPDATED') {
        const tag = payload.payload?.tag ?? 'div'
        const className = payload.payload?.className ? `.${payload.payload.className.split(' ')[0]}` : ''
        setHoverSummary(`Hovering ${tag}${className}`)
        return
      }

      if (payload?.type === 'UI_DNA_Q_ANALYZE_RESULT' && payload.payload?.data) {
        setLastExtractedData(payload.payload.data)
        setOutput(buildLocalAnalysis(payload.payload.data))
        setActiveTab('aiPrompt')
        showToast('Quick analysis generated')
        return
      }

      if (payload?.type === 'UI_DNA_Q_ANALYZE_RESULT' && payload.payload?.error) {
        setErrorMessage(payload.payload.error)
        return
      }

      if (payload?.type === 'UI_DNA_COPY_FEEDBACK') {
        showToast(payload.payload?.label ?? 'Copied')
      }
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [showToast])

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c' && (event.metaKey || event.ctrlKey)) {
        return
      }

      if (event.key.toLowerCase() === 'q') {
        await runQuickAnalyze()
      }

      if (event.key.toLowerCase() === 'w') {
        await toggleOverlay()
      }

      if (event.key.toLowerCase() === 'e') {
        setIsExpanded((value) => !value)
      }

      if (event.key.toLowerCase() === 'c') {
        await copyPrompt()
      }

      if (event.key === 'Escape') {
        await stopSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copyPrompt, runQuickAnalyze, stopSelection, toggleOverlay])

  return (
    <div className="relative h-[720px] w-[440px] overflow-hidden bg-[#07090f] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#07090f_0%,#111114_52%,#07110f_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090f]/88 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_16px_44px_-26px_rgba(34,211,238,1)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase text-zinc-500">UI DNA Extractor</div>
                <h1 className="truncate text-lg font-semibold leading-6 text-zinc-50">AetherUI</h1>
              </div>
            </div>
            <Badge tone={isSelecting ? 'info' : isRunning ? 'warning' : 'success'}>
              {isSelecting ? 'Live' : isRunning ? 'Working' : 'Ready'}
            </Badge>
          </div>
        </header>

        <main className="scrollbar-none flex-1 space-y-4 overflow-y-auto scroll-smooth px-4 py-4">
          <Section
            eyebrow="Command Center"
            title="Capture Workflow"
            action={<Badge tone={enabledCount > 0 ? 'info' : 'danger'}>{enabledCount} signals</Badge>}
          >
            <div className="grid grid-cols-2 gap-2">
              <Button variant={isSelecting ? 'danger' : 'primary'} icon={isSelecting ? X : ScanSearch} onClick={isSelecting ? stopSelection : startSelection}>
                {isSelecting ? 'Stop Select' : 'Select'}
              </Button>
              <Button
                variant="primary"
                icon={isRunning ? Loader2 : WandSparkles}
                isLoading={isRunning}
                disabled={enabledCount === 0}
                onClick={runExtraction}
              >
                {isRunning ? 'Analyzing' : 'Analyze'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" icon={Copy} onClick={copyFullAnalysis}>
                Full
              </Button>
              <Button variant="secondary" icon={Check} onClick={copyPrompt}>
                Prompt
              </Button>
              <Button variant="secondary" icon={Download} onClick={exportJson}>
                Export
              </Button>
            </div>
          </Section>

          <InspectorPanel
            errorMessage={errorMessage}
            hoverSummary={hoverSummary}
            isRunning={isRunning}
            isSelecting={isSelecting}
            onExitSelection={stopSelection}
            onQuickAnalyze={runQuickAnalyze}
            onToggleOverlay={toggleOverlay}
            selectedElementSummary={selectedElementSummary}
          />

          <VisualDnaPreview data={lastExtractedData} />

          <ExtractionOptionsPanel options={options} onToggle={toggleOption} />

          <OutputTabs
            activeTab={activeTab}
            onCopyActive={() => copyAnalysisPart(output[activeTab], activeTabLabel)}
            onCopyFull={copyFullAnalysis}
            onExport={exportJson}
            onTabChange={setActiveTab}
            output={output}
          />

          <Button
            className="w-full"
            icon={isExpanded ? Minimize2 : Maximize2}
            variant="ghost"
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? 'Collapse Deep View' : 'Open Deep View'}
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <Card className="space-y-4 p-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase text-zinc-500">Deep View</div>
                    <h2 className="mt-1 text-sm font-semibold text-zinc-50">Build Intelligence</h2>
                  </div>

                  <div className="space-y-4 text-xs leading-5 text-zinc-300">
                    <div className="border-t border-white/10 pt-4">
                      <div className="mb-2 font-semibold text-zinc-100">System Read</div>
                      <p className="whitespace-pre-wrap">{output.designAnalysis}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="mb-2 font-semibold text-zinc-100">React Guidance</div>
                      <p className="whitespace-pre-wrap">{output.reactGuidance}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 8, x: '-50%', scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-4 left-1/2 z-30 rounded-full border border-emerald-300/25 bg-[#080a0f]/95 px-4 py-2 text-xs font-medium text-emerald-100 shadow-[0_18px_54px_-24px_rgba(52,211,153,0.9)] backdrop-blur-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
