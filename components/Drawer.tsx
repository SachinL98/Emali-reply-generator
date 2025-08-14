'use client'
import { useEffect } from 'react'
import clsx from 'clsx'

export function Drawer({ open, side='right', onClose, title, children }:{ 
  open: boolean, side?: 'left'|'right', onClose: ()=>void, title: string, children: React.ReactNode 
}) {
  useEffect(()=>{
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return ()=> window.removeEventListener('keydown', onEsc)
  }, [onClose])
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}></div>}
      <aside className={clsx(
        "fixed top-0 bottom-0 w-[380px] bg-white z-50 shadow-soft p-5 drawer-enter",
        side === 'right' ? "right-0" : "left-0",
        open ? "translate-x-0" : side === 'right' ? "translate-x-full" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)] pr-2">{children}</div>
      </aside>
    </>
  )
}
