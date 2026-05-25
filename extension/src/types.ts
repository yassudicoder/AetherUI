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
  tailwind: boolean
  react: boolean
  nextjs: boolean
  gsap: boolean
  framerMotion: boolean
  bootstrap: boolean
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
  styleIntelligence: {
    styleLabel: string
    emotionalTone: string
    premiumSignals: string[]
    intelligenceSummary: string
  }
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
  buildPattern: string
  typography: string
  layout: string
  components: string
  tailwindTokens: string
  reactGuidance: string
  motionAnalysis: string
  jsonExport: string
}
