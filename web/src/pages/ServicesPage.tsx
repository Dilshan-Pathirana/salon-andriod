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

const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80',
]

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
    <motion.div {...pageMotionProps} className="pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <p className="ds-overline text-primary mb-2">Our Offerings</p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Services<br />Menu
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="px-6 space-y-4">
          {rows.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,108,73,0.04)] flex"
            >
              <div className="relative w-28 flex-shrink-0">
                <img
                  src={SERVICE_IMAGES[idx % SERVICE_IMAGES.length]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-headline font-bold text-emerald-900 text-base">{service.name}</h3>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed line-clamp-2">
                    {service.description || 'Premium salon service'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-headline font-bold text-primary">
                    Rs. {service.price.toLocaleString()}
                  </span>
                  <span className="bg-primary-container/15 text-primary px-3 py-1 rounded-full font-label font-bold text-xs">
                    Book
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
