import type { AccountState, PlanTier, SavedAnalysisRecord, SignInProvider, UpgradeBenefit, UsageState } from '../types'

const STORAGE_KEY = 'aetheruiProductState'

export interface ProductState {
  account: AccountState
  usage: UsageState
  savedAnalyses: SavedAnalysisRecord[]
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export const FREE_LIMITS = {
  aiAnalyses: 5,
  fullPageCaptures: 3,
  exports: 3,
}

export const PRO_BENEFITS: UpgradeBenefit[] = [
  { title: 'Unlimited AI analysis', detail: 'Run as many section or landing-page analyses as you need.' },
  { title: 'Full-page intelligence', detail: 'Unlock premium storytelling, pacing, and visual-density analysis.' },
  { title: 'Generate similar design', detail: 'Reimagine heroes, CTAs, and layouts with the same taste.' },
  { title: 'Exports for AI tools', detail: 'Send polished prompts into Cursor, v0, ChatGPT, and Claude.' },
]

export const DEFAULT_ACCOUNT: AccountState = {
  name: 'AetherUI Guest',
  email: 'guest@aetherui.dev',
  provider: 'guest',
  plan: 'free',
  savedAnalyses: 0,
  promptHistory: 0,
  exportedPrompts: 0,
  favorites: 0,
  workspaceName: 'Free workspace',
}

export const DEFAULT_USAGE: UsageState = {
  date: todayKey(),
  aiAnalyses: 0,
  fullPageCaptures: 0,
  exports: 0,
}

const chromeGet = async (): Promise<Partial<ProductState> | undefined> => {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return result[STORAGE_KEY] as Partial<ProductState> | undefined
}

export const createAccountProfile = (provider: SignInProvider): AccountState => {
  if (provider === 'google') {
    return {
      ...DEFAULT_ACCOUNT,
      name: 'AetherUI Google',
      email: 'designer@google.com',
      provider,
      workspaceName: 'Google-connected workspace',
    }
  }

  if (provider === 'github') {
    return {
      ...DEFAULT_ACCOUNT,
      name: 'AetherUI GitHub',
      email: 'builder@github.com',
      provider,
      workspaceName: 'GitHub-connected workspace',
    }
  }

  return DEFAULT_ACCOUNT
}

export const createUpgradeState = (account: AccountState, plan: PlanTier): AccountState => {
  return {
    ...account,
    plan,
    workspaceName: plan === 'pro' ? 'Pro workspace' : account.workspaceName,
  }
}

export const resetDailyUsageIfNeeded = (usage: UsageState): UsageState => {
  const current = todayKey()
  if (usage.date === current) {
    return usage
  }

  return {
    date: current,
    aiAnalyses: 0,
    fullPageCaptures: 0,
    exports: 0,
  }
}

export const readProductState = async (): Promise<ProductState> => {
  const stored = await chromeGet()
  const account = stored?.account ?? DEFAULT_ACCOUNT
  const usage = resetDailyUsageIfNeeded(stored?.usage ?? DEFAULT_USAGE)
  const savedAnalyses = stored?.savedAnalyses ?? []

  return {
    account,
    usage,
    savedAnalyses,
  }
}

export const writeProductState = async (state: ProductState): Promise<void> => {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

export const getQuotaStatus = (state: ProductState) => {
  const unlimited = state.account.plan === 'pro'
  return {
    aiAnalysesRemaining: unlimited ? Infinity : Math.max(0, FREE_LIMITS.aiAnalyses - state.usage.aiAnalyses),
    fullPageCapturesRemaining: unlimited ? Infinity : Math.max(0, FREE_LIMITS.fullPageCaptures - state.usage.fullPageCaptures),
    exportsRemaining: unlimited ? Infinity : Math.max(0, FREE_LIMITS.exports - state.usage.exports),
    unlimited,
  }
}
