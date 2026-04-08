import React from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 grid h-16 grid-cols-[44px_1fr_44px] items-center border-b border-emerald-100/70 bg-white/85 px-3 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,108,73,0.04)]">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 flex-shrink-0" />
      </button>

      <h1 className="v2-title truncate px-2 text-center text-[15px] font-bold">
        {title}
      </h1>

      <div />
    </div>
  )
}
