'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, BellOff, CheckCheck, AlertCircle, AlarmClock, Settings, User, Menu, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { Notification } from '@/services/notification.service'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { navItems } from '@/components/layout/Sidebar'

// Icon per notification type
function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'reminder') return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#008378' + '20' }}>
      <AlarmClock className="w-4 h-4" style={{ color: '#008378' }} />
    </div>
  )
  if (type === 'alert') return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#fea61920' }}>
      <AlertCircle className="w-4 h-4" style={{ color: '#855300' }} />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#00685f20' }}>
      <Bell className="w-4 h-4" style={{ color: '#00685f' }} />
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
      className="h-[60px] flex items-center gap-4 px-4 md:px-6 border-b border-[#e2e8f0] sticky top-0 z-40"
      style={{ background: 'rgba(247,249,251,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden p-2 -ml-2 text-[#6d7a77] hover:bg-[#e6e8ea] rounded-full transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6d7a77]" />
          <input
            type="search"
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-4 bg-[#f2f4f6] border border-[#e2e8f0] rounded-full text-sm placeholder:text-[#bcc9c6] text-[#191c1e] outline-none transition-all focus:border-[#00685f] focus:bg-white"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-3">

        {/* Settings */}
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-[#6d7a77] hover:bg-[#e6e8ea] transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={panelRef}>
          <button
            id="notification-bell"
            onClick={() => setOpen(v => !v)}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150',
              open ? 'bg-[#00685f] text-white' : 'bg-[#f2f4f6] text-[#3d4947] hover:bg-[#e6e8ea]'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none"
                  style={{ background: '#fea619' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute -right-12 sm:-right-2 mt-3 w-[calc(100vw-32px)] sm:w-[380px] origin-top-right bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#191c1e]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: '#00685f' }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
                      style={{ color: '#00685f' }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[340px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#bcc9c6]">
                      <BellOff className="w-7 h-7" />
                      <span className="text-sm font-medium">No notifications yet</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f2f4f6]">
                      {notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            'w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f7f9fb]',
                            !n.is_read && 'border-l-2 border-[#00685f] pl-[18px]'
                          )}
                        >
                          <NotificationIcon type={n.type} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-[13px] leading-snug line-clamp-1',
                              !n.is_read ? 'font-bold text-[#191c1e]' : 'font-medium text-[#3d4947]'
                            )}>
                              {n.title}
                            </p>
                            <p className="text-[12px] text-[#6d7a77] mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-[#bcc9c6] mt-1 uppercase tracking-wide font-medium">
                              {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: '#00685f' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[#f2f4f6] bg-[#f7f9fb]">
                  <button className="text-[11px] font-bold uppercase tracking-wider w-full text-center hover:opacity-70 transition-opacity" style={{ color: '#00685f' }}>
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#00685f]/20 cursor-pointer hover:ring-[#00685f]/40 transition-all"
          style={{ background: 'linear-gradient(135deg, #00685f, #008378)' }}
        >
          <User className="w-4 h-4" />
        </div>
      </div>
      </header>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-[#f2f4f6] shadow-2xl z-50 flex flex-col py-8 md:hidden"
            >
              <div className="flex items-center justify-between px-6 mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00685f, #008378)' }}
                  >
                    🧠
                  </div>
                  <span className="text-[17px] font-bold tracking-tight text-[#00685f]">
                    NeuroPlan AI
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#6d7a77] hover:bg-[#e6e8ea] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                      <item.icon className="w-[18px] h-[18px] mb-0.5 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="px-6 py-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#e6e8ea] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#191c1e] leading-tight">Student</span>
                    <span className="text-xs text-[#6d7a77]">Free Plan</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
