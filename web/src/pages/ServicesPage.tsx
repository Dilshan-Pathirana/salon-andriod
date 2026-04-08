import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getServices } from '../lib/api'
import { pageMotionProps } from '../lib/motion'

type ServiceRow = {
  id: string
  name: string
  description?: string
  price: number
  isActive: boolean
}

export function ServicesPage() {
  const [rows, setRows] = useState<ServiceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      try {
        const data = await getServices()
        setRows(
          data
            .filter((item: any) => item.isActive)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: Number(item.price),
              isActive: item.isActive,
            })),
        )
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <motion.div {...pageMotionProps} className="px-4 py-6">
      <h1 className="v2-title mb-8 text-center text-3xl">Services</h1>

      {isLoading ? <p className="text-sm text-slate-500">Loading services...</p> : null}

      <div className="space-y-3">
        {rows.map((service) => (
          <div key={service.id} className="v2-card flex items-start justify-between gap-4 p-4">
            <div>
              <p className="text-base font-bold text-slate-800">{service.name}</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{service.description || 'Premium salon service'}</p>
            </div>
            <p className="v2-title text-lg font-bold text-emerald-700">${service.price}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
