interface SelectionState {
  hoveredElement: HTMLElement | null
  selectedElement: HTMLElement | null
  selectedRect: DOMRect | null
}

const OVERLAY_ID = 'ui-dna-hover-overlay'
const BADGE_ID = 'ui-dna-hover-badge'
const PANEL_ID = 'ui-dna-hover-panel'
const STYLE_ID = 'ui-dna-hover-style'

// Defensive message sender to avoid "Extension context invalidated" errors
const safeSendMessage = (message: unknown): void => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
      chrome.runtime.sendMessage(message)
    }
  } catch (err) {
    // ignore - extension may be reloading/unloading
    // eslint-disable-next-line no-console
    console.debug('[ui-dna] safeSendMessage failed', err)
  }
}

type HoverSnapshot = {
  details: Array<{ label: string; value: string }>
  prompt: string
  styleLabel: string
  title: string
}

export class ElementSelector {
  private expanded = false
  private isActive = false
  private overlayVisible = true
  private state: SelectionState = { hoveredElement: null, selectedElement: null, selectedRect: null }
  private onHover: ((element: HTMLElement) => void) | null = null
  private onQuickAnalyze: ((element: HTMLElement) => void) | null = null
  private onSelect: ((element: HTMLElement) => void) | null = null

  private readonly handleMouseMove = (event: MouseEvent): void => {
    if (!this.isActive) {
      return
    }

    const target = event.target as HTMLElement | null
    if (!target || this.isInjectedNode(target)) {
      return
    }

    this.state.hoveredElement = target
    this.paintOverlay(target)
    this.paintIntelligencePanel(target)
    this.onHover?.(target)
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (!this.isActive) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const target = event.target as HTMLElement | null
    if (!target || this.isInjectedNode(target)) {
      return
    }

    this.state.selectedElement = target
    this.state.selectedRect = target.getBoundingClientRect()
    this.onSelect?.(target)
    this.stop()
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive) {
      return
    }

    const key = event.key.toLowerCase()

    if (key === 'w') {
      this.toggleOverlay()
    }

    if (key === 'e') {
      this.toggleExpanded()
    }

    if (key === 'q' && this.state.hoveredElement) {
      this.onQuickAnalyze?.(this.state.hoveredElement)
    }

