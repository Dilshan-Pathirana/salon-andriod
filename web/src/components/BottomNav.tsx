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
    <div className="w-full border-t border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                onClick={() => onChange(id as PageType)}
                className="flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 focus:outline-none relative group"
                aria-label={label}
              >
                {isActive && (
                  <motion.div 
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 w-8 h-[3px] bg-blue-600 rounded-b-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#2563eb' : '#64748b',
                    y: isActive ? 2 : 0
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <Icon strokeWidth={isActive ? 2.5 : 2} className="w-[22px] h-[22px]" />
                </motion.div>
                <div
                  className={`text-[10px] font-sans tracking-wide font-semibold mt-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
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

