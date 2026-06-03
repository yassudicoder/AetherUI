import type { ColorStats, EffectsStats, LayoutStats, TypographyStats } from '../types'
import { uniqueSorted } from '../utils/helpers'

const collectNodes = (root: HTMLElement): HTMLElement[] => {
  return [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
}

export const analyzeTypography = (root: HTMLElement): TypographyStats => {
  const families: string[] = []
  const sizes: string[] = []
  const weights: string[] = []
  const lineHeights: string[] = []
  const letterSpacing: string[] = []

  collectNodes(root).forEach((node) => {
    const computed = getComputedStyle(node)

    families.push(computed.fontFamily)
    sizes.push(computed.fontSize)
    weights.push(computed.fontWeight)
    lineHeights.push(computed.lineHeight)
    letterSpacing.push(computed.letterSpacing)
  })

  return {
    families: uniqueSorted(families),
    sizes: uniqueSorted(sizes),
    weights: uniqueSorted(weights),
    lineHeights: uniqueSorted(lineHeights),
    letterSpacing: uniqueSorted(letterSpacing),
  }
}

export const analyzeColors = (root: HTMLElement): ColorStats => {
  const textColors: string[] = []
  const backgrounds: string[] = []
  const gradients: string[] = []
  const opacityUsage: string[] = []

  collectNodes(root).forEach((node) => {
    const computed = getComputedStyle(node)
    textColors.push(computed.color)
    backgrounds.push(computed.backgroundColor)
    opacityUsage.push(computed.opacity)

    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
      if (computed.backgroundImage.includes('gradient')) {
        gradients.push(computed.backgroundImage)
      }
    }
  })

  return {
    textColors: uniqueSorted(textColors),
    backgrounds: uniqueSorted(backgrounds),
    gradients: uniqueSorted(gradients),
    opacityUsage: uniqueSorted(opacityUsage),
  }
}

export const analyzeLayout = (root: HTMLElement): LayoutStats => {
  const displayPatterns: string[] = []
  const spacingScale: string[] = []
  const alignments: string[] = []
  const containerWidths: string[] = []
  const responsiveHints: string[] = []

  collectNodes(root).forEach((node) => {
    const computed = getComputedStyle(node)

    displayPatterns.push(computed.display)
    spacingScale.push(`p:${computed.paddingTop}/${computed.paddingRight} m:${computed.marginTop}/${computed.marginRight}`)
    alignments.push(`${computed.justifyContent || 'normal'} / ${computed.alignItems || 'normal'}`)

    if (node === root || computed.maxWidth !== 'none') {
      containerWidths.push(`${computed.width} max:${computed.maxWidth}`)
    }

    if (
      computed.display.includes('grid') ||
      computed.display.includes('flex') ||
      node.className.toString().toLowerCase().includes('container')
    ) {
      responsiveHints.push(`${node.tagName.toLowerCase()} uses ${computed.display}`)
    }
  })

  return {
    displayPatterns: uniqueSorted(displayPatterns),
    spacingScale: uniqueSorted(spacingScale),
    alignments: uniqueSorted(alignments),
    containerWidths: uniqueSorted(containerWidths),
    responsiveHints: uniqueSorted(responsiveHints),
  }
}

export const analyzeEffects = (root: HTMLElement): EffectsStats => {
  const shadows: string[] = []
  const blurs: string[] = []
  const borderRadius: string[] = []

  let frostedCount = 0

  collectNodes(root).forEach((node) => {
    const computed = getComputedStyle(node)

    if (computed.boxShadow && computed.boxShadow !== 'none') {
      shadows.push(computed.boxShadow)
    }

    if (computed.backdropFilter && computed.backdropFilter !== 'none') {
      blurs.push(computed.backdropFilter)
      frostedCount += 1
    }

    if (computed.filter && computed.filter.includes('blur')) {
      blurs.push(computed.filter)
      frostedCount += 1
    }

    borderRadius.push(computed.borderRadius)
  })

  const nodeCount = collectNodes(root).length

  return {
    shadows: uniqueSorted(shadows),
    blurs: uniqueSorted(blurs),
    borderRadius: uniqueSorted(borderRadius),
    glassmorphismScore: nodeCount > 0 ? Math.round((frostedCount / nodeCount) * 100) : 0,
  }
}

export const classifyInteractionEnergy = (computed: CSSStyleDeclaration, styleLabel: string): string => {
  if (computed.transitionDuration !== '0s' || computed.animationDuration !== '0s') {
    return styleLabel === 'brutalist' ? 'Sharp and deliberate' : 'Smooth and expressive'
  }

  if (styleLabel === 'editorial luxury') {
    return 'Calm and editorial'
  }

  return 'Restrained and product-led'
}

export const classifyVisualPsychology = (styleLabel: string): string => {
  switch (styleLabel) {
    case 'cinematic minimal':
      return 'Uses quiet contrast and spacious framing to signal premium restraint.'
    case 'editorial luxury':
      return 'Uses typographic hierarchy and elegant pacing to feel editorial and elevated.'
    case 'futuristic':
      return 'Uses glow, depth, and gradient energy to feel forward-looking and intelligent.'
    case 'brutalist':
      return 'Uses stark geometry and raw surfaces to feel direct and confrontational.'
    case 'startup SaaS':
      return 'Uses structured spacing and action-led composition to feel clear and conversion focused.'
    case 'immersive':
      return 'Uses motion and layered surfaces to pull the viewer into a story-driven experience.'
    default:
      return 'Uses balanced hierarchy and tasteful rhythm to feel modern and trustworthy.'
  }
}
