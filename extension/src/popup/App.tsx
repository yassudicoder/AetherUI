import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Check, Crown, Download, Loader2, Maximize2, Minimize2, ScanSearch, Sparkles, Star, WandSparkles, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ExtractionOptionsPanel } from './components/ExtractionOptionsPanel'
import { InspectorPanel } from './components/InspectorPanel'
import { OutputTabs } from './components/OutputTabs'
import { VisualDnaPreview } from './components/VisualDnaPreview'
import { AccountPanel } from './components/AccountPanel'
import { PremiumUpsellModal } from './components/PremiumUpsellModal'
import { ANALYSIS_TABS, type TabId } from './analysisTabs'
import { Badge, Button, Card, Section } from './components/ui'
import type { AnalysisOutput, ExtractionKey, ExtractionOptions, ExtractedUIData, SavedAnalysisRecord, SignInProvider } from '../types'
import { buildLocalAnalysis } from '../ai/uiAnalyzer'
import { DEFAULT_ACCOUNT, DEFAULT_USAGE, PRO_BENEFITS, createAccountProfile, createUpgradeState, getQuotaStatus, readProductState, resetDailyUsageIfNeeded, type ProductState, writeProductState } from './state'

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
  aiPrompt: 'Run analysis to generate a premium AI-ready prompt.',
  designAnalysis: 'Run analysis to unlock premium design intelligence.',
  designDna: 'Run analysis to reveal color DNA and style signals.',
  landingPageDna: 'Run analysis to reveal landing page DNA.',
  whyThisWorks: 'Run analysis to learn why the design works.',
  stylePersonality: 'Run analysis to identify the style personality.',
  aetherScore: 'Run analysis to generate the AetherUI scorecard.',
  buildPattern: 'Run analysis to generate build pattern output.',
  colorDna: 'Run analysis to generate color DNA output.',
  typography: 'Run analysis to generate typography analysis.',
  layout: 'Run analysis to generate spacing and layout analysis.',
  components: 'Run analysis to generate component analysis.',
  tailwindTokens: 'Run analysis to generate reusable tokens.',
  similarDesign: 'Run analysis to generate similar design ideas.',
  cursorExport: 'Run analysis to generate Cursor export text.',
  v0Export: 'Run analysis to generate v0 export text.',
  reactGuidance: 'Run analysis to generate React component guidance.',
  motionAnalysis: 'Run analysis to generate motion analysis.',
  jsonExport: '{\n  "message": "Run analysis first"\n}',
}

type ViewId = 'analyze' | 'results' | 'export' | 'account'

const VIEWS: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: 'analyze', label: 'Analyze', icon: WandSparkles },
  { id: 'results', label: 'Results', icon: ScanSearch },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'account', label: 'Account', icon: BadgeCheck },
]

const viewMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18, ease: 'easeOut' as const },
}

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id) {
    throw new Error('No active browser tab found.')
  }

  return tab
}

// Chrome refuses to run/inject scripts on these pages and throws errors like
// "The extensions gallery cannot be scripted." Block them before we ever attempt injection.
const RESTRICTED_HOST = /^(chrome\.google\.com\/webstore|chromewebstore\.google\.com|microsoftedge\.microsoft\.com)/i

const isInjectableUrl = (url?: string): boolean => {
  if (!url) {
    return false
  }

  if (!/^(https?:|file:)/i.test(url)) {
    return false
  }

  // Strip the scheme so we can match the host + path of the various extension galleries.
  const withoutScheme = url.replace(/^https?:\/\//i, '')
  return !RESTRICTED_HOST.test(withoutScheme)
}

const sendToTabSafe = async (tabId: number, message: unknown): Promise<any> => {
  const sendOnce = () =>
    new Promise<any>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const runtimeError = chrome.runtime.lastError?.message
        if (runtimeError) {
          reject(new Error(runtimeError))
          return
        }

        resolve(response)
      })
    })

  try {
    return await sendOnce()
  } catch (error) {
    const runtimeMessage = error instanceof Error ? error.message : 'Unknown messaging error'

    if (!/Receiving end does not exist|Could not establish connection/i.test(runtimeMessage)) {
      throw error
    }

    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['assets/content.js'] })
    } catch (injectError) {
      const injectMessage = injectError instanceof Error ? injectError.message : ''
      // Chrome blocks scripting on the Web Store, chrome:// pages, the new-tab page, etc.
      if (/cannot be scripted|Cannot access|chrome:\/\/|extensions gallery/i.test(injectMessage)) {
        throw new Error(
          'AetherUI works on regular web pages. This page (e.g. the Chrome Web Store, a chrome:// page, or a new tab) is protected by the browser and cannot be analyzed.',
        )
      }
      throw new Error(
        'Could not load AetherUI on this page. Reload the page and try again — pages opened before the extension was installed need a refresh.',
      )
    }

    return await sendOnce().catch((retryError) => {
      throw new Error(
        retryError instanceof Error
          ? retryError.message
          : 'AetherUI works on regular web pages. Open a site like a landing page or product page, then try again.',
      )
    })
  }
}

