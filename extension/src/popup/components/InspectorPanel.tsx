import { AlertTriangle, CheckCircle2, Loader2, MousePointer2, Radar, X } from 'lucide-react'
import { Card, Badge, Button } from './ui'

interface Props {
  errorMessage: string | null
  hoverSummary: string
  isRunning: boolean
  isSelecting: boolean
  onExitSelection: () => void
  onQuickAnalyze: () => void
  onToggleOverlay: () => void
  selectedElementSummary: string
}

export const InspectorPanel = ({
  errorMessage,
  hoverSummary,
  isRunning,
  isSelecting,
  onExitSelection,
  onQuickAnalyze,
  onToggleOverlay,
  selectedElementSummary,
}: Props) => {
  const StatusIcon = isRunning ? Loader2 : isSelecting ? Radar : CheckCircle2
  const statusTone = isRunning ? 'warning' : isSelecting ? 'info' : 'success'
  const statusLabel = isRunning ? 'Analyzing' : isSelecting ? 'Selecting' : 'Ready'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="text-[11px] font-medium uppercase text-zinc-500">Live Inspector</div>
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-cyan-200" />
            <h2 className="truncate text-sm font-semibold text-zinc-50">
              {selectedElementSummary || 'No section selected'}
            </h2>
          </div>
        </div>
        <Badge tone={statusTone}>
          <StatusIcon className={`mr-1.5 h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
          {statusLabel}
        </Badge>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] font-medium text-zinc-500">Hover signal</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-300">{hoverSummary}</p>
      </div>

      {errorMessage && (
        <div className="mt-4 flex gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 p-4 text-xs leading-5 text-rose-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSelecting && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button size="sm" variant="secondary" onClick={onQuickAnalyze}>
            Quick
          </Button>
          <Button size="sm" variant="secondary" onClick={onToggleOverlay}>
            Overlay
          </Button>
          <Button size="sm" variant="danger" icon={X} onClick={onExitSelection}>
            Exit
          </Button>
        </div>
      )}
    </Card>
  )
}
