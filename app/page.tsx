'use client'
import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '@/components/Drawer'
import { Modal } from '@/components/Modal'
import { Field } from '@/components/Field'
import { Toolbar } from '@/components/Toolbar'
import { loadJSON, saveJSON } from '@/utils/storage'
import clsx from 'clsx'

type Channel = 'EMAIL'|'LINKEDIN'|'INSTAGRAM'

type Company = {
  name: string
  mission: string
  product: string
  valueProps: string
  links: string
}
type Sender = {
  name: string
  role: string
  company: string
  country: string
}

export default function HomePage(){
  const [channel, setChannel] = useState<Channel>('EMAIL')
  const [incoming, setIncoming] = useState('')
  const [result, setResult] = useState<{subject?:string, body?:string, message?:string}|null>(null)
  const [loading, setLoading] = useState(false)

  const [company, setCompany] = useState<Company>(loadJSON('ss_company', {
    name: 'Seamless Source',
    mission: 'Empower fashion brands and suppliers with transparent, sustainable product data.',
    product: 'Digital Product Passport (DPP) with BOM, traceability, and LCA insights.',
    valueProps: 'Compliance-ready DPPs (EU), faster audits, supplier collaboration, consumer trust, real-time LCA.',
    links: 'https://seamless-source.example'
  }))
  const [sender, setSender] = useState<Sender>(loadJSON('ss_sender', {
    name: '',
    role: '',
    company: '',
    country: ''
  }))

  const [style, setStyle] = useState(loadJSON('ss_style', {
    tone: 'polite, professional, caring, persuasive',
    maxWords: 180,
    language: 'English',
    cta: 'Book a 20-minute demo'
  }))

  const [openCompany, setOpenCompany] = useState(false)
  const [openSender, setOpenSender] = useState(false)
  const [openCta, setOpenCta] = useState(false)

  useEffect(()=> saveJSON('ss_company', company), [company])
  useEffect(()=> saveJSON('ss_sender', sender), [sender])
  useEffect(()=> saveJSON('ss_style', style), [style])

  async function draft(){
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, incoming, sender, company, style })
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed')
      setResult(json.data)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string){
    navigator.clipboard.writeText(text)
  }

  const hasResult = !!result

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="badge">Seamless Source</span>
            <h2 className="text-xl font-semibold">Reply Draft Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={()=> setOpenSender(true)}>Sender</button>
            <button className="btn btn-secondary" onClick={()=> setOpenCompany(true)}>Company</button>
            <button className="btn btn-secondary" onClick={()=> setOpenCta(true)}>CTA</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Channel">
              <div className="flex gap-2">
                {(['EMAIL','LINKEDIN','INSTAGRAM'] as Channel[]).map(c => (
                  <button key={c} onClick={()=> setChannel(c)} className={clsx('btn', channel===c ? 'btn-primary' : 'btn-secondary')}>{c}</button>
                ))}
              </div>
            </Field>
            <div className="mt-3">
              <Field label="Paste the incoming email/DM">
                <textarea className="textarea" placeholder="Paste the sender's message..." value={incoming} onChange={e=> setIncoming(e.target.value)} />
              </Field>
            </div>
            <div className="mt-3">
              <Toolbar>
                <button className="btn btn-primary" onClick={draft} disabled={loading || !incoming.trim()}>
                  {loading ? 'Drafting…' : 'Draft Reply'}
                </button>
                <button className="btn btn-secondary" onClick={()=> setStyle((s:any)=> ({...s, maxWords: 100}))}>Shorten</button>
                <button className="btn btn-secondary" onClick={()=> setStyle((s:any)=> ({...s, tone: 'more persuasive but still kind'}))}>Make persuasive</button>
                <button className="btn btn-secondary" onClick={()=> setStyle((s:any)=> ({...s, language: 'English'}))}>English</button>
              </Toolbar>
            </div>
          </div>

          <div>
            <Field label="Draft Output">
              {channel==='EMAIL' ? (
                <div className="space-y-3">
                  <input className="input" placeholder="Subject will appear here…" value={result?.subject || ''} readOnly/>
                  <textarea className="textarea h-72" placeholder="Body will appear here…" value={result?.body || ''} readOnly/>
                  <div className="toolbar">
                    <button className="btn btn-secondary" onClick={()=> copy(`${result?.subject}\n\n${result?.body}`)} disabled={!hasResult}>Copy Email</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea className="textarea h-80" placeholder="Message will appear here…" value={result?.message || ''} readOnly/>
                  <div className="toolbar">
                    <button className="btn btn-secondary" onClick={()=> copy(result?.message || '')} disabled={!hasResult}>Copy Message</button>
                  </div>
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <Drawer open={openCompany} onClose={()=> setOpenCompany(false)} title="Company Settings">
        <div className="space-y-3">
          <Field label="Company name"><input className="input" value={company.name} onChange={e=> setCompany({...company, name: e.target.value})}/></Field>
          <Field label="Mission"><textarea className="textarea h-28" value={company.mission} onChange={e=> setCompany({...company, mission: e.target.value})}/></Field>
          <Field label="Product"><textarea className="textarea h-24" value={company.product} onChange={e=> setCompany({...company, product: e.target.value})}/></Field>
          <Field label="Key value props (comma separated)"><textarea className="textarea h-24" value={company.valueProps} onChange={e=> setCompany({...company, valueProps: e.target.value})}/></Field>
          <Field label="Links"><input className="input" value={company.links} onChange={e=> setCompany({...company, links: e.target.value})}/></Field>
          <div className="toolbar">
            <button className="btn btn-secondary" onClick={()=> saveJSON('ss_company', company)}>Save</button>
          </div>
        </div>
      </Drawer>

      <Drawer open={openSender} onClose={()=> setOpenSender(false)} title="Sender Details">
        <div className="space-y-3">
          <Field label="Sender name"><input className="input" value={sender.name} onChange={e=> setSender({...sender, name: e.target.value})}/></Field>
          <Field label="Role"><input className="input" value={sender.role} onChange={e=> setSender({...sender, role: e.target.value})}/></Field>
          <Field label="Company"><input className="input" value={sender.company} onChange={e=> setSender({...sender, company: e.target.value})}/></Field>
          <Field label="Country"><input className="input" value={sender.country} onChange={e=> setSender({...sender, country: e.target.value})}/></Field>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-secondary" onClick={()=> { setSender({name:'', role:'', company:'', country:''}); }}>Clear</button>
            <button className="btn btn-secondary" onClick={()=> saveJSON('ss_sender', sender)}>Save</button>
          </div>
        </div>
      </Drawer>

      <Modal open={openCta} onClose={()=> setOpenCta(false)} title="Style & CTA">
        <div className="space-y-3">
          <Field label="Tone"><input className="input" value={style.tone} onChange={e=> setStyle((s:any)=> ({...s, tone: e.target.value}))}/></Field>
          <Field label="Max words"><input className="input" type="number" value={style.maxWords} onChange={e=> setStyle((s:any)=> ({...s, maxWords: Number(e.target.value)}))}/></Field>
          <Field label="Language"><input className="input" value={style.language} onChange={e=> setStyle((s:any)=> ({...s, language: e.target.value}))}/></Field>
          <Field label="CTA"><input className="input" value={style.cta} onChange={e=> setStyle((s:any)=> ({...s, cta: e.target.value}))}/></Field>
          <div className="toolbar">
            <button className="btn btn-secondary" onClick={()=> saveJSON('ss_style', style)}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
