import React, { useEffect, useState } from 'react'
import { Download, Smartphone } from 'lucide-react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as InstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setMessage('App installed. Open it from your home screen.')
      }
      return
    }

    setMessage('Use browser menu: Install app or Add to home screen.')
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-900/30 transition hover:bg-emerald-500"
        aria-label="Install this app"
      >
        <Smartphone className="h-4 w-4" />
        <span>Install App</span>
        <Download className="h-4 w-4" />
      </button>

      {message ? (
        <div className="fixed bottom-40 right-4 z-50 max-w-[240px] rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
          {message}
        </div>
      ) : null}
    </>
  )
}
