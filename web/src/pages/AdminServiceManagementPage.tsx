import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCreateService,
  adminDeleteService,
  adminGetServices,
  adminUpdateService,
  ManagedService,
} from '../lib/api'
import { pageMotionProps } from '../lib/motion'

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
    <motion.div {...pageMotionProps} className="px-6 pt-8 pb-24">
      <div className="mb-8">
        <p className="ds-overline text-primary mb-1">Admin</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Services</h1>
      </div>

      <div className="v2-card mb-8 v2-admin-stack p-4">
        <p className="v2-label">Add Service</p>
        <div className="v2-admin-grid">
          <select
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ServiceCategory }))}
            className="v2-input"
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
            className="v2-input"
          />
          <input
            type="number"
            min={5}
            value={form.duration}
            onChange={(event) => setForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
            placeholder="Minutes"
            className="v2-input"
          />
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
            placeholder="Price"
            className="v2-input"
          />
        </div>
        <input
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description"
          className="v2-input"
        />
        <button onClick={() => void handleCreate()} className="v2-btn-primary">
          Add Service
        </button>
      </div>

      {message ? <p className="text-center text-xs text-blue-600 dark:text-blue-300 mb-4">{message}</p> : null}

      {isLoading ? <p className="text-slate-500 dark:text-emerald-100/70 text-sm">Loading services...</p> : null}

      <div className="v2-admin-stack">
        {services.map((service) => (
          <div key={service.id} className="v2-card v2-admin-stack rounded-2xl p-4">
            <div className="v2-admin-grid">
              <select
                value={service.category}
                onChange={(event) => void handleAutoSave(service.id, { category: event.target.value as ServiceCategory })}
                className="v2-input !p-2 text-xs"
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
                className="v2-input !p-2"
              />
              <input
                type="number"
                min={5}
                defaultValue={service.duration}
                onBlur={(event) => void handleAutoSave(service.id, { duration: Number(event.target.value) })}
                className="v2-input !p-2"
              />
              <input
                type="number"
                min={0}
                defaultValue={service.price}
                onBlur={(event) => void handleAutoSave(service.id, { price: Number(event.target.value) })}
                className="v2-input !p-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-500 dark:text-emerald-100/70 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={service.isActive}
                  onChange={(event) => void handleAutoSave(service.id, { isActive: event.target.checked })}
                />
                Active
              </label>
              <button
                onClick={() => void handleDelete(service.id)}
                className="rounded-xl border border-red-300 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500"
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
