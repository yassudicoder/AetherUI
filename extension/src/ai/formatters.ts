import type { ExtractedUIData } from '../types'

export const formatTailwindTokens = (data: ExtractedUIData): string => {
  const colorVars = data.colors.backgrounds
    .slice(0, 5)
    .map((value, idx) => `--color-surface-${idx + 1}: ${value};`)
    .join('\n')

  const textVars = data.colors.textColors
    .slice(0, 5)
    .map((value, idx) => `--color-text-${idx + 1}: ${value};`)
    .join('\n')

  const radiusVars = data.effects.borderRadius
    .slice(0, 4)
    .map((value, idx) => `--radius-${idx + 1}: ${value};`)
    .join('\n')

  const spacingHints = data.layout.spacingScale.slice(0, 6).join('\n')

  return [`:root {`, colorVars, textVars, radiusVars, `}`, '', `// spacing observations`, spacingHints]
    .filter(Boolean)
    .join('\n')
}

export const formatReactGuidance = (data: ExtractedUIData): string => {
  return [
    `Build ${data.structure.guessedSectionType} as a composable React section.`,
    `Split into components: ${data.structure.components.join(', ') || 'container, content, CTA'}.`,
    `Use typography scale from: ${data.typography.sizes.slice(0, 5).join(', ')}.`,
    `Apply rounded system: ${data.effects.borderRadius.slice(0, 4).join(', ') || 'rounded-xl'}.`,
    `Respect CTA patterns: ${data.structure.ctaPatterns.slice(0, 3).join(' | ') || 'primary + secondary actions'}.`,
  ].join('\n')
}

export const formatMotionAnalysis = (data: ExtractedUIData): string => {
  return [
    `Transitions: ${data.motion.transitions.slice(0, 6).join(' | ') || 'minimal transitions detected'}`,
    `Transforms: ${data.motion.transforms.slice(0, 4).join(' | ') || 'no major transforms detected'}`,
    `Keyframes: ${data.motion.keyframes.slice(0, 4).join(' | ') || 'no explicit keyframes detected'}`,
    `Hover: ${data.motion.hoverEffects.slice(0, 4).join(' | ') || 'hover effects are subtle/minimal'}`,
    `Scroll cues: ${data.motion.scrollIndicators.slice(0, 4).join(' | ') || 'no distinct scroll-driven markers'}`,
  ].join('\n\n')
}

export const formatDesignDNA = (data: ExtractedUIData): string => {
  return [
    `Style DNA: ${data.styleIntelligence.styleLabel}`,
    `Emotional tone: ${data.styleIntelligence.emotionalTone}`,
    `Premium signals: ${data.styleIntelligence.premiumSignals.join(' | ') || 'subtle depth, soft surfaces, refined spacing'}`,
    `Intelligence summary: ${data.styleIntelligence.intelligenceSummary}`,
  ].join('\n\n')
}

export const formatBuildPattern = (data: ExtractedUIData): string => {
  return [
    'Structure:',
    `- ${data.structure.buildPattern.join('\n- ') || 'Flexible composition with clear hierarchy'}`,
    '',
    'Visual System:',
    `- ${data.effects.borderRadius.slice(0, 3).join(' | ') || 'Large rounded surfaces'}`,
    `- ${data.colors.backgrounds.slice(0, 3).join(' | ') || 'Muted dark palette'}`,
    '',
    'Interaction:',
    `- ${data.motion.hoverEffects.slice(0, 3).join(' | ') || 'Smooth hover feedback and controlled motion'}`,
    '',
    'Framework Clues:',
    `- ${Object.entries(data.frameworks).filter(([, enabled]) => enabled).map(([name]) => name).join(', ') || 'Tailwind likely, modern React architecture'}`,
  ].join('\n')
}