const requestContentExtraction = async (options: ExtractionOptions): Promise<ExtractedUIData> => {
  const tab = await getActiveTab()

  if (!isInjectableUrl(tab.url)) {
    throw new Error('AetherUI can only analyze regular web pages. Open a live site first.')
  }

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
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'UI_DNA_RUN_ANALYSIS',
          payload: { data, options },
        },
        (result) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message })
            return
          }

          resolve(result)
        },
      )
    })

    return response?.ok ? (response.data as AnalysisOutput) : null
  } catch {
    return null
  }
}

const toClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

const syncState = (state: ProductState): ProductState => {
  const usage = resetDailyUsageIfNeeded(state.usage)

  return {
    ...state,
    usage,
    account: {
      ...state.account,
      savedAnalyses: state.savedAnalyses.length,
      favorites: state.savedAnalyses.filter((item) => item.favorite).length,
    },
  }
}

const createAnalysisRecord = (data: ExtractedUIData): SavedAnalysisRecord => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: data.title || 'Untitled analysis',
  url: data.url,
  styleLabel: data.styleIntelligence.styleLabel,
  createdAt: data.extractedAt,
  favorite: false,
})

function App() {
  const toastTimer = useRef<number | null>(null)
  const [view, setView] = useState<ViewId>('analyze')
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
  const [productState, setProductState] = useState<ProductState>({
    account: DEFAULT_ACCOUNT,
    usage: DEFAULT_USAGE,
    savedAnalyses: [],
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    title: 'Upgrade to Pro',
    message: 'Unlock the full AI-native design intelligence experience.',
  })

  const activeTabLabel = useMemo(() => ANALYSIS_TABS.find((tab) => tab.id === activeTab)?.label ?? 'Analysis', [activeTab])
  const quota = useMemo(() => getQuotaStatus(syncState(productState)), [productState])
  const currentAnalysisLabel = useMemo(() => lastExtractedData?.styleIntelligence.styleLabel ?? 'Ready to analyze', [lastExtractedData])

  const showToast = useCallback((message: string, duration = 1500) => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }

    setToastMessage(message)
    toastTimer.current = window.setTimeout(() => setToastMessage(null), duration)
  }, [])

  const updateProductState = useCallback((recipe: (state: ProductState) => ProductState) => {
    setProductState((current) => syncState(recipe(syncState(current))))
  }, [])

  const openUpgradeModal = useCallback((title: string, message: string) => {
    setUpgradeModal({ open: true, title, message })
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModal((current) => ({ ...current, open: false }))
  }, [])

  const commitUpgrade = useCallback(() => {
    updateProductState((current) => ({
      ...current,
      account: createUpgradeState(current.account, 'pro'),
    }))
    closeUpgradeModal()
    showToast('Pro unlocked')
  }, [closeUpgradeModal, showToast, updateProductState])

  const connectProvider = useCallback(
    (provider: SignInProvider) => {
      updateProductState((current) => ({
        ...current,
        account: {
          ...current.account,
          ...createAccountProfile(provider),
          plan: current.account.plan,
          savedAnalyses: current.account.savedAnalyses,
          promptHistory: current.account.promptHistory,
          exportedPrompts: current.account.exportedPrompts,
          favorites: current.account.favorites,
        },
      }))
      showToast(`${provider === 'google' ? 'Google' : 'GitHub'} connected`)
    },
    [showToast, updateProductState],
  )

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

    if (!quota.unlimited && quota.aiAnalysesRemaining <= 0) {
      openUpgradeModal(
        'Daily limit reached',
        'Free plans include 5 AI analyses per day. Upgrade to Pro for unlimited analysis, stronger exports, and full landing-page intelligence.',
      )
      return
    }

    setIsRunning(true)

    try {
      const extracted = await requestContentExtraction(options)
      const local = buildLocalAnalysis(extracted)
      const server = await runServerAnalysis(extracted, options)
      const nextOutput = server ?? local

      setLastExtractedData(extracted)
      setOutput(nextOutput)
      setActiveTab('aiPrompt')
      setView('results')
      updateProductState((current) => ({
        ...current,
        usage: {
          ...current.usage,
          aiAnalyses: current.usage.aiAnalyses + 1,
        },
        account: {
          ...current.account,
          promptHistory: current.account.promptHistory + 1,
        },
        savedAnalyses: [createAnalysisRecord(extracted), ...current.savedAnalyses].slice(0, 30),
      }))
      showToast('Analysis generated')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Extraction failed.')
    } finally {
      setIsRunning(false)
    }
  }, [openUpgradeModal, options, quota.aiAnalysesRemaining, quota.unlimited, showToast, updateProductState])

  const copyAnalysisPart = useCallback(
    async (value: string, label: string, countAsExport = true) => {
      if (countAsExport && !quota.unlimited && quota.exportsRemaining <= 0) {
        openUpgradeModal(
          'Export limit reached',
          'Free plans include 3 prompt exports per day. Upgrade to Pro for unlimited copy and export workflows.',
        )
        return
      }

      await toClipboard(value)
      showToast(`${label} copied`)

      if (countAsExport) {
        updateProductState((current) => ({
          ...current,
          usage: {
            ...current.usage,
            exports: current.usage.exports + 1,
          },
          account: {
            ...current.account,
            exportedPrompts: current.account.exportedPrompts + 1,
          },
        }))
      }
    },
    [openUpgradeModal, quota.exportsRemaining, quota.unlimited, showToast, updateProductState],
  )

  const copyPrompt = useCallback(async () => {
    await copyAnalysisPart(output.aiPrompt, 'Prompt')
  }, [copyAnalysisPart, output.aiPrompt])

  const copyFullAnalysis = useCallback(async () => {
    await copyAnalysisPart(
      [
        output.aetherScore,
        output.landingPageDna,
        output.whyThisWorks,
        output.stylePersonality,
        output.designAnalysis,
        output.designDna,
        output.buildPattern,
        output.similarDesign,
        output.motionAnalysis,
        output.tailwindTokens,
        output.typography,
        output.layout,
        output.components,
      ].join('\n\n'),
      'Full analysis',
    )
  }, [copyAnalysisPart, output])

  const exportJson = useCallback(() => {
    void copyAnalysisPart(output.jsonExport, 'JSON export')
  }, [copyAnalysisPart, output.jsonExport])

  const copyActiveTab = useCallback(async () => {
    await copyAnalysisPart(output[activeTab], activeTabLabel)
  }, [activeTab, activeTabLabel, copyAnalysisPart, output])

  const favoriteLatestAnalysis = useCallback(() => {
    if (!lastExtractedData) {
      showToast('Run an analysis first', 1200)
      return
    }

    updateProductState((current) => {
      if (current.savedAnalyses.length === 0) {
        return current
      }

      const [first, ...rest] = current.savedAnalyses
      return {
        ...current,
        savedAnalyses: [{ ...first, favorite: !first.favorite }, ...rest],
      }
    })
    showToast('Favorite updated')
  }, [lastExtractedData, showToast, updateProductState])

  const handleSimilarityAction = useCallback(
    async (label: string) => {
      if (!quota.unlimited && quota.exportsRemaining <= 0) {
        openUpgradeModal(
          'Similarity Studio is Pro',
          'Generate Similar Design is part of Pro. Upgrade to explore alternate heroes, CTAs, and layouts with the same emotional style.',
        )
        return
      }

      await copyAnalysisPart(`${label}\n\n${output.similarDesign}`, label)
      setActiveTab('similarDesign')
    },
    [copyAnalysisPart, openUpgradeModal, output.similarDesign, quota.exportsRemaining, quota.unlimited],
  )

  const handleExportTarget = useCallback(
    async (target: 'cursor' | 'v0' | 'chatgpt' | 'claude' | 'react' | 'tailwind' | 'json') => {
      const payloadMap: Record<'cursor' | 'v0' | 'chatgpt' | 'claude' | 'react' | 'tailwind' | 'json', string> = {
        cursor: output.cursorExport,
        v0: output.v0Export,
        chatgpt: [output.aiPrompt, output.whyThisWorks, output.stylePersonality].join('\n\n'),
        claude: [output.aiPrompt, output.landingPageDna, output.aetherScore].join('\n\n'),
        react: output.reactGuidance,
        tailwind: output.tailwindTokens,
        json: output.jsonExport,
      }

      await copyAnalysisPart(payloadMap[target], `${target.toUpperCase()} export`)
    },
    [copyAnalysisPart, output],
  )

  useEffect(() => {
    let mounted = true

    void (async () => {
      const stored = await readProductState()
      if (mounted) {
        setProductState(syncState(stored))
        setIsHydrated(true)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    void writeProductState(syncState(productState))
  }, [isHydrated, productState])

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
        setView('results')
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
    <div className="relative h-[760px] w-[460px] overflow-hidden bg-[#06070d] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#123046_0%,rgba(6,7,13,0)_48%),linear-gradient(145deg,#06070d_0%,#0c111a_56%,#081311_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#06070d]/78 px-4 pb-3 pt-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_18px_44px_-24px_rgba(34,211,238,1)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">AI Design Intelligence</div>
                <h1 className="truncate text-base font-semibold leading-5 text-zinc-50">AetherUI</h1>
              </div>
            </div>
            <Badge tone={productState.account.plan === 'pro' ? 'success' : isSelecting ? 'info' : isRunning ? 'warning' : 'neutral'}>
              {productState.account.plan === 'pro' ? 'Pro' : isSelecting ? 'Live' : isRunning ? 'Working' : 'Free'}
            </Badge>
          </div>

          <nav className="mt-4 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
            {VIEWS.map((item) => {
              const active = view === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={clsx(
                    'relative flex h-9 items-center justify-center rounded-lg text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-200/60',
                    active ? 'text-cyan-50' : 'text-zinc-400 hover:text-zinc-100',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-view-pill"
                      className="absolute inset-0 rounded-lg border border-cyan-300/25 bg-cyan-300/12 shadow-[0_10px_28px_-18px_rgba(34,211,238,0.95)]"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </header>

        <main className="scrollbar-none flex-1 overflow-y-auto scroll-smooth px-4 py-4">
          <AnimatePresence mode="wait">
            {view === 'analyze' && (
              <motion.div key="analyze" {...viewMotion} className="space-y-4">
                <Card className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Capture</div>
                      <h2 className="mt-1 text-lg font-semibold text-zinc-50">Analyze this page</h2>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-400">
                        Turn the current page into premium prompts, design DNA, and AI-ready intelligence.
                      </p>
                    </div>
                    <Badge tone={quota.unlimited ? 'success' : 'info'}>{quota.unlimited ? 'Unlimited' : `${quota.aiAnalysesRemaining}/5`}</Badge>
                  </div>

                  <Button className="h-12 w-full text-sm" variant="primary" icon={isRunning ? Loader2 : WandSparkles} isLoading={isRunning} onClick={runExtraction}>
                    {isRunning ? 'Analyzing page…' : 'Analyze'}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={isSelecting ? 'danger' : 'secondary'} icon={isSelecting ? X : ScanSearch} onClick={isSelecting ? stopSelection : startSelection}>
                      {isSelecting ? 'Stop Select' : 'Select Section'}
                    </Button>
                    <Button variant="secondary" icon={Sparkles} onClick={runQuickAnalyze}>
                      Quick (Q)
                    </Button>
                  </div>
                </Card>

                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Style</div>
                    <div className="mt-2 truncate text-sm font-semibold text-zinc-50">{currentAnalysisLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Saved</div>
                    <div className="mt-2 text-sm font-semibold text-zinc-50">{productState.account.savedAnalyses}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Exports</div>
                    <div className="mt-2 text-sm font-semibold text-zinc-50">{productState.account.exportedPrompts}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Favorites</div>
                    <div className="mt-2 text-sm font-semibold text-zinc-50">{productState.account.favorites}</div>
                  </div>
                </div>

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
              </motion.div>
            )}

            {view === 'results' && (
              <motion.div key="results" {...viewMotion} className="space-y-4">
                {!lastExtractedData && (
                  <Card className="p-4">
                    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">No analysis yet</div>
                    <p className="mt-1.5 text-xs leading-5 text-zinc-400">
                      Run an analysis from the <span className="text-zinc-200">Analyze</span> tab to generate prompts, DNA, and design intelligence here.
                    </p>
                    <Button className="mt-3 w-full" variant="primary" icon={WandSparkles} onClick={() => setView('analyze')}>
                      Go to Analyze
                    </Button>
                  </Card>
                )}

                <OutputTabs
                  activeTab={activeTab}
                  onCopyActive={() => void copyActiveTab()}
                  onCopyFull={copyFullAnalysis}
                  onExport={exportJson}
                  onTabChange={setActiveTab}
                  output={output}
                />

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" icon={Check} onClick={copyPrompt}>
                    Prompt
                  </Button>
                  <Button variant="secondary" icon={Download} onClick={copyFullAnalysis}>
                    Full
                  </Button>
                  <Button variant="secondary" icon={Star} onClick={favoriteLatestAnalysis}>
                    Favorite
                  </Button>
                </div>

                <Section
                  eyebrow="Similarity Studio"
                  title="Generate Similar Design"
                  description="Same emotional style, different composition, original structure."
                  action={<Badge tone={productState.account.plan === 'pro' ? 'success' : 'info'}>{productState.account.plan === 'pro' ? 'Pro ready' : 'Preview'}</Badge>}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" icon={Sparkles} onClick={() => void handleSimilarityAction('Generate Similar Hero')}>
                      Similar Hero
                    </Button>
                    <Button variant="secondary" icon={Sparkles} onClick={() => void handleSimilarityAction('Reimagine This Section')}>
                      Reimagine
                    </Button>
                    <Button variant="secondary" icon={Sparkles} onClick={() => void handleSimilarityAction('Create New Layout')}>
                      New Layout
                    </Button>
                    <Button variant="secondary" icon={Sparkles} onClick={() => void handleSimilarityAction('Generate Alternative CTA')}>
                      Alt CTA
                    </Button>
                  </div>
                </Section>

                <Button className="w-full" icon={isExpanded ? Minimize2 : Maximize2} variant="ghost" onClick={() => setIsExpanded((value) => !value)}>
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
                          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">Deep View</div>
                          <h2 className="mt-1 text-sm font-semibold text-zinc-50">Aesthetic Intelligence</h2>
                        </div>

                        <div className="space-y-4 text-xs leading-5 text-zinc-300">
                          <div className="border-t border-white/10 pt-4">
                            <div className="mb-2 font-semibold text-zinc-100">Why This Works</div>
                            <p className="whitespace-pre-wrap">{output.whyThisWorks}</p>
                          </div>
                          <div className="border-t border-white/10 pt-4">
                            <div className="mb-2 font-semibold text-zinc-100">Landing Page DNA</div>
                            <p className="whitespace-pre-wrap">{output.landingPageDna}</p>
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
              </motion.div>
            )}

            {view === 'export' && (
              <motion.div key="export" {...viewMotion} className="space-y-4">
                <Section
                  eyebrow="Export Studio"
                  title="Copy to AI tools"
                  description="Export the same design intelligence into Cursor, v0, ChatGPT, Claude, React, Tailwind, or JSON tokens."
                  action={<Badge tone={quota.unlimited ? 'success' : 'neutral'}>{quota.unlimited ? 'Unlimited' : `${quota.exportsRemaining}/3 exports`}</Badge>}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('cursor')}>
                      Cursor
                    </Button>
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('v0')}>
                      v0
                    </Button>
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('chatgpt')}>
                      ChatGPT
                    </Button>
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('claude')}>
                      Claude
                    </Button>
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('react')}>
                      React
                    </Button>
                    <Button variant="secondary" icon={Crown} onClick={() => void handleExportTarget('tailwind')}>
                      Tailwind
                    </Button>
                    <Button className="col-span-2" variant="secondary" icon={Download} onClick={() => void handleExportTarget('json')}>
                      JSON Design Tokens
                    </Button>
                  </div>
                </Section>
              </motion.div>
            )}

            {view === 'account' && (
              <motion.div key="account" {...viewMotion} className="space-y-4">
                <AccountPanel
                  account={productState.account}
                  usage={productState.usage}
                  onConnectGoogle={() => connectProvider('google')}
                  onConnectGitHub={() => connectProvider('github')}
                  onUpgrade={() => openUpgradeModal('Upgrade to Pro', 'Unlock unlimited AI analysis, full-page intelligence, and premium export workflows.')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <PremiumUpsellModal
        open={upgradeModal.open}
        benefits={PRO_BENEFITS}
        onClose={closeUpgradeModal}
        onUpgrade={commitUpgrade}
        title={upgradeModal.title}
        message={upgradeModal.message}
      />

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