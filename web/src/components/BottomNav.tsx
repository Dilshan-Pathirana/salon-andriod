import React from 'react'
import { motion } from 'framer-motion'

export type PageType = 'home' | 'book' | 'queue' | 'profile'
export type BottomNavRole = 'visitor' | 'user' | 'admin'

interface BottomNavProps {
  activePage: PageType
  onChange: (page: PageType) => void
  role: BottomNavRole
}

function HomeIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )
}
function BookIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/><path d="M7 10h5v5H7z"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )
}
function QueueIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15 4a8 8 0 0 1 0 16M11.5 6.5A5.5 5.5 0 0 1 17 12a5.5 5.5 0 0 1-5.5 5.5M8 9a3 3 0 0 1 0 6"/><circle cx="8" cy="12" r="1"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 12a5 5 0 0 0-5-5"/><path d="M21 12a9 9 0 0 0-9-9"/><path d="M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M13 16a4 4 0 0 0 0-8"/></svg>
  )
}
function PersonIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
}

export function BottomNav({ activePage, onChange, role }: BottomNavProps) {
  type NavItem = { id: PageType; Icon: React.FC<{ filled: boolean }>; label: string }

  const navItems: NavItem[] =
    role === 'visitor'
      ? [
          { id: 'home', Icon: HomeIcon, label: 'Home' },
          { id: 'profile', Icon: PersonIcon, label: 'Login' },
        ]
      : role === 'admin'
        ? [
            { id: 'home', Icon: HomeIcon, label: 'Home' },
            { id: 'profile', Icon: PersonIcon, label: 'Profile' },
          ]
        : [
            { id: 'home', Icon: HomeIcon, label: 'Home' },
            { id: 'book', Icon: BookIcon, label: 'Bookings' },
            { id: 'queue', Icon: QueueIcon, label: 'Queue' },
            { id: 'profile', Icon: PersonIcon, label: 'Profile' },
          ]

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/85 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,108,73,0.05)]">
      {navItems.map(({ id, Icon, label }) => {
        const isActive = activePage === id
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.88 }}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-primary bg-emerald-50/60'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            aria-label={label}
          >
            <Icon filled={isActive} />
            <span className="font-label text-[10px] font-bold tracking-[0.05em] uppercase mt-1">
              {label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
