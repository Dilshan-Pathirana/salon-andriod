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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-teal-100 pointer-events-auto pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                onClick={() => onChange(id as PageType)}
                className="flex flex-col items-center justify-center w-16 h-full space-y-1.5 focus:outline-none"
                aria-label={label}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#0d9488' : '#94a3b8',
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <Icon strokeWidth={isActive ? 2 : 1.5} className="w-6 h-6" />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? '#0d9488' : '#94a3b8',
                  }}
                  className="text-[10px] font-inter tracking-widest font-medium"
                >
                  {label}
                </motion.span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

