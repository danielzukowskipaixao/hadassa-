import * as React from 'react'
import { cn } from '@/lib/utils'

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className={cn('relative w-full max-w-lg m-4 rounded-2xl border border-white/25 bg-white/15 p-4')}>{children}</div>
    </div>
  )
}
