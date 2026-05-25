import { Activity, Blend, CaseSensitive, Radius, Ruler } from 'lucide-react'
import type { ExtractedUIData } from '../../types'
import { Badge, Card } from './ui'

interface Props {
  data: ExtractedUIData | null
}

const fallbackColors = ['#0a0b10', '#18181b', '#22d3ee', '#34d399', '#fbbf24', '#f4f4f5']
const fallbackRadius = ['6px', '8px', '12px']
const fallbackSpacing = ['8px', '16px', '24px', '32px']

const isPaintableColor = (value: string) => {
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 && !normalized.includes('gradient') && normalized !== 'rgba(0, 0, 0, 0)' && normalized !== 'transparent'
}

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

export const VisualDnaPreview = ({ data }: Props) => {
  const colors = data
    ? unique([...data.colors.backgrounds, ...data.colors.textColors]).filter(isPaintableColor).slice(0, 6)
    : fallbackColors
  const radiusTokens = data ? unique(data.effects.borderRadius).filter(Boolean).slice(0, 3) : fallbackRadius
  const spacingTokens = data ? unique(data.layout.spacingScale).filter(Boolean).slice(0, 4) : fallbackSpacing
  const motionTokens = data ? unique([...data.motion.transitions, ...data.motion.hoverEffects]).filter(Boolean).slice(0, 3) : []
  const family = data?.typography.families[0] ?? 'Inter, ui-sans-serif, system-ui'
  const sizes = data?.typography.sizes.slice(0, 3).join(' / ') || '12px / 16px / 24px'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase text-zinc-500">Visual DNA</div>
          <h2 className="mt-1 text-sm font-semibold text-zinc-50">Preview System</h2>
        </div>
        <Badge tone={data ? 'success' : 'neutral'}>{data ? 'Captured' : 'Waiting'}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
            <Blend className="h-3.5 w-3.5" />
            Color
          </div>
          <div className="grid grid-cols-6 gap-2">
            {(colors.length ? colors : fallbackColors).map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-8 rounded-md border border-white/10 shadow-inner"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
            <CaseSensitive className="h-3.5 w-3.5" />
            Type
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="truncate text-base font-semibold text-zinc-50" style={{ fontFamily: family }}>
              Aa Design
            </div>
            <div className="mt-1 truncate text-[11px] text-zinc-500">{sizes}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
            <Radius className="h-3.5 w-3.5" />
            Radius
          </div>
          <div className="flex items-end gap-2">
            {(radiusTokens.length ? radiusTokens : fallbackRadius).map((token, index) => (
              <span
                key={`${token}-${index}`}
                className="flex h-8 w-8 items-center justify-center border border-cyan-200/25 bg-cyan-300/10 text-[10px] text-cyan-100"
                style={{ borderRadius: token }}
                title={token}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
            <Ruler className="h-3.5 w-3.5" />
            Spacing
          </div>
          <div className="space-y-2">
            {(spacingTokens.length ? spacingTokens : fallbackSpacing).map((token, index) => (
              <div key={`${token}-${index}`} className="flex items-center gap-2">
                <span className="h-1.5 rounded-full bg-emerald-300/70" style={{ width: `${(index + 1) * 18}px` }} />
                <span className="truncate text-[10px] text-zinc-500">{token}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-hidden border-t border-white/10 pt-4">
        <Activity className="h-3.5 w-3.5 shrink-0 text-amber-200" />
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {(motionTokens.length ? motionTokens : ['restrained transitions', 'soft hover feedback']).map((token) => (
            <Badge key={token} tone="warning" className="max-w-[176px] truncate">
              {token}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
