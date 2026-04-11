import React from 'react'
import { X, LogOut, LogIn, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type MenuTab =
  | 'services'
  | 'book'
  | 'work'
  | 'queue'
  | 'appointments'
  | 'profile'
  | 'login'
  | 'home'
  | 'admin-home'
  | 'admin-services'
  | 'admin-session'
  | 'admin-appointments'
  | 'admin-work'
  | 'admin-users'
  | 'admin-queue'

export type MenuItem = {
  id: MenuTab
  label: string
  icon?: React.ElementType
}

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (tab: MenuTab) => void
  items: MenuItem[]
  isLoggedIn: boolean
  onAuthAction: () => void
}

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
}

export function HamburgerMenu({ isOpen, onClose, onSelect, items, isLoggedIn, onAuthAction }: HamburgerMenuProps) {
  const handleSelect = (tab: MenuTab) => {
    onSelect(tab)
    onClose()
  }

  const handleAuthAction = () => {
    onAuthAction()
    onClose()
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-[320px] flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex h-28 items-end justify-between bg-gradient-to-br from-primary to-primary-container px-6 pb-6">
              <div>
                <h2 className="font-headline text-2xl font-black text-on-primary tracking-widest uppercase">RU ZERO</h2>
                <p className="text-sm font-label font-bold text-on-primary/70 mt-1">Navigate your experience</p>
              </div>
              <button
                onClick={onClose}
                className="-mr-2 rounded-xl bg-white/15 p-2 text-on-primary transition-colors hover:bg-white/25"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
              {items.map((item, i) => (
                <motion.button
                  custom={i}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl p-3.5 transition-all hover:bg-surface-container-low active:bg-surface-container"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    {item.icon ? <item.icon className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </div>
                  <span className="flex-1 text-left font-label font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-outline-variant group-hover:text-primary transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-outline-variant/30 bg-surface-container-lowest p-6">
              <button 
                onClick={handleAuthAction}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-label font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              >
                {isLoggedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isLoggedIn ? 'Sign Out' : 'Sign In'}</span>
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

