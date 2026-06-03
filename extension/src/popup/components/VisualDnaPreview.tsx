import { Activity, Blend, CaseSensitive, Radius, Ruler, Sparkles } from 'lucide-react'
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

const confidenceBar = (value: number) => `${Math.max(12, Math.min(100, value))}%`

export const VisualDnaPreview = ({ data }: Props) => {
  const colors = data
    ? unique([...data.colors.backgrounds, ...data.colors.textColors]).filter(isPaintableColor).slice(0, 6)
    : fallbackColors
  const spacingTokens = data ? unique(data.layout.spacingScale).filter(Boolean).slice(0, 4) : fallbackSpacing
  const radiusTokens = data ? unique(data.effects.borderRadius).filter(Boolean).slice(0, 3) : fallbackRadius
  const motionTokens = data ? unique([...data.motion.transitions, ...data.motion.hoverEffects]).filter(Boolean).slice(0, 3) : []
  const family = data?.typography.families[0] ?? 'Inter, ui-sans-serif, system-ui'
  const sizes = data?.typography.sizes.slice(0, 3).join(' / ') || '12px / 16px / 24px'
  const styleLabel = data?.styleIntelligence.styleLabel ?? 'Cinematic Minimal'
  const energy = data?.styleIntelligence.interactionEnergy ?? 'Restrained and product-led'
  const psychology = data?.styleIntelligence.visualPsychology ?? 'Balanced hierarchy with quiet depth.'
  const frameworkScores = data
    ? Object.entries(data.frameworks)
        .filter(([, score]) => score >= 30)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    : []

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase text-zinc-500">Visual Intelligence</div>
          <h2 className="mt-1 text-sm font-semibold text-zinc-50">Design DNA Preview</h2>
        </div>
        <Badge tone={data ? 'success' : 'neutral'}>{data ? 'Captured' : 'Waiting'}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <Blend className="h-3.5 w-3.5" />
            Color DNA
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {(colors.length ? colors : fallbackColors).map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-9 rounded-xl border border-white/10 shadow-[0_10px_30px_-20px_rgba(34,211,238,0.7)]"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <CaseSensitive className="h-3.5 w-3.5" />
            Typography DNA
          </div>
          <div className="mt-3 truncate text-lg font-semibold text-zinc-50" style={{ fontFamily: family }}>
            Aa Design
          </div>
          <div className="mt-1 truncate text-[11px] text-zinc-500">{sizes}</div>
          <div className="mt-3 text-[11px] leading-5 text-zinc-300">{styleLabel}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <Radius className="h-3.5 w-3.5" />
            Spacing DNA
          </div>
          <div className="mt-3 space-y-2">
            {(spacingTokens.length ? spacingTokens : fallbackSpacing).map((token, index) => (
              <div key={`${token}-${index}`} className="flex items-center gap-2">
                <span className="h-1.5 rounded-full bg-emerald-300/80" style={{ width: `${(index + 1) * 18}px` }} />
                <span className="truncate text-[10px] text-zinc-500">{token}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <Ruler className="h-3.5 w-3.5" />
            Motion DNA
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(motionTokens.length ? motionTokens : ['restrained transitions', 'soft hover feedback']).map((token) => (
              <Badge key={token} tone="warning" className="max-w-[176px] truncate">
                {token}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {radiusTokens.map((token) => (
              <Badge key={token} tone="neutral">
                {token}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" />
            Style Personality
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-50">{styleLabel}</div>
          <div className="mt-1 text-[11px] leading-5 text-zinc-400">{psychology}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase text-zinc-500">
            <Activity className="h-3.5 w-3.5" />
            Framework Confidence
          </div>
          <div className="mt-2 space-y-2">
            {(frameworkScores.length ? frameworkScores : [['react', 12]]).map(([name, score]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="capitalize">{name}</span>
                  <span>{confidenceBar(score as number)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: confidenceBar(score as number) }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] leading-5 text-zinc-400">{energy}</div>
        </div>
      </div>
    </Card>
  )
}
