export const ANALYSIS_TABS = [
  { id: 'aiPrompt', label: 'AI Prompt' },
  { id: 'designDna', label: 'Design DNA' },
  { id: 'buildPattern', label: 'Build Pattern' },
  { id: 'motionAnalysis', label: 'Motion' },
  { id: 'tailwindTokens', label: 'Tokens' },
  { id: 'typography', label: 'Typography' },
  { id: 'layout', label: 'Layout' },
  { id: 'components', label: 'Components' },
] as const

export type TabId = (typeof ANALYSIS_TABS)[number]['id']
