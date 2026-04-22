'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Calendar, BarChart2, Settings, HelpCircle, Plus } from 'lucide-react'
import { logout } from '@/actions/auth'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const navItems = [
  { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/planner',    label: 'Study Planner', icon: BookOpen        },
  { href: '/calendar',   label: 'Calendar',      icon: Calendar        },
  { href: '/analytics',  label: 'Analytics',     icon: BarChart2       },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex h-screen w-[240px] fixed left-0 top-0 flex-col py-8 z-50"
      style={{ background: '#f2f4f6' }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #00685f, #008378)' }}
        >
          🧠
        </div>
        <span className="text-[17px] font-bold tracking-tight" style={{ color: '#00685f' }}>
          NeuroPlan AI
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 outline-none',
                isActive
                  ? 'text-[#00685f] font-bold bg-white rounded-r-full shadow-sm'
                  : 'text-[#3d4947] hover:text-[#191c1e] hover:bg-[#e6e8ea]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-white rounded-r-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={cn('h-[18px] w-[18px] relative z-10 shrink-0', isActive ? 'text-[#00685f]' : 'text-[#6d7a77]')}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── New Study Session CTA ─────────────────────────── */}
      <div className="px-4 mb-6">
        <Link
          href="/planner"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-lg transition-all active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00685f, #008378)', boxShadow: '0 4px 16px rgba(0,104,95,0.25)' }}
        >
          <Plus className="w-4 h-4" />
          New Study Session
        </Link>
      </div>

      {/* ── Footer Links ─────────────────────────────────── */}
      <div className="px-6 space-y-0.5 border-t border-[#e2e8f0] pt-4">
        <a
          href="#"
          className="flex items-center gap-3 py-2.5 text-[13px] text-[#3d4947] hover:text-[#191c1e] transition-colors"
        >
          <Settings className="w-4 h-4 text-[#6d7a77]" />
          Settings
        </a>
        <a
          href="#"
          className="flex items-center gap-3 py-2.5 text-[13px] text-[#3d4947] hover:text-[#191c1e] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#6d7a77]" />
          Support
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 py-2.5 text-[13px] text-[#3d4947] hover:text-red-500 transition-colors text-left"
          >
            <svg className="w-4 h-4 text-[#6d7a77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
