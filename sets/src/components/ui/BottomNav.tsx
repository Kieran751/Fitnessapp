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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/90 backdrop-blur-xl border-t border-[var(--border)] pb-safe">
      <div className="flex items-stretch h-16">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors duration-150 outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--accent)] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.75}
                className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}
              />
              <span
                className={[
                  'text-[10px] font-medium',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]',
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
