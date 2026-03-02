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
            <div className="h-24 px-6 flex items-end justify-between pb-6 bg-gradient-to-br from-teal-500 to-emerald-600">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-white tracking-wide">Menu</h2>
                <p className="text-teal-100 text-xs mt-1 font-inter opacity-90">Manage your salon experience</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 text-teal-100 hover:text-white rounded-full transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {items.map((item, i) => (
                <motion.button
                  custom={i}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="group w-full flex items-center justify-between p-4 rounded-xl hover:bg-teal-50 active:bg-teal-100 transition-all duration-200 border border-transparent hover:border-teal-100"
                >
                  <span className="font-inter text-slate-700 font-medium text-lg group-hover:text-teal-800 transition-colors">
                    {item.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors transform group-hover:translate-x-1" />
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

