import React from 'react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title: _title, onMenuClick }: TopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,108,73,0.04)] flex items-center justify-between px-6 h-16">
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onMenuClick}
          whileTap={{ scale: 0.9 }}
          className="text-primary active:scale-90 transition-transform"
          aria-label="Open menu"
        >
          {/* hamburger icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </motion.button>
        <span className="font-headline font-black text-emerald-900 tracking-widest text-xl uppercase">
          Salon Ru Zero One
        </span>
      </div>
    </header>
  )
}
