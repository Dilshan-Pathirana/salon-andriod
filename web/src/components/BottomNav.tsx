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
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-teal-100/80 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                onClick={() => onChange(id as PageType)}
                className="flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 focus:outline-none"
                aria-label={label}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#0f766e' : '#94a3b8',
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <Icon strokeWidth={isActive ? 2 : 1.75} className="w-5 h-5" />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? '#0f766e' : '#94a3b8',
                  }}
                  className="text-[10px] font-inter tracking-wide font-semibold"
                >
                  {label}
                </motion.span>
              </button>
            )
          })}
      </div>
    </div>
  )
}

