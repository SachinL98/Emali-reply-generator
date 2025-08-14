'use client'
export function Field({ label, children }:{ label: string, children: React.ReactNode }){
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}
