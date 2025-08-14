'use client'
import { useEffect } from 'react'

export function Modal({ open, onClose, title, children }:{ 
  open: boolean, onClose: ()=>void, title: string, children: React.ReactNode 
}) {
  useEffect(()=>{
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return ()=> window.removeEventListener('keydown', onEsc)
  }, [onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-soft modal-enter">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}
