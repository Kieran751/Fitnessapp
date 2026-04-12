import { Link, useRouterState } from '@tanstack/react-router'
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
    <nav className="fixed bottom-3 left-4 right-4 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div
        className="flex items-stretch h-[64px] rounded-3xl border border-[var(--glass-border)]"
        style={{
          background: 'rgba(15, 23, 41, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
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
                  <div
                    className="absolute inset-0 rounded-full bg-[var(--primary-surface)]"
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className={[
                    'relative z-10 transition-colors duration-150',
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
                  ].join(' ')}
                />
              </div>
              <span
                className={[
                  'text-[10px] font-semibold tracking-wide transition-colors duration-150',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
                ].join(' ')}
                style={{ fontFamily: "'Manrope', sans-serif" }}
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
