import type { AnalysisOutput, ExtractedUIData } from '../types'
import { clamp, compactNumber } from '../utils/helpers'

const joinNonEmpty = (values: string[], fallback: string): string => {
  const filtered = values.map((value) => value.trim()).filter(Boolean)
  return filtered.length ? filtered.join(' · ') : fallback
}

const pickTopFrameworks = (frameworks: ExtractedUIData['frameworks']) => {
  return Object.entries(frameworks)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score >= 45)
    .slice(0, 4)
    .map(([name, score]) => `${name}:${score}%`)
}

export const buildAetherScore = (data: ExtractedUIData): string => {
  const minimalism = clamp(
    Math.round(
      72 +
        Math.min(18, 24 - data.colors.backgrounds.length * 2) +
        Math.min(8, data.layout.spacingScale.length) +
        (data.styleIntelligence.styleLabel.toLowerCase().includes('minimal') ? 8 : 0),
    ),
    0,
    100,
  )
  const premiumFeel = clamp(
    Math.round(64 + data.effects.glassmorphismScore * 0.45 + data.effects.shadows.length * 2 + data.effects.borderRadius.length * 1.5),
    0,
    100,
  )
  const motionSophistication = clamp(
    Math.round(58 + data.motion.transitions.length * 5 + data.motion.keyframes.length * 7 + data.motion.hoverEffects.length * 3),
    0,
    100,
  )
  const visualCalmness = clamp(
    Math.round(78 + Math.max(0, 8 - data.colors.gradients.length * 2) + Math.max(0, 6 - data.motion.keyframes.length * 2)),
    0,
    100,
  )
  const modernAesthetic = clamp(
    Math.round(
      68 +
        (data.frameworks.react > 55 || data.frameworks.tailwind > 55 ? 8 : 0) +
        (data.styleIntelligence.styleLabel.toLowerCase().includes('cinematic') ? 10 : 0) +
        Math.min(12, data.layout.responsiveHints.length * 2),
    ),
    0,
    100,
  )

  const rows: Array<[string, number]> = [
    ['Minimalism', minimalism],
    ['Premium Feel', premiumFeel],
    ['Motion Sophistication', motionSophistication],
    ['Visual Calmness', visualCalmness],
    ['Modern Aesthetic', modernAesthetic],
  ]

  return [
    'AETHERUI SCORE',
    '━━━━━━━━━━━━━━',
    ...rows.map(([label, score]) => `${label.padEnd(24, '.')} ${String(score).padStart(2, ' ')}%`),
    '━━━━━━━━━━━━━━',
    `Overall: ${compactNumber(Math.round(rows.reduce((total, [, score]) => total + Number(score), 0) / rows.length))}% confidence in premium quality.`,
  ].join('\n')
}

export const buildLandingPageDNA = (data: ExtractedUIData): string => {
  const visualDensity = data.layout.displayPatterns.length <= 3 ? 'Low' : data.layout.displayPatterns.length <= 5 ? 'Balanced' : 'High'
  const motionEnergy = data.motion.keyframes.length > 2 || data.motion.transitions.length > 4 ? 'Expressive' : 'Restrained Premium'
  const brandTone = data.styleIntelligence.emotionalTone

  return [
    'LANDING PAGE DNA',
    '━━━━━━━━━━━━━━',
    `Style: ${data.styleIntelligence.styleLabel}`,
    `Narrative: ${data.structure.guessedSectionType === 'hero section' ? 'Immersive Storytelling' : 'Guided Product Story'}`,
    `Visual Density: ${visualDensity}`,
    `Motion Energy: ${motionEnergy}`,
    `Brand Tone: ${brandTone}`,
    '━━━━━━━━━━━━━━',
    data.styleIntelligence.intelligenceSummary,
  ].join('\n')
}

