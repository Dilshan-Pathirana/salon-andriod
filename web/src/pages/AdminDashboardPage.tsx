import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Scissors, CalendarDays, Clock, Activity, CheckCircle2 } from 'lucide-react'
import { adminGetDashboardStats, AdminDashboardStats } from '../lib/api'

function formatDayLabel(isoDay: string): string {
  const date = new Date(isoDay)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setMessage('')
      try {
        const data = await adminGetDashboardStats()
        setStats(data)
      } catch {
        setMessage('Unable to load dashboard metrics')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const trendPoints = useMemo(() => {
    const trend = stats?.userRegistrationTrend || []
    if (trend.length === 0) return ''

    const width = 300
    const height = 120
    const maxCount = Math.max(1, ...trend.map((item) => item.count))

    return trend
      .map((item, index) => {
        const x = (index / Math.max(1, trend.length - 1)) * width
        const y = height - (item.count / maxCount) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [stats])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans font-semibold tracking-tight text-3xl text-slate-900">Dashboard</h1>
        {stats && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      
      {message ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
          <Activity className="w-4 h-4" />
          {message}
        </div>
      ) : null}

      {stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ y: -2 }} className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Users</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.registeredUsers}</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Scissors className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Scissors className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Services</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.activeServices}</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.appointmentsToday}</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Time</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.averageAppointmentTime}<span className="text-lg font-medium text-slate-400 ml-1">m</span></p>
            </motion.div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-slate-900">User Growth Trend</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs text-slate-500 font-medium">New Registrations</span>
              </div>
            </div>
            <div className="relative pt-4">
              <svg viewBox="0 0 300 120" className="w-full h-40 overflow-visible">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {trendPoints && (
                  <path 
                    d={`M0,120 L${trendPoints.split(' ')[0]} L${trendPoints} L300,120 Z`} 
                    fill="url(#lineGradient)" 
                  />
                )}
                <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={trendPoints} />
                {(stats.userRegistrationTrend || []).map((item, index, arr) => {
                  const width = 300
                  const height = 120
                  const maxCount = Math.max(1, ...arr.map((v) => v.count))
                  const x = (index / Math.max(1, arr.length - 1)) * width
                  const y = height - (item.count / maxCount) * height
                  return (
                    <g key={item.day}>
                      <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" className="transition-all hover:r-[6]" />
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-4 border-t border-slate-100 pt-3 px-2">
              {(stats.userRegistrationTrend || []).map((item) => (
                <span key={item.day} className="text-center">{formatDayLabel(item.day)}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-white shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">In Queue</p>
                <p className="text-2xl font-bold text-slate-900">{stats.inQueue}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
