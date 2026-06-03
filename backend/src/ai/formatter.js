const toStringList = (value) => (Array.isArray(value) ? value.join(' · ') : '')

const joinNonEmpty = (values, fallback) => {
  const filtered = values.map((value) => String(value || '').trim()).filter(Boolean)
  return filtered.length ? filtered.join(' · ') : fallback
}

const pickTopFrameworks = (frameworks) => {
  return Object.entries(frameworks || {})
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .filter(([, score]) => Number(score) >= 45)
    .slice(0, 4)
    .map(([name, score]) => `${name}:${score}%`)
}

const buildScoreboard = (data) => {
  const rows = [
    ['Minimalism', 74],
    ['Premium Feel', 82],
    ['Motion Sophistication', Math.min(100, 60 + ((data?.motion?.transitions || []).length * 5) + ((data?.motion?.keyframes || []).length * 6))],
    ['Visual Calmness', 88],
    ['Modern Aesthetic', Math.min(100, 70 + ((data?.layout?.responsiveHints || []).length * 2))],
  ]

  return [
    'AETHERUI SCORE',
    '━━━━━━━━━━━━━━',
    ...rows.map(([label, score]) => `${String(label).padEnd(24, '.')} ${String(score).padStart(2, ' ')}%`),
    '━━━━━━━━━━━━━━',
  ].join('\n')
}

