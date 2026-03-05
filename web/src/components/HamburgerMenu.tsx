import React from 'react'
import { X, ChevronRight, LogOut, Home, Briefcase, Calendar, Image as ImageIcon, User, List } from 'lucide-react'
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
}

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
}

export function HamburgerMenu({ isOpen, onClose, onSelect, items }: HamburgerMenuProps) {
  const handleSelect = (tab: MenuTab) => {
    onSelect(tab)
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
            className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-28 px-6 flex items-end justify-between pb-6 bg-gradient-to-br from-blue-600 to-indigo-700">
              <div>
                <h2 className="font-sans text-2xl font-bold tracking-tight text-white mb-1">Menu</h2>
                <p className="text-blue-100/90 text-sm font-medium">Manage your dashboard</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-blue-100 hover:text-white rounded-xl transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {items.map((item, i) => (
                <motion.button
                  custom={i}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="group w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {item.icon ? <item.icon className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </div>
                  <span className="font-sans font-medium text-slate-700 text-base flex-1 text-left group-hover:text-blue-900 transition-colors">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all transform group-hover:translate-x-1" />
</motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => handleSelect('login')}
                className="flex items-center space-x-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium w-full px-2 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

