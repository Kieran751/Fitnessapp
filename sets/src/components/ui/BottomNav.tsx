import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookMarked, TrendingUp, History } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/templates', label: 'Templates', icon: BookMarked },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/history', label: 'History', icon: History },
] as const

export function BottomNav() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] pb-safe">
      <div className="flex items-stretch h-[64px]">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative min-h-[44px] transition-colors duration-150 outline-none"
            >
              <div className="relative flex items-center justify-center w-11 h-8">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent-muted)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className={[
                    'relative z-10 transition-colors',
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
                  ].join(' ')}
                />
              </div>
              <span
                className={[
                  'text-[10px] font-semibold tracking-wide transition-colors',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
                ].join(' ')}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
