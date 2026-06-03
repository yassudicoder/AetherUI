import { Crown, GitBranch, Globe, ShieldCheck } from 'lucide-react'
import type { AccountState, UsageState } from '../../types'
import { Badge, Button, Card } from './ui'

interface Props {
  account: AccountState
  usage: UsageState
  onConnectGoogle: () => void
  onConnectGitHub: () => void
  onUpgrade: () => void
}

const quotaRow = (label: string, value: string) => (
  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-zinc-300">
    <span>{label}</span>
    <span className="font-semibold text-zinc-50">{value}</span>
  </div>
)

export const AccountPanel = ({ account, usage, onConnectGoogle, onConnectGitHub, onUpgrade }: Props) => {
  const planTone = account.plan === 'pro' ? 'success' : 'info'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase text-zinc-500">Account & Billing</div>
          <h2 className="mt-1 truncate text-sm font-semibold text-zinc-50">{account.name}</h2>
          <p className="truncate text-xs text-zinc-400">{account.email}</p>
        </div>
        <Badge tone={planTone}>{account.plan.toUpperCase()}</Badge>
      </div>

      <div className="mt-4 grid gap-2">
        {quotaRow('AI analyses today', `${usage.aiAnalyses}/5 free`)}
        {quotaRow('Full-page captures', `${usage.fullPageCaptures}/3 free`)}
        {quotaRow('Prompt exports', `${usage.exports}/3 free`)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" icon={Globe} onClick={onConnectGoogle}>
          Google
        </Button>
        <Button size="sm" variant="secondary" icon={GitBranch} onClick={onConnectGitHub}>
          GitHub
        </Button>
        <Button size="sm" variant="primary" icon={Crown} onClick={onUpgrade}>
          Pro
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-[11px] text-cyan-50">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{account.plan === 'pro' ? 'Pro workspace unlocked' : 'Premium account shell ready for OAuth wiring'}</span>
      </div>
    </Card>
  )
}
