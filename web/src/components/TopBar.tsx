import React from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl grid grid-cols-[44px_1fr_44px] items-center px-3 shadow-sm">
      <button
        onClick={onMenuClick}
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 flex-shrink-0" />
      </button>

      <h1 className="font-sans text-[15px] text-slate-900 font-semibold tracking-tight text-center truncate px-2">
        {title}
      </h1>

      <div />
    </div>
  )
}
