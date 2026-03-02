import React from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 flex items-center justify-between px-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>
      
      <h1 className="font-playfair text-xl text-slate-800 font-semibold tracking-wide absolute left-1/2 transform -translate-x-1/2">
        {title}
      </h1>
      
      <div className="w-10" /> {/* Spacer to balance the menu button */}
    </div>
  )
}
