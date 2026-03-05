import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCreateWorkItem,
  adminDeleteWorkItem,
  adminGetWorkItems,
  adminUpdateWorkItem,
  ManagedWorkItem,
} from '../lib/api'

const emptyForm = {
  topic: '',
  description: '',
  beforeImageUrl: '',
  afterImageUrl: '',
}

const MAX_SOURCE_FILE_BYTES = 8 * 1024 * 1024
const MAX_OUTPUT_BYTES = 350 * 1024
const MAX_DIMENSION = 1280

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Invalid image'))
    image.src = dataUrl
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

function estimateDataUrlSizeBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || ''
  return Math.ceil((base64.length * 3) / 4)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function compressImageFile(file: File): Promise<string> {
  if (file.size > MAX_SOURCE_FILE_BYTES) {
    throw new Error(`Image is too large (${formatBytes(file.size)}). Max allowed is ${formatBytes(MAX_SOURCE_FILE_BYTES)}.`)
  }

  const sourceDataUrl = await fileToDataUrl(file)
  const image = await loadImageFromDataUrl(sourceDataUrl)

  const ratio = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * ratio))
  const height = Math.max(1, Math.round(image.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to process image')
  }

  context.drawImage(image, 0, 0, width, height)

  let quality = 0.82
  let output = canvas.toDataURL('image/jpeg', quality)
  let size = estimateDataUrlSizeBytes(output)

  while (size > MAX_OUTPUT_BYTES && quality > 0.45) {
    quality -= 0.07
    output = canvas.toDataURL('image/jpeg', quality)
    size = estimateDataUrlSizeBytes(output)
  }

  if (size > MAX_OUTPUT_BYTES) {
    throw new Error(`Compressed image is still too large (${formatBytes(size)}). Please choose a smaller image.`)
  }

  return output
}

export function AdminWorkManagementPage() {
  const [items, setItems] = useState<ManagedWorkItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    try {
      const rows = await adminGetWorkItems()
      setItems(rows)
    } catch {
      setMessage('Unable to load work items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const add = async () => {
    if (!form.topic.trim() || !form.afterImageUrl.trim()) {
      setMessage('Topic and after image are required')
      return
    }

    try {
      const created = await adminCreateWorkItem(form)
      setItems((prev) => [created, ...prev])
      setForm(emptyForm)
      setMessage('Work item added')
    } catch {
      setMessage('Failed to add work item')
    }
  }

  const save = async (id: string, next: ManagedWorkItem) => {
    try {
      const updated = await adminUpdateWorkItem(id, next)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      setMessage('Saved')
    } catch {
      setMessage('Save failed')
    }
  }

  const onAddImagePicked = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'beforeImageUrl' | 'afterImageUrl',
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await compressImageFile(file)
      setForm((prev) => ({ ...prev, [field]: dataUrl }))
      setMessage(`${field === 'beforeImageUrl' ? 'Before' : 'After'} image selected`)
    } catch (error: any) {
      setMessage(error?.message || 'Failed to load selected image')
    }
  }

  const onEditImagePicked = async (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'beforeImageUrl' | 'afterImageUrl',
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const item = items.find((entry) => entry.id === id)
    if (!item) return

    try {
      const dataUrl = await compressImageFile(file)
      await save(id, { ...item, [field]: dataUrl })
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update image')
    }
  }

  const remove = async (id: string) => {
    const ok = window.confirm('Delete this work item?')
    if (!ok) return

    const previous = items
    setItems((prev) => prev.filter((item) => item.id !== id))

    try {
      await adminDeleteWorkItem(id)
      setMessage('Deleted')
    } catch {
      setItems(previous)
      setMessage('Delete failed')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-sans font-semibold tracking-tight text-3xl text-slate-900 text-center mb-8">Work Management</h1>

      <div className="border border-slate-200 rounded-xl p-4 mb-8 bg-white shadow-sm space-y-3">
        <p className="text-xs tracking-widest uppercase text-slate-500">Add Work</p>
        <input value={form.topic} onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))} placeholder="Topic" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900" />
        <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm min-h-20 text-slate-900" />
        <label className="block border border-slate-200 rounded-lg p-3 text-sm text-slate-500 cursor-pointer">
          Before image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void onAddImagePicked(event, 'beforeImageUrl')}
            className="block mt-2 text-xs"
          />
        </label>
        <label className="block border border-slate-200 rounded-lg p-3 text-sm text-slate-500 cursor-pointer">
          After image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void onAddImagePicked(event, 'afterImageUrl')}
            className="block mt-2 text-xs"
          />
        </label>
        {form.beforeImageUrl ? <img src={form.beforeImageUrl} alt="Before preview" className="w-full h-28 object-cover rounded-lg border border-slate-200" /> : null}
        {form.afterImageUrl ? <img src={form.afterImageUrl} alt="After preview" className="w-full h-28 object-cover rounded-lg border border-slate-200" /> : null}
        <button onClick={() => void add()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors text-white rounded-lg text-xs tracking-widest uppercase font-semibold">Add Work</button>
      </div>

      {message ? <p className="text-xs text-blue-600 mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500 mb-4">Loading work items...</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm space-y-3">
            <input
              defaultValue={item.topic}
              onBlur={(event) => void save(item.id, { ...item, topic: event.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-900"
            />
            <textarea
              defaultValue={item.description}
              onBlur={(event) => void save(item.id, { ...item, description: event.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm min-h-20 text-slate-900"
            />
            <div className="grid grid-cols-2 gap-2">
              {item.beforeImageUrl ? <img src={item.beforeImageUrl} alt="Before" className="w-full h-24 object-cover rounded-md border border-slate-200" /> : <div className="h-24 rounded-md border border-slate-200 flex items-center justify-center text-xs text-slate-500">No before image</div>}
              {item.afterImageUrl ? <img src={item.afterImageUrl} alt="After" className="w-full h-24 object-cover rounded-md border border-slate-200" /> : <div className="h-24 rounded-md border border-slate-200 flex items-center justify-center text-xs text-slate-500">No after image</div>}
            </div>
            <label className="block border border-slate-200 rounded-lg p-2 text-xs text-slate-500 cursor-pointer">
              Replace before image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void onEditImagePicked(item.id, event, 'beforeImageUrl')}
                className="block mt-2 text-xs"
              />
            </label>
            <label className="block border border-slate-200 rounded-lg p-2 text-xs text-slate-500 cursor-pointer">
              Replace after image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void onEditImagePicked(item.id, event, 'afterImageUrl')}
                className="block mt-2 text-xs"
              />
            </label>
            <button onClick={() => void remove(item.id)} className="px-3 py-2 border border-red-400/50 rounded-lg text-xs tracking-widest uppercase text-red-300">
              Delete
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
