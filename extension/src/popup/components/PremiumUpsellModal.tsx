import { AnimatePresence, motion } from 'framer-motion'
import { Check, Sparkles, X } from 'lucide-react'
import type { UpgradeBenefit } from '../../types'
import { Button } from './ui'

interface Props {
  open: boolean
  benefits: UpgradeBenefit[]
  onClose: () => void
  onUpgrade: () => void
  title?: string
  message?: string
}

export const PremiumUpsellModal = ({ open, benefits, onClose, onUpgrade, title = 'Upgrade to Pro', message = 'Unlock the full AI-native design intelligence experience.' }: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/62 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(12,15,22,0.98),rgba(7,9,14,0.98))] p-5 shadow-[0_30px_120px_-40px_rgba(34,211,238,0.35)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-50">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium unlock
                </div>
                <h3 className="mt-3 text-lg font-semibold text-zinc-50">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{message}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-zinc-400 transition hover:text-zinc-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <div>
                    <div className="text-sm font-medium text-zinc-50">{benefit.title}</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-400">{benefit.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={onClose}>
                Not now
              </Button>
              <Button variant="primary" onClick={onUpgrade}>
                Go Pro
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
