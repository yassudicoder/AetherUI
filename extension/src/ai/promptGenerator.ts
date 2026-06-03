import type { ExtractedUIData } from '../types'

export const generatePrompt = (data: ExtractedUIData): string => {
  const aesthetics = [
    data.styleIntelligence.styleLabel.toLowerCase(),
    data.effects.glassmorphismScore > 18 ? 'glassmorphism surfaces' : 'clean layered surfaces',
    data.motion.transitions.length > 0 ? 'smooth micro interactions' : 'minimal deliberate motion',
    data.layout.displayPatterns.includes('grid') ? 'structured grid composition' : 'balanced flex composition',
  ]

  const frameworkHints = Object.entries(data.frameworks)
    .filter(([, score]) => score >= 45)
    .map(([name, score]) => `${name} ${score}%`)
    .join(', ')

  return [
    `Create a premium, emotionally expressive web section inspired by ${data.styleIntelligence.styleLabel.toLowerCase()} UI DNA.`,
    '',
    'Characteristics:',
    `- ${data.structure.guessedSectionType}`,
    `- ${aesthetics.join(', ')}`,
    `- typography hierarchy using ${data.typography.sizes.slice(0, 4).join(', ') || 'clear scale'}`,
    `- rounded language using ${data.effects.borderRadius.slice(0, 3).join(', ') || 'soft radius values'}`,
    `- color direction from ${data.colors.backgrounds.slice(0, 3).join(' | ') || 'neutral + accent palette'}`,
    `- emotional tone: ${data.styleIntelligence.emotionalTone}`,
    `- interaction energy: ${data.styleIntelligence.interactionEnergy}`,
    `- visual psychology: ${data.styleIntelligence.visualPsychology}`,
    `- premium signals: ${data.styleIntelligence.premiumSignals.join(' | ')}`,
    '',
    'Use:',
    '- React',
    '- Tailwind CSS',
    '- Framer Motion for polished interactions',
    '',
    frameworkHints ? `Detected stack hints from source UI: ${frameworkHints}` : 'Detected stack hints: not strongly identifiable',
    '',
    'Add a companion narrative for why the design works, a landing page DNA summary, and a similar-design generation path that changes composition but preserves taste.',
    '',
    'Do not clone the original design 1:1. Translate the style language into a new composition with original structure and premium motion language.',
  ].join('\n')
}
