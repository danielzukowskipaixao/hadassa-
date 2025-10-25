import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full bg-pop/20 text-pop px-2 py-0.5 text-xs', className)}>{children}</span>
}
