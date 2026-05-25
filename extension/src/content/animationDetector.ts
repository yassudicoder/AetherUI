import type { MotionStats } from '../types'
import { uniqueSorted } from '../utils/helpers'

const parseTransition = (computed: CSSStyleDeclaration): string => {
  const property = computed.transitionProperty
  const duration = computed.transitionDuration
  const timing = computed.transitionTimingFunction
  if (!property || property === 'all 0s ease 0s') {
    return ''
  }

  return `${property} ${duration} ${timing}`.trim()
}

const parseAnimation = (computed: CSSStyleDeclaration): string => {
  const name = computed.animationName
  if (!name || name === 'none') {
    return ''
  }

  return `${name} ${computed.animationDuration} ${computed.animationTimingFunction}`.trim()
}

export const detectAnimations = (root: HTMLElement): MotionStats => {
  const transitions: string[] = []
  const transforms: string[] = []
  const keyframes: string[] = []
  const hoverEffects: string[] = []
  const scrollIndicators: string[] = []

  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]

  nodes.forEach((node) => {
    const computed = getComputedStyle(node)

    const transition = parseTransition(computed)
    if (transition) {
      transitions.push(transition)
    }

    const transform = computed.transform
    if (transform && transform !== 'none') {
      transforms.push(transform)
    }

    const animation = parseAnimation(computed)
    if (animation) {
      keyframes.push(animation)
    }

    if (computed.cursor === 'pointer' && transition) {
      const descriptor = node.className ? `.${node.className.toString().split(' ')[0]}` : node.tagName.toLowerCase()
      hoverEffects.push(`${descriptor} uses transition-driven hover state`)
    }

    if (
      computed.position === 'sticky' ||
      node.dataset.aos !== undefined ||
      node.className.toString().toLowerCase().includes('scroll')
    ) {
      scrollIndicators.push(node.tagName.toLowerCase())
    }
  })

  return {
    transitions: uniqueSorted(transitions),
    transforms: uniqueSorted(transforms),
    keyframes: uniqueSorted(keyframes),
    hoverEffects: uniqueSorted(hoverEffects),
    scrollIndicators: uniqueSorted(scrollIndicators),
  }
}
