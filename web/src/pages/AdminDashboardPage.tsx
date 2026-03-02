import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">Admin Dashboard</h1>

      {isLoading ? <p className="text-sm text-luxury-muted">Loading dashboard...</p> : null}
      {message ? <p className="text-sm text-luxury-champagne">{message}</p> : null}

      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/25">
              <p className="text-xs tracking-widest uppercase text-luxury-muted">Registered Users</p>
              <p className="text-3xl font-playfair text-luxury-white mt-2">{stats.registeredUsers}</p>
            </div>
            <div className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/25">
              <p className="text-xs tracking-widest uppercase text-luxury-muted">Active Services</p>
              <p className="text-3xl font-playfair text-luxury-white mt-2">{stats.activeServices}</p>
            </div>
            <div className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/25">
              <p className="text-xs tracking-widest uppercase text-luxury-muted">Appointments Today</p>
              <p className="text-3xl font-playfair text-luxury-white mt-2">{stats.appointmentsToday}</p>
            </div>
            <div className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/25">
              <p className="text-xs tracking-widest uppercase text-luxury-muted">Average Appointment Time</p>
              <p className="text-3xl font-playfair text-luxury-white mt-2">{stats.averageAppointmentTime} min</p>
            </div>
          </div>

          <div className="border border-luxury-brown/40 rounded-xl p-4 bg-luxury-green/20 mb-8">
            <p className="text-xs tracking-widest uppercase text-luxury-muted mb-3">User Registration Trend</p>
            <svg viewBox="0 0 300 120" className="w-full h-36">
              <polyline fill="none" stroke="rgba(194,173,144,1)" strokeWidth="3" points={trendPoints} />
              {(stats.userRegistrationTrend || []).map((item, index, arr) => {
                const width = 300
                const height = 120
                const maxCount = Math.max(1, ...arr.map((v) => v.count))
                const x = (index / Math.max(1, arr.length - 1)) * width
                const y = height - (item.count / maxCount) * height
                return <circle key={item.day} cx={x} cy={y} r="3.5" fill="rgba(194,173,144,1)" />
              })}
            </svg>
            <div className="grid grid-cols-7 text-[10px] text-luxury-muted mt-2">
              {(stats.userRegistrationTrend || []).map((item) => (
                <span key={item.day} className="text-center">{formatDayLabel(item.day)}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-luxury-brown/40 rounded-lg p-3 bg-luxury-green/20">
              <p className="text-xs text-luxury-muted">In Queue</p>
              <p className="text-xl font-playfair text-luxury-champagne">{stats.inQueue}</p>
            </div>
            <div className="border border-luxury-brown/40 rounded-lg p-3 bg-luxury-green/20">
              <p className="text-xs text-luxury-muted">Completed</p>
              <p className="text-xl font-playfair text-luxury-champagne">{stats.completed}</p>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  )
}