export const buildWhyThisWorks = (data: ExtractedUIData): string => {
  const signals = joinNonEmpty(
    [
      data.effects.shadows.length ? 'layered depth' : '',
      data.effects.borderRadius.length ? 'soft geometry' : '',
      data.motion.transitions.length ? 'restrained motion choreography' : '',
      data.layout.spacingScale.length ? 'generous breathing room' : '',
      data.colors.gradients.length ? 'cinematic color gradients' : '',
    ],
    'balanced hierarchy',
  )

  return [
    'WHY THIS WORKS',
    '━━━━━━━━━━━━━━',
    `This interface feels premium because it combines ${signals} with a clear emotional hierarchy and a product-first reading order.`,
    `The style reads as ${data.styleIntelligence.styleLabel.toLowerCase()} and translates well into a reusable design direction instead of a one-off clone.`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildStylePersonality = (data: ExtractedUIData): string => {
  return [
    'STYLE PERSONALITY',
    '━━━━━━━━━━━━━━',
    `Label: ${data.styleIntelligence.styleLabel}`,
    `Emotional tone: ${data.styleIntelligence.emotionalTone}`,
    `Interaction energy: ${data.styleIntelligence.interactionEnergy}`,
    `Visual psychology: ${data.styleIntelligence.visualPsychology}`,
    `Premium signals: ${joinNonEmpty(data.styleIntelligence.premiumSignals, 'quiet luxury cues')}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildColorDNA = (data: ExtractedUIData): string => {
  const swatches = data.colors.backgrounds.slice(0, 4).concat(data.colors.textColors.slice(0, 2))
  return [
    'COLOR DNA',
    '━━━━━━━━━━━━━━',
    `Palette: ${joinNonEmpty(swatches, 'cinematic dark surfaces with soft accents')}`,
    `Gradients: ${joinNonEmpty(data.colors.gradients.slice(0, 3), 'subtle gradient glow')}`,
    `Contrast mood: ${data.styleIntelligence.emotionalTone}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildTypographyDNA = (data: ExtractedUIData): string => {
  return [
    'TYPOGRAPHY DNA',
    '━━━━━━━━━━━━━━',
    `Families: ${joinNonEmpty(data.typography.families.slice(0, 4), 'modern sans stack')}`,
    `Hierarchy: ${joinNonEmpty(data.typography.sizes.slice(0, 5), 'clear display to body scale')}`,
    `Weights: ${joinNonEmpty(data.typography.weights.slice(0, 4), 'balanced weight range')}`,
    `Personality: ${data.styleIntelligence.styleLabel.includes('Luxury') ? 'editorial and restrained' : 'clean and product-led'}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildMotionDNA = (data: ExtractedUIData): string => {
  return [
    'MOTION DNA',
    '━━━━━━━━━━━━━━',
    `Transition language: ${joinNonEmpty(data.motion.transitions.slice(0, 4), 'subtle motion cues')}`,
    `Hover behavior: ${joinNonEmpty(data.motion.hoverEffects.slice(0, 4), 'quiet hover feedback')}`,
    `Scroll cues: ${joinNonEmpty(data.motion.scrollIndicators.slice(0, 3), 'limited scroll choreography')}`,
    `Energy: ${data.styleIntelligence.interactionEnergy}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildSpacingDNA = (data: ExtractedUIData): string => {
  return [
    'SPACING DNA',
    '━━━━━━━━━━━━━━',
    `Rhythm: ${joinNonEmpty(data.layout.spacingScale.slice(0, 4), 'balanced breathing room')}`,
    `Alignment: ${joinNonEmpty(data.layout.alignments.slice(0, 4), 'clean alignment grid')}`,
    `Containers: ${joinNonEmpty(data.layout.containerWidths.slice(0, 3), 'intentional max-width structure')}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildFrameworkDNA = (data: ExtractedUIData): string => {
  const topFrameworks = pickTopFrameworks(data.frameworks)

  return [
    'FRAMEWORK SIGNALS',
    '━━━━━━━━━━━━━━',
    topFrameworks.length ? topFrameworks.map((entry) => `• ${entry}`).join('\n') : '• No framework detected with high confidence',
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

export const buildSimilarDesignIdeas = (data: ExtractedUIData): string => {
  return [
    'GENERATE SIMILAR DESIGN',
    '━━━━━━━━━━━━━━',
    'Generate Similar Hero',
    'Reimagine This Section',
    'Create New Layout',
    'Generate Alternative CTA',
    '━━━━━━━━━━━━━━',
    `Preserve the ${data.styleIntelligence.styleLabel.toLowerCase()} feeling, but shift composition, rhythm, and layout so the result feels original.`,
  ].join('\n')
}

export const buildExportBundle = (data: ExtractedUIData): Pick<AnalysisOutput, 'cursorExport' | 'v0Export' | 'reactGuidance' | 'tailwindTokens'> => {
  const cursorExport = [
    'Cursor export',
    'Translate the attached UI DNA into a production-ready React + Tailwind implementation.',
    `Style direction: ${data.styleIntelligence.styleLabel}.`,
    `Keep the emotional tone: ${data.styleIntelligence.emotionalTone}.`,
    'Avoid cloning the source layout. Generate a fresh composition with the same taste level.',
  ].join('\n')

  const v0Export = [
    'v0 export',
    'Generate a modern landing experience inspired by this design intelligence.',
    `Use ${data.styleIntelligence.styleLabel.toLowerCase()} cues, premium spacing, and polished interaction timing.`,
  ].join('\n')

  const reactGuidance = [
    `Build ${data.structure.guessedSectionType} as a composable React section.`,
    `Split into components: ${data.structure.components.join(', ') || 'container, content, CTA'}.`,
    `Use typography scale from: ${data.typography.sizes.slice(0, 5).join(', ') || 'clear scale'}.`,
    `Apply rounded system: ${data.effects.borderRadius.slice(0, 4).join(', ') || 'rounded-xl'}.`,
    `Respect CTA patterns: ${data.structure.ctaPatterns.slice(0, 3).join(' | ') || 'primary + secondary actions'}.`,
  ].join('\n')

  const tailwindTokens = [
    ':root {',
    ...data.colors.backgrounds.slice(0, 5).map((value, idx) => `  --color-surface-${idx + 1}: ${value};`),
    ...data.colors.textColors.slice(0, 5).map((value, idx) => `  --color-text-${idx + 1}: ${value};`),
    ...data.effects.borderRadius.slice(0, 4).map((value, idx) => `  --radius-${idx + 1}: ${value};`),
    '}',
  ].join('\n')

  return {
    cursorExport,
    v0Export,
    reactGuidance,
    tailwindTokens,
  }
}

export const buildAnalysisNarrative = (data: ExtractedUIData): AnalysisOutput => {
  const exports = buildExportBundle(data)

  return {
    aiPrompt: [
      `Create a premium, emotionally expressive web section inspired by ${data.styleIntelligence.styleLabel.toLowerCase()} UI DNA.`,
      '',
      'Characteristics:',
      `- ${data.structure.guessedSectionType}`,
      `- ${joinNonEmpty([data.styleIntelligence.styleLabel, data.styleIntelligence.emotionalTone], 'premium product language')}`,
      `- typography hierarchy using ${joinNonEmpty(data.typography.sizes.slice(0, 4), 'clear scale')}`,
      `- rounded language using ${joinNonEmpty(data.effects.borderRadius.slice(0, 3), 'soft radius values')}`,
      `- color direction from ${joinNonEmpty(data.colors.backgrounds.slice(0, 3), 'neutral + accent palette')}`,
      `- emotional tone: ${data.styleIntelligence.emotionalTone}`,
      `- premium signals: ${joinNonEmpty(data.styleIntelligence.premiumSignals, 'quiet luxury cues')}`,
      '',
      'Use:',
      '- React',
      '- Tailwind CSS',
      '- Framer Motion for polished interactions',
      '',
      pickTopFrameworks(data.frameworks).length ? `Detected stack hints from source UI: ${pickTopFrameworks(data.frameworks).join(', ')}` : 'Detected stack hints: not strongly identifiable',
      '',
      'Do not clone the original design 1:1. Translate the style language into a new composition with original structure and premium motion language.',
    ].join('\n'),
    designAnalysis: [
      `This interface feels like ${data.styleIntelligence.styleLabel.toLowerCase()} with a premium product finish.`,
      `Its emotional tone is ${data.styleIntelligence.emotionalTone}, created through ${joinNonEmpty(data.styleIntelligence.premiumSignals, 'soft depth and spacing')}.`,
      `Typography combines ${joinNonEmpty(data.typography.families.slice(0, 2), 'a modern sans stack')} with a scale anchored around ${joinNonEmpty(data.typography.sizes.slice(0, 4), 'clear heading/body hierarchy')}.`,
      `Layout favors ${joinNonEmpty(data.layout.displayPatterns.slice(0, 4), 'balanced structure')} and spacing rhythm seen in ${joinNonEmpty(data.layout.spacingScale.slice(0, 3), 'measured spacing')}.`,
      `Visual treatment uses radius tokens (${joinNonEmpty(data.effects.borderRadius.slice(0, 4), 'soft radius')}) and shadow language (${joinNonEmpty(data.effects.shadows.slice(0, 2), 'subtle depth')}).`,
      `Motion profile indicates ${data.motion.transitions.length} transition signatures and ${data.motion.keyframes.length} keyframe signatures.`,
    ].join('\n\n'),
    designDna: buildColorDNA(data),
    landingPageDna: buildLandingPageDNA(data),
    whyThisWorks: buildWhyThisWorks(data),
    stylePersonality: buildStylePersonality(data),
    aetherScore: buildAetherScore(data),
    buildPattern: [
      'Structure:',
      `- ${joinNonEmpty(data.structure.buildPattern, 'Flexible composition with clear hierarchy')}`,
      '',
      'Visual System:',
      `- ${joinNonEmpty(data.effects.borderRadius.slice(0, 3), 'Large rounded surfaces')}`,
      `- ${joinNonEmpty(data.colors.backgrounds.slice(0, 3), 'Muted dark palette')}`,
      '',
      'Interaction:',
      `- ${joinNonEmpty(data.motion.hoverEffects.slice(0, 3), 'Smooth hover feedback and controlled motion')}`,
      '',
      'Framework Clues:',
      `- ${joinNonEmpty(pickTopFrameworks(data.frameworks), 'Modern React architecture')}`,
    ].join('\n'),
    colorDna: buildColorDNA(data),
    typography: buildTypographyDNA(data),
    layout: buildSpacingDNA(data),
    components: [
      `Section archetype: ${data.structure.guessedSectionType}`,
      `Components: ${joinNonEmpty(data.structure.components, 'content, CTA, supporting blocks')}`,
      `CTA patterns: ${joinNonEmpty(data.structure.ctaPatterns, 'primary and secondary CTA pairing')}`,
    ].join('\n'),
    tailwindTokens: exports.tailwindTokens,
    similarDesign: buildSimilarDesignIdeas(data),
    cursorExport: exports.cursorExport,
    v0Export: exports.v0Export,
    reactGuidance: exports.reactGuidance,
    motionAnalysis: buildMotionDNA(data),
    jsonExport: JSON.stringify(data, null, 2),
  }
}