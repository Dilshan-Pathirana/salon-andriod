import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getStories } from '../lib/api'

type WorkTile = {
  id: string
  title: string
  imageUrl: string
  caption?: string
}

export function WorkPage() {
  const [tiles, setTiles] = useState<WorkTile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      try {
        const data = await getStories()
        setTiles(
          data.map((item: any) => ({
            id: item.id,
            title: item.title || 'Our Work',
            imageUrl: item.imageUrl || item.afterImageUrl || item.afterImage || '',
            caption: item.caption || item.description || '',
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
      className="px-6 pt-12 pb-28"
    >
      <h1 className="font-sans font-semibold tracking-tight text-3xl text-center mb-8">Our Work</h1>

      {isLoading ? <p className="text-sm text-slate-400">Loading gallery...</p> : null}

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.id} className="border border-teal-100/40 rounded-lg overflow-hidden bg-white/40">
            {tile.imageUrl ? (
              <img src={tile.imageUrl} alt={tile.title} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 flex items-center justify-center text-xs text-slate-400">No image</div>
            )}
            <div className="p-3">
              <p className="text-sm text-slate-800">{tile.title}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tile.caption || 'Crafted by our salon team'}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
