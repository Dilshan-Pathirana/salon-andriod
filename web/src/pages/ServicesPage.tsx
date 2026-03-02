import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getServices } from '../lib/api'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6"
    >
      <h1 className="font-playfair text-3xl text-center mb-8">Services</h1>

      {isLoading ? <p className="text-sm text-slate-400">Loading services...</p> : null}

      <div className="space-y-3">
        {rows.map((service) => (
          <div key={service.id} className="border border-teal-100 rounded-xl bg-white p-4 flex justify-between items-start gap-4 shadow-sm">
            <div>
              <p className="text-slate-800 text-base font-medium">{service.name}</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{service.description || 'Premium salon service'}</p>
            </div>
            <p className="font-playfair text-teal-700 text-lg">${service.price}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
