export type ExtractionKey =
  | 'typography'
  | 'colors'
  | 'layout'
  | 'animations'
  | 'heroSection'
  | 'buttonsAndCTA'
  | 'spacingSystem'
  | 'designLanguage'
  | 'responsiveBehavior'
  | 'hoverEffects'
  | 'componentStructure'

export interface ExtractionOptions {
  typography: boolean
  colors: boolean
  layout: boolean
  animations: boolean
  heroSection: boolean
  buttonsAndCTA: boolean
  spacingSystem: boolean
  designLanguage: boolean
  responsiveBehavior: boolean
  hoverEffects: boolean
  componentStructure: boolean
}

export interface TypographyStats {
  families: string[]
  sizes: string[]
  weights: string[]
  lineHeights: string[]
  letterSpacing: string[]
}

export interface ColorStats {
  textColors: string[]
  backgrounds: string[]
  gradients: string[]
  opacityUsage: string[]
}

export interface LayoutStats {
  displayPatterns: string[]
  spacingScale: string[]
  alignments: string[]
  containerWidths: string[]
  responsiveHints: string[]
}

export interface EffectsStats {
  shadows: string[]
  blurs: string[]
  borderRadius: string[]
  glassmorphismScore: number
}

export interface MotionStats {
  transitions: string[]
  transforms: string[]
  keyframes: string[]
  hoverEffects: string[]
  scrollIndicators: string[]
}

export interface StructureStats {
  guessedSectionType: string
  components: string[]
  ctaPatterns: string[]
  buildPattern: string[]
}

export interface FrameworkDetection {
  tailwind: number
  react: number
  nextjs: number
  gsap: number
  framerMotion: number
  bootstrap: number
  vue: number
  svelte: number
  astro: number
  solidjs: number
  remix: number
  nuxt: number
}

export interface StyleIntelligence {
  styleLabel: string
  emotionalTone: string
  interactionEnergy: string
  visualPsychology: string
  premiumSignals: string[]
  intelligenceSummary: string
}

export interface ExtractedUIData {
  url: string
  title: string
  selectedHtmlSnippet: string
  viewport: {
    width: number
    height: number
  }
  typography: TypographyStats
  colors: ColorStats
  layout: LayoutStats
  effects: EffectsStats
  motion: MotionStats
  structure: StructureStats
  frameworks: FrameworkDetection
  styleIntelligence: StyleIntelligence
  selectedNodeMeta: {
    tag: string
    className: string
    id: string
    rect: { x: number; y: number; width: number; height: number }
  }
  extractedAt: string
}

export interface AnalysisOutput {
  aiPrompt: string
  designAnalysis: string
  designDna: string
  landingPageDna: string
  whyThisWorks: string
  stylePersonality: string
  aetherScore: string
  buildPattern: string
  colorDna: string
  typography: string
  layout: string
  components: string
  tailwindTokens: string
  similarDesign: string
  cursorExport: string
  v0Export: string
  reactGuidance: string
  motionAnalysis: string
  jsonExport: string
}

export type PlanTier = 'free' | 'pro'

export type SignInProvider = 'google' | 'github' | 'guest'

export interface AccountState {
  name: string
  email: string
  provider: SignInProvider
  plan: PlanTier
  savedAnalyses: number
  promptHistory: number
  exportedPrompts: number
  favorites: number
  workspaceName: string
}

export interface UsageState {
  date: string
  aiAnalyses: number
  fullPageCaptures: number
  exports: number
}

export interface SavedAnalysisRecord {
  id: string
  title: string
  url: string
  styleLabel: string
  createdAt: string
  favorite: boolean
}

export interface UpgradeBenefit {
  title: string
  detail: string
}

export type ExportTarget = 'cursor' | 'v0' | 'chatgpt' | 'claude' | 'react' | 'tailwind' | 'json'