const buildFallbackAnalysis = (data) => {
  const styleLabel = data?.styleIntelligence?.styleLabel || 'Cinematic Minimal'
  const emotionalTone = data?.styleIntelligence?.emotionalTone || 'quietly premium and polished'
  const interactionEnergy = data?.styleIntelligence?.interactionEnergy || 'Restrained and product-led'
  const visualPsychology = data?.styleIntelligence?.visualPsychology || 'Balances clarity with atmospheric depth.'

  const aiPrompt = [
    `Create a premium, emotionally expressive web section inspired by ${String(styleLabel).toLowerCase()} UI DNA.`,
    '',
    'Characteristics:',
    `- ${data?.structure?.guessedSectionType || 'content section'}`,
    `- ${joinNonEmpty([styleLabel, emotionalTone], 'premium product language')}`,
    `- typography hierarchy using ${toStringList(data?.typography?.sizes?.slice(0, 4)) || 'clear scale'}`,
    `- rounded language using ${toStringList(data?.effects?.borderRadius?.slice(0, 3)) || 'soft radius values'}`,
    `- color direction from ${toStringList(data?.colors?.backgrounds?.slice(0, 3)) || 'neutral + accent palette'}`,
    `- emotional tone: ${emotionalTone}`,
    `- interaction energy: ${interactionEnergy}`,
    `- visual psychology: ${visualPsychology}`,
    '',
    'Use React, Tailwind CSS, and Framer Motion.',
    'Translate the style language into a fresh composition. Do not clone source layouts.',
    pickTopFrameworks(data?.frameworks).length ? `Detected stack hints: ${pickTopFrameworks(data.frameworks).join(', ')}` : 'Detected stack hints: not strongly identifiable',
  ].join('\n')

  const buildAnalysis = [
    `This interface feels like ${String(styleLabel).toLowerCase()} with a premium product finish.`,
    `Its emotional tone is ${emotionalTone}, created through ${joinNonEmpty(data?.styleIntelligence?.premiumSignals || [], 'soft depth and spacing')}.`,
    `Typography combines ${toStringList(data?.typography?.families?.slice(0, 3)) || 'a modern sans stack'} with a scale anchored around ${toStringList(data?.typography?.sizes?.slice(0, 4)) || 'clear heading/body hierarchy'}.`,
    `Layout favors ${toStringList(data?.layout?.displayPatterns?.slice(0, 4)) || 'balanced structure'} and spacing rhythm seen in ${toStringList(data?.layout?.spacingScale?.slice(0, 3)) || 'measured spacing'}.`,
    `Visual treatment uses radius tokens (${toStringList(data?.effects?.borderRadius?.slice(0, 4)) || 'soft radius'}) and shadow language (${toStringList(data?.effects?.shadows?.slice(0, 2)) || 'subtle depth'}).`,
  ].join('\n\n')

  const landingPageDna = [
    'LANDING PAGE DNA',
    '━━━━━━━━━━━━━━',
    `Style: ${styleLabel}`,
    `Narrative: ${data?.structure?.guessedSectionType === 'hero section' ? 'Immersive Storytelling' : 'Guided Product Story'}`,
    `Visual Density: ${((data?.layout?.displayPatterns || []).length <= 3) ? 'Low' : 'Balanced'}`,
    `Motion Energy: ${((data?.motion?.keyframes || []).length > 2 || (data?.motion?.transitions || []).length > 4) ? 'Expressive' : 'Restrained Premium'}`,
    `Brand Tone: ${emotionalTone}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')

  const whyThisWorks = [
    'WHY THIS WORKS',
    '━━━━━━━━━━━━━━',
    `This interface feels premium because it combines ${joinNonEmpty([
      (data?.effects?.shadows || []).length ? 'layered depth' : '',
      (data?.effects?.borderRadius || []).length ? 'soft geometry' : '',
      (data?.motion?.transitions || []).length ? 'restrained motion choreography' : '',
      (data?.layout?.spacingScale || []).length ? 'generous breathing room' : '',
    ], 'balanced hierarchy')} with a clear emotional hierarchy and a product-first reading order.`,
    `The style reads as ${String(styleLabel).toLowerCase()} and translates well into a reusable design direction instead of a one-off clone.`,
    '━━━━━━━━━━━━━━',
  ].join('\n')

  const stylePersonality = [
    'STYLE PERSONALITY',
    '━━━━━━━━━━━━━━',
    `Label: ${styleLabel}`,
    `Emotional tone: ${emotionalTone}`,
    `Interaction energy: ${interactionEnergy}`,
    `Visual psychology: ${visualPsychology}`,
    `Premium signals: ${joinNonEmpty(data?.styleIntelligence?.premiumSignals || [], 'quiet luxury cues')}`,
    '━━━━━━━━━━━━━━',
  ].join('\n')

  return {
    aiPrompt,
    designAnalysis: buildAnalysis,
    designDna: [
      'COLOR DNA',
      '━━━━━━━━━━━━━━',
      `Palette: ${joinNonEmpty([...(data?.colors?.backgrounds || []).slice(0, 4), ...(data?.colors?.textColors || []).slice(0, 2)], 'cinematic dark surfaces with soft accents')}`,
      `Gradients: ${toStringList(data?.colors?.gradients?.slice(0, 3)) || 'subtle gradient glow'}`,
      `Contrast mood: ${emotionalTone}`,
      '━━━━━━━━━━━━━━',
    ].join('\n'),
    landingPageDna,
    whyThisWorks,
    stylePersonality,
    aetherScore: buildScoreboard(data),
    buildPattern: [
      'Structure:',
      `- ${joinNonEmpty(data?.structure?.buildPattern || [], 'Flexible composition with clear hierarchy')}`,
      '',
      'Visual System:',
      `- ${toStringList(data?.effects?.borderRadius?.slice(0, 3)) || 'Large rounded surfaces'}`,
      `- ${toStringList(data?.colors?.backgrounds?.slice(0, 3)) || 'Muted dark palette'}`,
      '',
      'Interaction:',
      `- ${toStringList(data?.motion?.hoverEffects?.slice(0, 3)) || 'Smooth hover feedback and controlled motion'}`,
      '',
      'Framework Clues:',
      `- ${joinNonEmpty(pickTopFrameworks(data?.frameworks), 'Modern React architecture')}`,
    ].join('\n'),
    colorDna: [
      'COLOR DNA',
      '━━━━━━━━━━━━━━',
      `Palette: ${joinNonEmpty([...(data?.colors?.backgrounds || []).slice(0, 4), ...(data?.colors?.textColors || []).slice(0, 2)], 'cinematic dark surfaces with soft accents')}`,
      `Gradients: ${toStringList(data?.colors?.gradients?.slice(0, 3)) || 'subtle gradient glow'}`,
      `Contrast mood: ${emotionalTone}`,
      '━━━━━━━━━━━━━━',
    ].join('\n'),
    typography: [
      'TYPOGRAPHY DNA',
      '━━━━━━━━━━━━━━',
      `Families: ${toStringList(data?.typography?.families?.slice(0, 4)) || 'modern sans stack'}`,
      `Hierarchy: ${toStringList(data?.typography?.sizes?.slice(0, 5)) || 'clear display to body scale'}`,
      `Weights: ${toStringList(data?.typography?.weights?.slice(0, 4)) || 'balanced weight range'}`,
      `Personality: ${(styleLabel || '').includes('Luxury') ? 'editorial and restrained' : 'clean and product-led'}`,
      '━━━━━━━━━━━━━━',
    ].join('\n'),
    layout: [
      'SPACING DNA',
      '━━━━━━━━━━━━━━',
      `Rhythm: ${toStringList(data?.layout?.spacingScale?.slice(0, 4)) || 'balanced breathing room'}`,
      `Alignment: ${toStringList(data?.layout?.alignments?.slice(0, 4)) || 'clean alignment grid'}`,
      `Containers: ${toStringList(data?.layout?.containerWidths?.slice(0, 3)) || 'intentional max-width structure'}`,
      '━━━━━━━━━━━━━━',
    ].join('\n'),
    components: [
      `Section archetype: ${data?.structure?.guessedSectionType || 'content section'}`,
      `Components: ${joinNonEmpty(data?.structure?.components || [], 'content, CTA, supporting blocks')}`,
      `CTA patterns: ${joinNonEmpty(data?.structure?.ctaPatterns || [], 'primary and secondary CTA pairing')}`,
    ].join('\n'),
    tailwindTokens: [
      ':root {',
      ...(data?.colors?.backgrounds || []).slice(0, 5).map((v, i) => `  --color-surface-${i + 1}: ${v};`),
      ...(data?.colors?.textColors || []).slice(0, 5).map((v, i) => `  --color-text-${i + 1}: ${v};`),
      ...(data?.effects?.borderRadius || []).slice(0, 5).map((v, i) => `  --radius-${i + 1}: ${v};`),
      '}',
    ].join('\n'),
    similarDesign: [
      'GENERATE SIMILAR DESIGN',
      '━━━━━━━━━━━━━━',
      'Generate Similar Hero',
      'Reimagine This Section',
      'Create New Layout',
      'Generate Alternative CTA',
      '━━━━━━━━━━━━━━',
      `Preserve the ${String(styleLabel).toLowerCase()} feeling, but shift composition, rhythm, and layout so the result feels original.`,
    ].join('\n'),
    cursorExport: [
      'Cursor export',
      'Translate the attached UI DNA into a production-ready React + Tailwind implementation.',
      `Style direction: ${styleLabel}.`,
      `Keep the emotional tone: ${emotionalTone}.`,
      'Avoid cloning the source layout. Generate a fresh composition with the same taste level.',
    ].join('\n'),
    v0Export: [
      'v0 export',
      'Generate a modern landing experience inspired by this design intelligence.',
      `Use ${String(styleLabel).toLowerCase()} cues, premium spacing, and polished interaction timing.`,
    ].join('\n'),
    reactGuidance: [
      `Build ${data?.structure?.guessedSectionType || 'content section'} as a composable React section.`,
      `Split into components: ${joinNonEmpty(data?.structure?.components || [], 'container, content, CTA')}.`,
      `Use typography scale from: ${toStringList(data?.typography?.sizes?.slice(0, 5)) || 'clear scale'}.`,
      `Apply rounded system: ${toStringList(data?.effects?.borderRadius?.slice(0, 4)) || 'rounded-xl'}.`,
      `Respect CTA patterns: ${joinNonEmpty(data?.structure?.ctaPatterns || [], 'primary + secondary actions')}.`,
    ].join('\n'),
    motionAnalysis: [
      'MOTION DNA',
      '━━━━━━━━━━━━━━',
      `Transition language: ${toStringList(data?.motion?.transitions?.slice(0, 4)) || 'subtle motion cues'}`,
      `Hover behavior: ${toStringList(data?.motion?.hoverEffects?.slice(0, 4)) || 'quiet hover feedback'}`,
      `Scroll cues: ${toStringList(data?.motion?.scrollIndicators?.slice(0, 3)) || 'limited scroll choreography'}`,
      `Energy: ${interactionEnergy}`,
      '━━━━━━━━━━━━━━',
    ].join('\n'),
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
    designDna: String(analysis.designDna || analysis.colorDna || ''),
    landingPageDna: String(analysis.landingPageDna || ''),
    whyThisWorks: String(analysis.whyThisWorks || ''),
    stylePersonality: String(analysis.stylePersonality || ''),
    aetherScore: String(analysis.aetherScore || ''),
    buildPattern: String(analysis.buildPattern || ''),
    colorDna: String(analysis.colorDna || analysis.designDna || ''),
    typography: String(analysis.typography || ''),
    layout: String(analysis.layout || ''),
    components: String(analysis.components || ''),
    tailwindTokens: String(analysis.tailwindTokens || ''),
    similarDesign: String(analysis.similarDesign || ''),
    cursorExport: String(analysis.cursorExport || ''),
    v0Export: String(analysis.v0Export || ''),
    reactGuidance: String(analysis.reactGuidance || ''),
    motionAnalysis: String(analysis.motionAnalysis || ''),
    jsonExport: String(analysis.jsonExport || JSON.stringify(originalData, null, 2)),
  }
}

module.exports = {
  buildFallbackAnalysis,
  normalizeAnalysisShape,
}
