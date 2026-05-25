import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Download, Files } from 'lucide-react'
import type { AnalysisOutput } from '../../types'
import { ANALYSIS_TABS } from '../analysisTabs'
import type { TabId } from '../analysisTabs'
import { Button, Card, Tab } from './ui'

interface Props {
  activeTab: TabId
  onCopyActive: () => void
  onCopyFull: () => void
  onExport: () => void
  onTabChange: (tab: TabId) => void
  output: AnalysisOutput
}

export const OutputTabs = ({ activeTab, onCopyActive, onCopyFull, onExport, onTabChange, output }: Props) => {
  const activeLabel = ANALYSIS_TABS.find((tab) => tab.id === activeTab)?.label ?? 'Analysis'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase text-zinc-500">Analysis Console</div>
          <h2 className="mt-1 truncate text-sm font-semibold text-zinc-50">{activeLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={Copy} onClick={onCopyActive}>
            Copy
          </Button>
          <Button size="sm" variant="secondary" icon={Files} onClick={onCopyFull}>
            Full
          </Button>
          <Button size="sm" variant="secondary" icon={Download} onClick={onExport}>
            Export
          </Button>
        </div>
      </div>

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-2">
        {ANALYSIS_TABS.map((tab) => (
          <Tab key={tab.id} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)}>
            {tab.label}
          </Tab>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[#07080d]/80">
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="scrollbar-none max-h-72 overflow-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-zinc-200"
          >
            {output[activeTab]}
          </motion.pre>
        </AnimatePresence>
      </div>
    </Card>
  )
}