    if (key === 'escape') {
      this.stop()
      safeSendMessage({ type: 'UI_DNA_SELECTION_EXITED' })
    }
  }

  start(onSelect: (element: HTMLElement) => void, onHover?: (element: HTMLElement) => void, onQuickAnalyze?: (element: HTMLElement) => void): void {
    this.onHover = onHover ?? null
    this.onQuickAnalyze = onQuickAnalyze ?? null
    this.onSelect = onSelect
    this.isActive = true
    this.overlayVisible = true
    this.ensureStyleNode()
    document.documentElement.style.cursor = 'crosshair'
    document.addEventListener('mousemove', this.handleMouseMove, true)
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  stop(): void {
    this.isActive = false
    this.onHover = null
    this.onQuickAnalyze = null
    this.onSelect = null
    document.documentElement.style.cursor = ''
    document.removeEventListener('mousemove', this.handleMouseMove, true)
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    this.clearOverlay()
  }

  getSelectedElement(): HTMLElement | null {
    return this.state.selectedElement
  }

  toggleOverlay(forceOn?: boolean): void {
    this.overlayVisible = forceOn ?? !this.overlayVisible

    if (!this.overlayVisible) {
      this.clearOverlay()
      return
    }

    this.ensureStyleNode()
    const hovered = this.state.hoveredElement
    if (hovered) {
      this.paintOverlay(hovered)
      this.paintIntelligencePanel(hovered)
    }
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded
    const hovered = this.state.hoveredElement

    if (hovered) {
      this.paintOverlay(hovered)
      this.paintIntelligencePanel(hovered)
    }
  }

  private paintOverlay(target: HTMLElement): void {
    if (!this.overlayVisible) {
      this.clearOverlay()
      return
    }

    const rect = target.getBoundingClientRect()
    const overlay = this.ensureOverlayNode()
    const badge = this.ensureBadgeNode()
    const guess = this.guessComponentType(target)

    overlay.style.width = `${Math.max(rect.width, 1)}px`
    overlay.style.height = `${Math.max(rect.height, 1)}px`
    overlay.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`

    badge.textContent = `${target.tagName.toLowerCase()} / ${this.prettySection(guess)}`

    const badgeRect = badge.getBoundingClientRect()
    const badgeTop = rect.top - badgeRect.height - 8 > 8 ? rect.top - badgeRect.height - 8 : Math.min(rect.bottom + 8, window.innerHeight - badgeRect.height - 8)
    const badgeLeft = this.clamp(rect.left, 8, window.innerWidth - badgeRect.width - 8)
    badge.style.transform = `translate3d(${badgeLeft}px, ${badgeTop}px, 0)`
  }

  private paintIntelligencePanel(target: HTMLElement): void {
    if (!this.overlayVisible) {
      document.getElementById(PANEL_ID)?.remove()
      return
    }

    const rect = target.getBoundingClientRect()
    const panel = this.ensurePanelNode()
    const snapshot = this.buildHoverSnapshot(target)
    const width = this.expanded ? 320 : 280

    panel.style.width = `${width}px`
    panel.innerHTML = this.renderPanel(snapshot)

    const panelHeight = Math.min(panel.offsetHeight || (this.expanded ? 440 : 300), window.innerHeight - 32)
    const fitsRight = rect.right + width + 16 <= window.innerWidth
    const fitsLeft = rect.left - width - 16 >= 0
    const left = fitsRight ? rect.right + 12 : fitsLeft ? rect.left - width - 12 : this.clamp(rect.left, 16, window.innerWidth - width - 16)
    const top = this.clamp(rect.top, 16, window.innerHeight - panelHeight - 16)

    panel.style.maxHeight = `${window.innerHeight - 32}px`
    panel.style.transform = `translate3d(${left}px, ${top}px, 0)`
  }

  private buildHoverSnapshot(target: HTMLElement): HoverSnapshot {
    const computed = getComputedStyle(target)
    const className = target.className?.toString().split(' ')[0] ?? ''
    const type = this.guessComponentType(target)
    const styleLabel = this.classifyStyle(target)
    const layout = computed.display.includes('grid')
      ? 'Grid'
      : computed.display.includes('flex')
        ? 'Flex'
        : 'Stack'
    const motion = computed.transitionDuration !== '0s' || computed.animationName !== 'none' ? 'Animated' : 'Still'
    const details = [
      { label: 'Layout', value: computed.justifyContent !== 'normal' ? `${layout} / ${computed.justifyContent}` : layout },
      { label: 'Type', value: `${computed.fontFamily.split(',')[0] || 'system'} / ${computed.fontSize} / ${computed.fontWeight}` },
      { label: 'Color', value: `${computed.color} on ${computed.backgroundColor}` },
      { label: 'Radius', value: computed.borderRadius },
      { label: 'Spacing', value: `${computed.paddingTop} top / ${computed.paddingRight} right` },
      { label: 'Motion', value: motion },
      { label: 'Framework', value: this.detectFrameworkHint(target) },
      { label: 'Class', value: className ? `.${className}` : 'none' },
    ]

    return {
      details: this.expanded ? details : details.slice(0, 5),
      prompt: `Translate this ${styleLabel.toLowerCase()} ${type} into a fresh premium interface with balanced spacing, cinematic hierarchy, and restrained motion.`,
      styleLabel,
      title: this.prettySection(type),
    }
  }

  private renderPanel(snapshot: HoverSnapshot): string {
    const detailMarkup = snapshot.details
      .map(
        (detail) => `
          <div class="ui-dna-panel-row">
            <span>${this.escapeHtml(detail.label)}</span>
            <strong>${this.escapeHtml(detail.value)}</strong>
          </div>
        `,
      )
      .join('')

    return `
      <div class="ui-dna-panel-header">
        <div>
          <div class="ui-dna-panel-kicker">Live Intelligence</div>
          <div class="ui-dna-panel-title">${this.escapeHtml(snapshot.title)}</div>
        </div>
        <div class="ui-dna-panel-pill">${this.escapeHtml(snapshot.styleLabel)}</div>
      </div>
      <div class="ui-dna-panel-grid">${detailMarkup}</div>
      <div class="ui-dna-panel-prompt">${this.escapeHtml(snapshot.prompt)}</div>
      <div class="ui-dna-panel-footer">
        <span>Prompt</span>
        <span>DNA</span>
        <span>Tokens</span>
        <span>Motion</span>
      </div>
    `
  }

  private prettySection(value: string): string {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private classifyStyle(target: HTMLElement): string {
    const computed = getComputedStyle(target)
    const text = `${target.textContent ?? ''} ${target.className.toString()}`.toLowerCase()
    const score = {
      appleInspired: 0,
      brutalist: 0,
      cinematicMinimal: 0,
      editorialLuxury: 0,
      futuristic: 0,
      immersive: 0,
      linearInspired: 0,
      startupSaaS: 0,
    }

    if (computed.backdropFilter !== 'none' || computed.boxShadow !== 'none') score.cinematicMinimal += 1
    if (computed.borderRadius.includes('px') && parseFloat(computed.borderRadius) > 16) score.startupSaaS += 2
    if (computed.fontWeight === '700' || computed.letterSpacing !== 'normal') score.editorialLuxury += 1
    if (computed.backgroundImage.includes('gradient') || text.includes('glow')) score.futuristic += 2
    if (computed.opacity !== '1' || computed.transitionDuration !== '0s') score.immersive += 1
    if (computed.borderRadius !== '0px' && computed.paddingTop !== '0px') score.appleInspired += 1
    if (text.includes('linear') || text.includes('saas')) score.linearInspired += 2
    if (computed.display.includes('grid') || computed.display.includes('flex')) score.startupSaaS += 1
    if (computed.backgroundColor === 'rgba(0, 0, 0, 0)') score.brutalist += 1

    const ordered = Object.entries(score).sort((a, b) => b[1] - a[1])
    return this.labelStyle(ordered[0]?.[0] ?? 'cinematicMinimal')
  }

  private labelStyle(value: string): string {
    switch (value) {
      case 'appleInspired':
        return 'Apple-inspired'
      case 'brutalist':
        return 'Brutalist'
      case 'editorialLuxury':
        return 'Editorial Luxury'
      case 'futuristic':
        return 'Futuristic'
      case 'immersive':
        return 'Immersive'
      case 'linearInspired':
        return 'Linear-inspired'
      case 'startupSaaS':
        return 'Startup SaaS'
      default:
        return 'Cinematic Minimal'
    }
  }

  private detectFrameworkHint(target: HTMLElement): string {
    const className = target.className.toString().toLowerCase()

    if (className.includes('tw-') || className.includes('md:') || className.includes('lg:')) {
      return 'Tailwind likely'
    }

    if (className.includes('framer') || className.includes('motion')) {
      return 'Framer Motion likely'
    }

    if (className.includes('gsap')) {
      return 'GSAP likely'
    }

    return 'Modern React'
  }

  private clearOverlay(): void {
    document.getElementById(OVERLAY_ID)?.remove()
    document.getElementById(BADGE_ID)?.remove()
    document.getElementById(PANEL_ID)?.remove()
  }

  private ensureOverlayNode(): HTMLDivElement {
    let overlay = document.getElementById(OVERLAY_ID) as HTMLDivElement | null

    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = OVERLAY_ID
      document.body.appendChild(overlay)
    }

    return overlay
  }

  private ensureBadgeNode(): HTMLDivElement {
    let badge = document.getElementById(BADGE_ID) as HTMLDivElement | null

    if (!badge) {
      badge = document.createElement('div')
      badge.id = BADGE_ID
      document.body.appendChild(badge)
    }

    return badge
  }

  private ensurePanelNode(): HTMLDivElement {
    let panel = document.getElementById(PANEL_ID) as HTMLDivElement | null

    if (!panel) {
      panel = document.createElement('div')
      panel.id = PANEL_ID
      document.body.appendChild(panel)
    }

    return panel
  }

  private ensureStyleNode(): void {
    if (document.getElementById(STYLE_ID)) {
      return
    }

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2147483645;
        border-radius: 8px;
        border: 1px solid rgba(103, 232, 249, 0.9);
        background: rgba(34, 211, 238, 0.08);
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.22),
          0 0 28px rgba(34, 211, 238, 0.34),
          inset 0 0 32px rgba(34, 211, 238, 0.08);
        transition: transform 120ms ease, width 120ms ease, height 120ms ease, opacity 120ms ease;
        animation: ui-dna-glow 1.8s ease-in-out infinite;
      }

      #${BADGE_ID} {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2147483646;
        max-width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(103, 232, 249, 0.32);
        background: rgba(7, 9, 15, 0.92);
        color: #ecfeff;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(16px);
        font: 600 11px/1.2 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transition: transform 120ms ease, opacity 120ms ease;
      }

      #${PANEL_ID} {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2147483647;
        overflow: hidden;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(14, 16, 22, 0.94), rgba(7, 9, 15, 0.9));
        box-shadow:
          0 26px 80px rgba(0, 0, 0, 0.42),
          0 0 0 1px rgba(34, 211, 238, 0.08);
        color: #f4f4f5;
        backdrop-filter: blur(22px);
        font: 500 12px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transition: transform 140ms ease, width 140ms ease, opacity 140ms ease;
      }

      .ui-dna-panel-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .ui-dna-panel-kicker {
        margin-bottom: 4px;
        color: rgba(161, 161, 170, 0.92);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .ui-dna-panel-title {
        color: #fafafa;
        font-size: 16px;
        font-weight: 750;
        line-height: 1.2;
      }

      .ui-dna-panel-pill {
        flex: none;
        max-width: 128px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: 1px solid rgba(52, 211, 153, 0.24);
        border-radius: 999px;
        background: rgba(52, 211, 153, 0.1);
        color: #d1fae5;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 700;
      }

      .ui-dna-panel-grid {
        display: grid;
        gap: 8px;
        margin-top: 16px;
      }

      .ui-dna-panel-row {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        min-height: 28px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 6px 8px;
      }

      .ui-dna-panel-row span {
        color: rgba(161, 161, 170, 0.95);
        font-size: 10px;
        font-weight: 700;
      }

      .ui-dna-panel-row strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #e4e4e7;
        font-size: 11px;
        font-weight: 650;
      }

      .ui-dna-panel-prompt {
        margin-top: 16px;
        border-radius: 8px;
        border: 1px solid rgba(103, 232, 249, 0.18);
        background: rgba(34, 211, 238, 0.075);
        color: #ecfeff;
        padding: 12px;
        font-size: 11px;
        line-height: 1.55;
      }

      .ui-dna-panel-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .ui-dna-panel-footer span {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: #d4d4d8;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 700;
      }

      @keyframes ui-dna-glow {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.22),
            0 0 24px rgba(34, 211, 238, 0.26),
            inset 0 0 28px rgba(34, 211, 238, 0.07);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.28),
            0 0 40px rgba(52, 211, 153, 0.3),
            inset 0 0 36px rgba(52, 211, 153, 0.09);
        }
      }
    `
    document.documentElement.appendChild(style)
  }

  private isInjectedNode(target: HTMLElement): boolean {
    return Boolean(target.closest(`#${OVERLAY_ID}, #${BADGE_ID}, #${PANEL_ID}`))
  }

  private guessComponentType(element: HTMLElement): string {
    const className = element.className.toString().toLowerCase()
    const text = element.textContent?.toLowerCase() ?? ''

    if (element.tagName === 'NAV' || className.includes('nav')) {
      return 'navigation'
    }

    if (className.includes('hero') || text.includes('get started')) {
      return 'hero section'
    }

    if (element.tagName === 'BUTTON' || className.includes('btn') || className.includes('cta')) {
      return 'call to action'
    }

    if (className.includes('pricing') || className.includes('plans')) {
      return 'pricing grid'
    }

    if (className.includes('card')) {
      return 'card block'
    }

    if (element.tagName === 'FOOTER' || className.includes('footer')) {
      return 'footer'
    }

    if (className.includes('content') || className.includes('copy')) {
      return 'content block'
    }

    return 'ui component'
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), Math.max(min, max))
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
