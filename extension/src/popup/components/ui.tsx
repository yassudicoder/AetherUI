import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'
type BadgeTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'border-cyan-300/35 bg-cyan-300/15 text-cyan-50 shadow-[0_12px_36px_-20px_rgba(34,211,238,0.95)] hover:border-cyan-200/60 hover:bg-cyan-300/22',
  secondary:
    'border-white/10 bg-white/[0.055] text-zinc-100 hover:border-white/18 hover:bg-white/[0.085]',
  ghost: 'border-transparent bg-transparent text-zinc-300 hover:border-white/10 hover:bg-white/[0.055]',
  danger:
    'border-rose-300/25 bg-rose-400/10 text-rose-100 hover:border-rose-200/45 hover:bg-rose-400/15',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2 text-[11px]',
  md: 'h-10 px-4 text-xs',
}

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-white/10 bg-white/[0.055] text-zinc-300',
  success: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  info: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  warning: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  danger: 'border-rose-300/25 bg-rose-400/10 text-rose-100',
}

interface CardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  iconTrailing?: LucideIcon
  isLoading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

interface BadgeProps {
  children: ReactNode
  className?: string
  tone?: BadgeTone
}

interface SectionProps {
  action?: ReactNode
  children: ReactNode
  className?: string
  description?: string
  eyebrow?: string
  title: string
}

interface TabProps {
  active: boolean
  children: ReactNode
  onClick: () => void
}

export const Card = ({ children, className, interactive = false }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className={clsx(
      'rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_18px_70px_-48px_rgba(34,211,238,0.7)] backdrop-blur-xl',
      interactive && 'transition duration-200 hover:border-white/18 hover:bg-white/[0.065]',
      className,
    )}
  >
    {children}
  </motion.div>
)

export const Button = ({
  children,
  className,
  disabled,
  icon: Icon,
  iconTrailing: IconTrailing,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) => (
  <motion.button
    type={type}
    disabled={disabled || isLoading}
    whileHover={disabled || isLoading ? undefined : { y: -1, scale: 1.01 }}
    whileTap={disabled || isLoading ? undefined : { scale: 0.985 }}
    transition={{ duration: 0.14, ease: 'easeOut' }}
    className={clsx(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-semibold leading-none outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-cyan-200/60 disabled:cursor-not-allowed disabled:opacity-45',
      buttonVariants[variant],
      buttonSizes[size],
      className,
    )}
    {...props}
  >
    {Icon && <Icon className={clsx('h-4 w-4', isLoading && 'animate-spin')} />}
    <span className="truncate">{children}</span>
    {IconTrailing && <IconTrailing className="h-4 w-4" />}
  </motion.button>
)

export const Badge = ({ children, className, tone = 'neutral' }: BadgeProps) => (
  <span className={clsx('inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium', badgeTones[tone], className)}>
    {children}
  </span>
)

export const Section = ({ action, children, className, description, eyebrow, title }: SectionProps) => (
  <section className={clsx('space-y-4', className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        {eyebrow && <div className="text-[11px] font-medium uppercase text-zinc-500">{eyebrow}</div>}
        <h2 className="truncate text-sm font-semibold text-zinc-50">{title}</h2>
        {description && <p className="text-xs leading-5 text-zinc-400">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)

export const Tab = ({ active, children, onClick }: TabProps) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'relative h-8 shrink-0 rounded-md px-4 text-[11px] font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-cyan-200/60',
      active ? 'text-cyan-50' : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100',
    )}
  >
    {active && (
      <motion.span
        layoutId="active-analysis-tab"
        className="absolute inset-0 rounded-md border border-cyan-300/25 bg-cyan-300/12 shadow-[0_10px_28px_-18px_rgba(34,211,238,0.95)]"
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    )}
    <span className="relative">{children}</span>
  </button>
)
