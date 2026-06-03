import type { AnalysisOutput, ExtractedUIData } from '../types'
import { buildAnalysisNarrative } from './productIntelligence'
import { generatePrompt } from './promptGenerator'

export const buildLocalAnalysis = (data: ExtractedUIData): AnalysisOutput => {
  return {
    ...buildAnalysisNarrative(data),
    aiPrompt: generatePrompt(data),
  }
}
