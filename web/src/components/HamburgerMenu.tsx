import React from 'react'
import { X, ChevronRight, LogOut, LogIn, List } from 'lucide-react'
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
            <div className="flex h-28 items-end justify-between bg-gradient-to-br from-[#006c49] to-[#10b981] px-6 pb-6">
              <div>
                <h2 className="v2-title mb-1 text-2xl text-white">Menu</h2>
                <p className="text-sm font-semibold text-emerald-50/90">Navigate your experience</p>
              </div>
              <button
                onClick={onClose}
                className="-mr-2 rounded-xl bg-white/15 p-2 text-emerald-50 transition-colors hover:bg-white/25 hover:text-white"
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
                  className="group flex w-full items-center gap-3 rounded-xl p-3.5 transition-all duration-200 hover:bg-emerald-50 active:bg-emerald-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                    {item.icon ? <item.icon className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </div>
                  <span className="flex-1 text-left text-base font-semibold text-slate-700 transition-colors group-hover:text-emerald-900">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 transform text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-600" />
</motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 p-6">
              <button 
                onClick={handleAuthAction}
                className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                {isLoggedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isLoggedIn ? 'Log Out' : 'Log In'}</span>
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

