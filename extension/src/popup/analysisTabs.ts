export const ANALYSIS_TABS = [
  { id: 'aiPrompt', label: 'AI Prompt' },
  { id: 'aetherScore', label: 'Aether Score' },
  { id: 'landingPageDna', label: 'Landing Page DNA' },
  { id: 'whyThisWorks', label: 'Why This Works' },
  { id: 'stylePersonality', label: 'Style Personality' },
  { id: 'designDna', label: 'Color DNA' },
  { id: 'similarDesign', label: 'Similar Design' },
  { id: 'cursorExport', label: 'Cursor' },
  { id: 'v0Export', label: 'v0' },
  { id: 'buildPattern', label: 'Build Pattern' },
  { id: 'motionAnalysis', label: 'Motion' },
  { id: 'tailwindTokens', label: 'Tokens' },
  { id: 'typography', label: 'Typography' },
  { id: 'layout', label: 'Layout' },
  { id: 'components', label: 'Components' },
] as const

export type TabId = (typeof ANALYSIS_TABS)[number]['id']
