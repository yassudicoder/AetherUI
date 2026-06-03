import { detectAnimations } from './animationDetector'
import { analyzeColors, analyzeEffects, analyzeLayout, analyzeTypography, classifyInteractionEnergy, classifyVisualPsychology } from './styleAnalyzer'
import type { ExtractedUIData, FrameworkDetection, StructureStats } from '../types'
import { truncate, uniqueSorted } from '../utils/helpers'

const detectFrameworks = (): FrameworkDetection => {
  const scripts = Array.from(document.querySelectorAll('script[src]')).map((script) => script.getAttribute('src')?.toLowerCase() ?? '')
  const html = document.documentElement.outerHTML.toLowerCase()
  const hasClassClue = (pattern: string) => Array.from(document.querySelectorAll(`[class*="${pattern}"]`)).length > 0
  const confidence = (enabled: boolean, strong = 92, weak = 58) => (enabled ? strong : weak)

  return {
    tailwind: confidence(html.includes('tailwind') || html.includes('tw-') || Array.from(document.querySelectorAll('[class*="md:"], [class*="lg:"]')).length > 0, 96, 12),
    react: confidence(scripts.some((src) => src.includes('react')) || html.includes('__reactfiber') || html.includes('data-reactroot'), 94, 18),
    nextjs: confidence(html.includes('_next') || scripts.some((src) => src.includes('next')), 93, 6),
    gsap: confidence(scripts.some((src) => src.includes('gsap')) || html.includes('gsap'), 92, 5),
    framerMotion: confidence(scripts.some((src) => src.includes('framer')) || html.includes('framer-motion'), 94, 8),
    bootstrap: confidence(scripts.some((src) => src.includes('bootstrap')) || Array.from(document.querySelectorAll('[class*="col-"]')).length > 0, 88, 10),
    vue: confidence(html.includes('__vuebundle') || scripts.some((src) => src.includes('vue')) || html.includes('data-v-') || hasClassClue('v-'), 93, 5),
    svelte: confidence(html.includes('data-svelte') || scripts.some((src) => src.includes('svelte')), 93, 5),
    astro: confidence(html.includes('data-astro') || scripts.some((src) => src.includes('astro')), 92, 4),
    solidjs: confidence(html.includes('data-solid') || scripts.some((src) => src.includes('solid')), 91, 5),
    remix: confidence(html.includes('__remix') || scripts.some((src) => src.includes('remix')), 91, 4),
    nuxt: confidence(html.includes('__nuxt') || scripts.some((src) => src.includes('nuxt')), 92, 4),
  }
}

const guessSectionType = (root: HTMLElement): string => {
  const classBlob = root.className.toString().toLowerCase()
  const textBlob = root.textContent?.toLowerCase() ?? ''
  const tag = root.tagName.toLowerCase()

  if (tag === 'nav' || classBlob.includes('nav')) return 'navbar'
  if (tag === 'footer' || classBlob.includes('footer')) return 'footer'
  if (classBlob.includes('hero') || classBlob.includes('headline') || textBlob.includes('get started')) return 'hero section'
  if (classBlob.includes('pricing') || textBlob.includes('pricing')) return 'pricing cards'
  if (classBlob.includes('testimonial') || textBlob.includes('testimonial')) return 'testimonials'
  if (classBlob.includes('bento') || classBlob.includes('grid')) return 'bento grid / feature grid'

  return 'content block'
}

const detectComponents = (root: HTMLElement): string[] => {
  const components: string[] = []

  if (root.querySelector('h1, h2')) components.push('headline block')
  if (root.querySelector('button, a[role="button"]')) components.push('call to action')
  if (root.querySelector('img, video, picture')) components.push('media')
  if (root.querySelector('ul, ol')) components.push('list group')
  if (root.querySelector('[class*="card"]')) components.push('cards')
  if (root.querySelector('form')) components.push('form')

  return uniqueSorted(components)
}

const detectCTA = (root: HTMLElement): string[] => {
  const ctas = Array.from(root.querySelectorAll<HTMLElement>('button, a'))
  return uniqueSorted(
    ctas
      .map((cta) => {
        const text = cta.textContent?.trim()
        if (!text) {
          return ''
        }

        return `${cta.tagName.toLowerCase()}: ${truncate(text, 42)}`
      })
      .filter(Boolean),
  )
}

