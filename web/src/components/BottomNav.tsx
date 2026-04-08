import React from 'react'
import { Home, CalendarDays, Users, User } from 'lucide-react'
import { motion } from 'framer-motion'
export type PageType = 'home' | 'book' | 'queue' | 'profile'

export type BottomNavRole = 'visitor' | 'user' | 'admin'

interface BottomNavProps {
  activePage: PageType
  onChange: (page: PageType) => void
  role: BottomNavRole
}
export function BottomNav({ activePage, onChange, role }: BottomNavProps) {
  const navItems =
    role === 'visitor'
      ? [
          {
            id: 'home',
            icon: Home,
            label: 'HOME',
          },
          {
            id: 'profile',
            icon: User,
            label: 'LOGIN',
          },
        ]
      : role === 'admin'
        ? [
            {
              id: 'home',
              icon: Home,
              label: 'HOME',
            },
            {
              id: 'profile',
              icon: User,
              label: 'PROFILE',
            },
          ]
        : [
            {
              id: 'home',
              icon: Home,
              label: 'HOME',
            },
            {
              id: 'book',
              icon: CalendarDays,
              label: 'BOOK',
            },
            {
              id: 'queue',
              icon: Users,
              label: 'QUEUE',
            },
            {
              id: 'profile',
              icon: User,
              label: 'PROFILE',
            },
          ]
  return (
    <div className="w-full rounded-t-3xl border-t border-emerald-100/70 bg-white/85 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,108,73,0.08)]">
      <div className="flex h-16 items-center justify-around px-2 pb-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                onClick={() => onChange(id as PageType)}
                className="relative flex h-full min-w-[64px] flex-col items-center justify-center space-y-1 focus:outline-none group"
                aria-label={label}
              >
                {isActive && (
                  <motion.div 
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 h-[3px] w-8 rounded-b-full bg-emerald-600"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#006c49' : '#64748b',
                    y: isActive ? 2 : 0
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <Icon strokeWidth={isActive ? 2.5 : 2} className="w-[22px] h-[22px]" />
                </motion.div>
                <div
                  className={`mt-1 text-[10px] font-extrabold tracking-[0.08em] transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}
                >
                  {label}
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}

