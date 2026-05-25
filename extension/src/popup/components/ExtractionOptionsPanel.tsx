import { SlidersHorizontal } from 'lucide-react'
import type { ExtractionKey, ExtractionOptions } from '../../types'
import { Badge, Card } from './ui'

interface OptionItem {
  key: ExtractionKey
  label: string
}

const OPTIONS: OptionItem[] = [
  { key: 'typography', label: 'Typography' },
  { key: 'colors', label: 'Colors' },
  { key: 'layout', label: 'Layout' },
  { key: 'animations', label: 'Motion' },
  { key: 'heroSection', label: 'Hero' },
  { key: 'buttonsAndCTA', label: 'CTA' },
  { key: 'spacingSystem', label: 'Spacing' },
  { key: 'designLanguage', label: 'Language' },
  { key: 'responsiveBehavior', label: 'Responsive' },
  { key: 'hoverEffects', label: 'Hover' },
  { key: 'componentStructure', label: 'Structure' },
]

interface Props {
  onToggle: (key: ExtractionKey) => void
  options: ExtractionOptions
}

export const ExtractionOptionsPanel = ({ onToggle, options }: Props) => {
  const enabledCount = Object.values(options).filter(Boolean).length

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/20 text-cyan-100">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase text-zinc-500">Extraction Scope</div>
            <h2 className="mt-1 truncate text-sm font-semibold text-zinc-50">Signal Controls</h2>
          </div>
        </div>
        <Badge tone={enabledCount > 0 ? 'info' : 'danger'}>{enabledCount}/11 active</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {OPTIONS.map((item) => {
          const checked = options[item.key]

          return (
            <label
              key={item.key}
              className={`group flex h-10 cursor-pointer items-center justify-between gap-2 rounded-md border px-2 text-xs font-medium transition duration-200 ${
                checked
                  ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-50'
                  : 'border-white/10 bg-black/15 text-zinc-400 hover:border-white/18 hover:bg-white/[0.055] hover:text-zinc-200'
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span
                className={`flex h-4 w-8 items-center rounded-full border p-0.5 transition duration-200 ${
                  checked ? 'border-cyan-200/40 bg-cyan-300/30' : 'border-white/10 bg-white/[0.055]'
                }`}
              >
                <span className={`h-3 w-3 rounded-full bg-white transition duration-200 ${checked ? 'translate-x-4' : ''}`} />
              </span>
              <input type="checkbox" checked={checked} onChange={() => onToggle(item.key)} className="sr-only" />
            </label>
          )
        })}
      </div>
    </Card>
  )
}