const detectBuildPattern = (root: HTMLElement): string[] => {
  const computed = getComputedStyle(root)
  const patterns: string[] = []

  patterns.push(computed.display.includes('grid') ? 'Two-dimensional grid composition' : 'Primary flex composition')
  patterns.push(root.querySelector('[class*="sticky"]') ? 'Sticky alignment for primary action' : 'Flow-based content alignment')
  patterns.push(root.querySelector('button, a') ? 'Action-led composition' : 'Content-first composition')
  patterns.push(root.querySelector('[class*="card"]') ? 'Layered card hierarchy' : 'Continuous surface language')

  return uniqueSorted(patterns)
}

const classifyStyleIntelligence = (root: HTMLElement) => {
  const computed = getComputedStyle(root)
  const text = `${root.textContent ?? ''} ${root.className.toString()}`.toLowerCase()

  const labels = [
    ['cinematic minimal', computed.backdropFilter !== 'none' || computed.boxShadow !== 'none' || computed.borderRadius.includes('px')],
    ['startup SaaS', text.includes('pricing') || text.includes('dashboard') || text.includes('saas')],
    ['brutalist', computed.borderRadius === '0px' && computed.boxShadow === 'none'],
    ['editorial luxury', computed.letterSpacing !== 'normal' || parseFloat(computed.fontWeight) >= 600],
    ['futuristic', computed.backgroundImage.includes('gradient') || text.includes('future') || text.includes('glow')],
    ['immersive', computed.opacity !== '1' || computed.transitionDuration !== '0s'],
    ['Apple-inspired', computed.borderRadius !== '0px' && computed.paddingTop !== '0px'],
    ['Linear-inspired', text.includes('linear') || text.includes('modern')],
  ] as const

  const matches = labels.filter(([, enabled]) => enabled).map(([label]) => label)
  const styleLabel = matches[0] || 'cinematic minimal'
  const interactionEnergy = classifyInteractionEnergy(computed, styleLabel)
  const visualPsychology = classifyVisualPsychology(styleLabel)

  return {
    styleLabel,
    emotionalTone:
      styleLabel === 'editorial luxury'
        ? 'refined, high-end, and editorial'
        : styleLabel === 'futuristic'
          ? 'forward-looking, vivid, and ambitious'
          : styleLabel === 'Linear-inspired'
            ? 'precise, calm, and product-focused'
            : 'quietly premium and polished',
    interactionEnergy,
    visualPsychology,
    premiumSignals: uniqueSorted([
      computed.borderRadius !== '0px' ? 'soft geometry' : '',
      computed.boxShadow !== 'none' ? 'layered depth' : '',
      computed.transitionDuration !== '0s' ? 'smooth transitions' : '',
      computed.backdropFilter !== 'none' ? 'glassmorphism depth' : '',
      computed.letterSpacing !== 'normal' ? 'careful typography rhythm' : '',
      computed.backgroundImage.includes('gradient') ? 'cinematic gradient layers' : '',
    ]),
    intelligenceSummary:
      styleLabel === 'startup SaaS'
        ? 'This UI feels like a product-led SaaS interface with a structured hierarchy and confident spacing.'
        : styleLabel === 'cinematic minimal'
          ? 'This UI feels cinematic and restrained, using soft depth, clear hierarchy, and premium breathing room.'
          : `This UI expresses a ${styleLabel} language with deliberate geometry, contrast, and interaction polish.`,
  }
}

const buildStructure = (root: HTMLElement): StructureStats => {
  return {
    guessedSectionType: guessSectionType(root),
    components: detectComponents(root),
    ctaPatterns: detectCTA(root),
    buildPattern: detectBuildPattern(root),
  }
}

const buildHtmlSnippet = (root: HTMLElement): string => {
  const snippet = root.outerHTML.replace(/\s+/g, ' ').trim()
  return truncate(snippet, 2200)
}

export const extractUIData = (root: HTMLElement): ExtractedUIData => {
  const rect = root.getBoundingClientRect()

  return {
    url: window.location.href,
    title: document.title,
    selectedHtmlSnippet: buildHtmlSnippet(root),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    typography: analyzeTypography(root),
    colors: analyzeColors(root),
    layout: analyzeLayout(root),
    effects: analyzeEffects(root),
    motion: detectAnimations(root),
    structure: buildStructure(root),
    frameworks: detectFrameworks(),
    styleIntelligence: classifyStyleIntelligence(root),
    selectedNodeMeta: {
      tag: root.tagName.toLowerCase(),
      className: root.className.toString(),
      id: root.id,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    },
    extractedAt: new Date().toISOString(),
  }
}
