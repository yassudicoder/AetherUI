import type { AnalysisOutput, ExtractedUIData } from '../types'
import { formatBuildPattern, formatDesignDNA, formatMotionAnalysis, formatReactGuidance, formatTailwindTokens } from './formatters'
import { generatePrompt } from './promptGenerator'

export const buildLocalAnalysis = (data: ExtractedUIData): AnalysisOutput => {
  const designAnalysis = [
    `This interface feels like ${data.styleIntelligence.styleLabel.toLowerCase()} with a premium product finish.`,
    `Its emotional tone is ${data.styleIntelligence.emotionalTone}, created through ${data.styleIntelligence.premiumSignals.join(', ')}.`,
    `Typography combines ${data.typography.families.slice(0, 2).join(' and ') || 'a modern sans stack'} with a scale anchored around ${data.typography.sizes.slice(0, 4).join(', ')}.`,
    `Layout favors ${data.layout.displayPatterns.slice(0, 4).join(', ')} and spacing rhythm seen in ${data.layout.spacingScale.slice(0, 3).join(' | ')}.`,
    `Visual treatment uses radius tokens (${data.effects.borderRadius.slice(0, 4).join(', ')}) and shadow language (${data.effects.shadows.slice(0, 2).join(' | ') || 'subtle depth'}).`,
    `Motion profile indicates ${data.motion.transitions.length} transition signatures and ${data.motion.keyframes.length} keyframe signatures.`,
  ].join('\n\n')

  return {
    aiPrompt: generatePrompt(data),
    designAnalysis,
    designDna: formatDesignDNA(data),
    buildPattern: formatBuildPattern(data),
    typography: [
      `Families: ${data.typography.families.slice(0, 4).join(' | ') || 'modern sans stack'}`,
      `Sizes: ${data.typography.sizes.slice(0, 6).join(' | ')}`,
      `Weights: ${data.typography.weights.slice(0, 6).join(' | ')}`,
      `Line heights: ${data.typography.lineHeights.slice(0, 6).join(' | ')}`,
    ].join('\n'),
    layout: [
      `Display: ${data.layout.displayPatterns.slice(0, 5).join(' | ')}`,
      `Spacing: ${data.layout.spacingScale.slice(0, 5).join(' | ')}`,
      `Alignment: ${data.layout.alignments.slice(0, 5).join(' | ')}`,
      `Responsive cues: ${data.layout.responsiveHints.slice(0, 5).join(' | ')}`,
    ].join('\n'),
    components: [
      `Section archetype: ${data.structure.guessedSectionType}`,
      `Components: ${data.structure.components.join(' | ') || 'content, CTA, supporting blocks'}`,
      `CTA patterns: ${data.structure.ctaPatterns.join(' | ') || 'primary and secondary CTA pairing'}`,
    ].join('\n'),
    tailwindTokens: formatTailwindTokens(data),
    reactGuidance: formatReactGuidance(data),
    motionAnalysis: formatMotionAnalysis(data),
    jsonExport: JSON.stringify(data, null, 2),
  }
}
