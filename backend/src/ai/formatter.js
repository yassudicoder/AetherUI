const toStringList = (value) => (Array.isArray(value) ? value.join(', ') : '')

const buildFallbackAnalysis = (data) => {
  const aiPrompt = [
    'Create a modern premium interface inspired by this UI DNA profile.',
    '',
    'Design characteristics:',
    `- Section archetype: ${data?.structure?.guessedSectionType || 'content section'}`,
    `- Typography scale: ${toStringList(data?.typography?.sizes?.slice(0, 5)) || 'balanced heading/body hierarchy'}`,
    `- Color direction: ${toStringList(data?.colors?.backgrounds?.slice(0, 4)) || 'neutral surfaces with accent highlights'}`,
    `- Motion profile: ${toStringList(data?.motion?.transitions?.slice(0, 4)) || 'subtle smooth transitions'}`,
    '',
    'Use React, Tailwind CSS, and Framer Motion.',
    'Translate the style language into a fresh composition. Do not clone source layouts.',
  ].join('\n')

  return {
    aiPrompt,
    designAnalysis: [
      `The selected UI expresses ${data?.structure?.guessedSectionType || 'a modular section'} patterns with a premium aesthetic.`,
      `Primary typography families: ${toStringList(data?.typography?.families?.slice(0, 3)) || 'modern sans stack'}.`,
      `Layout model: ${toStringList(data?.layout?.displayPatterns?.slice(0, 4)) || 'flex/grid hybrid'}.`,
      `Visual effects: radius ${toStringList(data?.effects?.borderRadius?.slice(0, 4)) || 'rounded tokens'} and shadows ${toStringList(data?.effects?.shadows?.slice(0, 2)) || 'subtle depth'}.`,
    ].join('\n\n'),
    tailwindTokens: [
      ':root {',
      ...(data?.colors?.backgrounds || []).slice(0, 5).map((v, i) => `  --color-surface-${i + 1}: ${v};`),
      ...(data?.colors?.textColors || []).slice(0, 5).map((v, i) => `  --color-text-${i + 1}: ${v};`),
      ...(data?.effects?.borderRadius || []).slice(0, 5).map((v, i) => `  --radius-${i + 1}: ${v};`),
      '}',
    ].join('\n'),
    reactGuidance: [
      'Build the section as composable React blocks.',
      `Recommended parts: ${(data?.structure?.components || []).join(', ') || 'container, copy block, CTA block, media block'}.`,
      `CTA patterns: ${(data?.structure?.ctaPatterns || []).slice(0, 4).join(' | ') || 'primary and secondary action pairing'}.`,
      'Use semantic sections and map design tokens to reusable Tailwind utility groups.',
    ].join('\n'),
    motionAnalysis: [
      `Transitions: ${(data?.motion?.transitions || []).slice(0, 6).join(' | ') || 'minimal transition signals detected'}`,
      `Transforms: ${(data?.motion?.transforms || []).slice(0, 4).join(' | ') || 'no heavy transform language'}`,
      `Keyframes: ${(data?.motion?.keyframes || []).slice(0, 4).join(' | ') || 'no distinct keyframes found'}`,
    ].join('\n\n'),
    jsonExport: JSON.stringify(data, null, 2),
  }
}

const normalizeAnalysisShape = (analysis, originalData) => {
  if (!analysis || typeof analysis !== 'object') {
    return buildFallbackAnalysis(originalData)
  }

  return {
    aiPrompt: String(analysis.aiPrompt || ''),
    designAnalysis: String(analysis.designAnalysis || ''),
    tailwindTokens: String(analysis.tailwindTokens || ''),
    reactGuidance: String(analysis.reactGuidance || ''),
    motionAnalysis: String(analysis.motionAnalysis || ''),
    jsonExport: String(analysis.jsonExport || JSON.stringify(originalData, null, 2)),
  }
}

module.exports = {
  buildFallbackAnalysis,
  normalizeAnalysisShape,
}
