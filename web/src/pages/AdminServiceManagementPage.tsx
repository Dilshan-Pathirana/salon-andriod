import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCreateService,
  adminDeleteService,
  adminGetServices,
  adminUpdateService,
  ManagedService,
} from '../lib/api'

type ServiceCategory = 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM'

const categoryOptions: ServiceCategory[] = ['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM']

const emptyForm = {
  category: 'HAIRCUT' as ServiceCategory,
  name: '',
  duration: 30,
  price: 0,
  description: '',
}

export function AdminServiceManagementPage() {
  const [services, setServices] = useState<ManagedService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const data = await adminGetServices()
      setServices(data)
    } catch {
      setMessage('Unable to load services')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  const handleCreate = async () => {
    setMessage('')
    if (!form.name.trim()) {
      setMessage('Service name is required')
      return
    }

    try {
      const created = await adminCreateService({
        category: form.category,
        name: form.name.trim(),
        duration: Number(form.duration),
        price: Number(form.price),
        description: form.description.trim() || undefined,
      })
      setServices((prev) => [created, ...prev])
      setForm(emptyForm)
      setMessage('Service added')
    } catch {
      setMessage('Failed to add service')
    }
  }

  const handleAutoSave = async (serviceId: string, patch: Partial<ManagedService>) => {
    setMessage('')
    const existing = services.find((item) => item.id === serviceId)
    if (!existing) return

    const optimistic = services.map((item) => (item.id === serviceId ? { ...item, ...patch } : item))
    setServices(optimistic)

    try {
      const updated = await adminUpdateService(serviceId, {
        name: (patch.name ?? existing.name).trim(),
        category: (patch.category ?? existing.category) as ServiceCategory,
        duration: Number(patch.duration ?? existing.duration),
        price: Number(patch.price ?? existing.price),
        description: patch.description ?? existing.description ?? undefined,
        isActive: patch.isActive ?? existing.isActive,
      })
      setServices((prev) => prev.map((item) => (item.id === serviceId ? updated : item)))
      setMessage('Saved')
    } catch {
      setServices((prev) => prev.map((item) => (item.id === serviceId ? existing : item)))
      setMessage('Auto-save failed')
    }
  }

  const handleDelete = async (serviceId: string) => {
    const ok = window.confirm('Delete this service? This action cannot be undone.')
    if (!ok) return

    const previous = services
    setServices((prev) => prev.filter((service) => service.id !== serviceId))

    try {
      await adminDeleteService(serviceId)
      setMessage('Service deleted')
    } catch {
      setServices(previous)
      setMessage('Failed to delete service')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">Service Management</h1>

      <div className="border border-luxury-brown/40 rounded-xl p-4 mb-8 space-y-3 bg-luxury-green/25">
        <p className="font-inter text-xs tracking-widest uppercase text-luxury-muted">Add Service</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ServiceCategory }))}
            className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Service name"
            className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
          />
          <input
            type="number"
            min={5}
            value={form.duration}
            onChange={(event) => setForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
            placeholder="Minutes"
            className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
          />
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
            placeholder="Price"
            className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
          />
        </div>
        <input
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description"
          className="w-full bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
        />
        <button onClick={() => void handleCreate()} className="w-full py-3 bg-luxury-gold text-luxury-black rounded-lg text-xs tracking-widest uppercase font-semibold">
          Add Service
        </button>
      </div>

      {message ? <p className="text-center text-xs text-luxury-champagne mb-4">{message}</p> : null}

      {isLoading ? <p className="text-luxury-muted text-sm">Loading services...</p> : null}

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="border border-luxury-brown/40 rounded-xl p-4 bg-luxury-green/20 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={service.category}
                onChange={(event) => void handleAutoSave(service.id, { category: event.target.value as ServiceCategory })}
                className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-xs text-luxury-white"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                defaultValue={service.name}
                onBlur={(event) => void handleAutoSave(service.id, { name: event.target.value })}
                className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
              />
              <input
                type="number"
                min={5}
                defaultValue={service.duration}
                onBlur={(event) => void handleAutoSave(service.id, { duration: Number(event.target.value) })}
                className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
              />
              <input
                type="number"
                min={0}
                defaultValue={service.price}
                onBlur={(event) => void handleAutoSave(service.id, { price: Number(event.target.value) })}
                className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-luxury-muted flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={service.isActive}
                  onChange={(event) => void handleAutoSave(service.id, { isActive: event.target.checked })}
                />
                Active
              </label>
              <button
                onClick={() => void handleDelete(service.id)}
                className="px-3 py-2 border border-red-400/50 rounded-lg text-xs tracking-widest uppercase text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
