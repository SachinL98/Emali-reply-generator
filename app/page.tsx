'use client'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

// --- Type declaration for the dynamically loaded 'marked' library ---
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
  }
}

// --- Mock Component and Utility Functions to make the code self-contained ---
const loadJSON = (key: string, defaultValue: any) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error("Failed to load from localStorage", e);
    return defaultValue;
  }
};

const saveJSON = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-800">
    {label}
    <div className="mt-1">
      {children}
    </div>
  </label>
);

const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {children}
  </div>
);

const Drawer = ({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <div className={clsx("fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full", !open && "pointer-events-none")}>
    <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={onClose}></div>
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Modal = ({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <div className={clsx("fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transform transition-opacity duration-300 ease-in-out", open ? "opacity-100" : "opacity-0 pointer-events-none")}>
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative transform scale-100 transition-transform duration-300 ease-in-out">
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

// --- End of Mock Components ---

// Define the types for the data
type Channel = 'EMAIL' | 'LINKEDIN' | 'INSTAGRAM'
type Sentiment = 'POSITIVE' | 'NEGATIVE'
type Mode = 'Personal' | 'Company 1' | 'Company 2'

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

type Style = {
  tone: string,
  maxWords: number,
  language: string,
  cta: string
}

type ModeData = {
  company: Company,
  sender: Sender,
  style: Style
}

const initialModes: Record<Mode, ModeData> = {
  'Personal': {
    company: { name: '', mission: '', product: '', valueProps: '', links: '' },
    sender: { name: '', role: '', company: '', country: '' },
    style: { tone: 'friendly, casual', maxWords: 100, language: 'English', cta: 'reply with a question' }
  },
  'Company 1': {
    company: {
      name: 'Seamless Source',
      mission: 'Empower fashion brands and suppliers with transparent, sustainable product data.',
      product: 'Digital Product Passport (DPP) with BOM, traceability, and LCA insights.',
      valueProps: 'Compliance-ready DPPs (EU), faster audits, supplier collaboration, consumer trust, real-time LCA.',
      links: 'https://seamless-source.example'
    },
    sender: { name: 'John Doe', role: 'Sales Rep', company: 'Seamless Source', country: 'USA' },
    style: { tone: 'polite, professional, caring, persuasive', maxWords: 180, language: 'English', cta: 'Book a 20-minute demo' }
  },
  'Company 2': {
    company: { name: '', mission: '', product: '', valueProps: '', links: '' },
    sender: { name: '', role: '', company: '', country: '' },
    style: { tone: 'formal, direct', maxWords: 200, language: 'English', cta: 'Schedule a call' }
  },
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('Personal');
  const [channel, setChannel] = useState<Channel>('EMAIL')
  const [sentiment, setSentiment] = useState<Sentiment>('POSITIVE')
  const [incoming, setIncoming] = useState('')
  const [result, setResult] = useState<{ subject?: string, body?: string, message?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [isMarkedLoaded, setIsMarkedLoaded] = useState(false);

  const [modesData, setModesData] = useState<Record<Mode, ModeData>>(loadJSON('app_modes_data', initialModes));

  const currentModeData = modesData[mode];
  const setModeData = (data: Partial<ModeData>) => {
    setModesData(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        ...data,
      }
    }));
  };

  useEffect(() => saveJSON('app_modes_data', modesData), [modesData])

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = () => setIsMarkedLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function draft() {
    if (!incoming.trim()) {
      setError("Please paste an incoming message to draft a reply.");
      return;
    }

    setLoading(true)
    setResult(null)
    setError(null);
    let retries = 0;
    const maxRetries = 5;
    const initialDelay = 1000;

    while (retries < maxRetries) {
      try {
        const prompt = `
          You are a professional draft assistant for a professional person.
          Your task is to draft a proper context matching and professional reply based on an incoming message.

          Your company details:
          Company name: ${currentModeData.company.name}
          Mission: ${currentModeData.company.mission}
          Product: ${currentModeData.company.product}
          Value Propositions: ${currentModeData.company.valueProps}
          Company Links: ${currentModeData.company.links}

          Your details:
          Name: ${currentModeData.sender.name}
          Role: ${currentModeData.sender.role}
          Company: ${currentModeData.sender.company}
          Country: ${currentModeData.sender.country}

          Style and formatting preferences:
          Channel: ${channel}
          Tone: ${currentModeData.style.tone}
          Max Words: ${currentModeData.style.maxWords}
          Language: ${currentModeData.style.language}
          Call to Action (CTA): ${currentModeData.style.cta}

          Reply sentiment: ${sentiment}. If it's a negative reply, it must be calm, reasonable, and professional. Do not use any aggressive language.

          Incoming Message:
          "${incoming}"

          Draft the reply now.
        `;

        const responseSchema = channel === 'EMAIL' ? {
          type: "object",
          properties: {
            subject: { type: "string", description: "The subject line of the email." },
            body: { type: "string", description: "The body of the email, formatted with markdown for readability." }
          },
          required: ["subject", "body"]
        } : {
          type: "object",
          properties: {
            message: { type: "string", description: "The body of the message, formatted with markdown for readability." }
          },
          required: ["message"]
        };

        const payload = {
          model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: "system",
              content: `You are a professional assistant. The user will provide a prompt and you must return a JSON object that adheres to the following JSON schema: ${JSON.stringify(responseSchema)}`
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          response_format: {
            type: "json_object"
          }
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const text = json?.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error("API response was empty.");
        }

        const parsedJson = JSON.parse(text);

        if (channel === 'EMAIL') {
          setResult({
            subject: parsedJson.subject,
            body: parsedJson.body
          });
        } else {
          setResult({
            message: parsedJson.message
          });
        }

        break;

      } catch (e: any) {
        if (retries < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          setError(`Failed to draft reply: ${e.message}`);
          break;
        }
      } finally {
        setLoading(false);
      }
    }
  }

  function copy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Failed to copy text', err);
    }
    document.body.removeChild(textarea);
  }

  const hasResult = !!result

  // Modals and Drawers state
  const [openCompany, setOpenCompany] = useState(false);
  const [openSender, setOpenSender] = useState(false);
  const [openStyle, setOpenStyle] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-8 font-sans bg-gray-100 min-h-screen">
      <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 transform transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md animate-pulse">Pro</span>
            <h1 className="text-3xl font-extrabold text-gray-900">Reply Draft Assistant</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['Personal', 'Company 1', 'Company 2'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  'btn px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md',
                  mode === m ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex flex-wrap gap-4">
              <Field label="Channel">
                <div className="flex gap-2">
                  {(['EMAIL', 'LINKEDIN', 'INSTAGRAM'] as Channel[]).map(c => (
                    <button key={c} onClick={() => setChannel(c)} className={clsx('btn px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm', channel === c ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>{c}</button>
                  ))}
                </div>
              </Field>
              <Field label="Reply Sentiment">
                <div className="flex gap-2">
                  {(['POSITIVE', 'NEGATIVE'] as Sentiment[]).map(s => (
                    <button key={s} onClick={() => setSentiment(s)} className={clsx('btn px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm', sentiment === s ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Paste the incoming email/DM">
                <textarea className="w-full h-48 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-gray-50" placeholder="Paste the sender's message..." value={incoming} onChange={e => setIncoming(e.target.value)} />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 items-end">
              <button className="btn bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-200" onClick={draft} disabled={loading || !incoming.trim()}>
                {loading ? 'Drafting…' : 'Draft Reply'}
              </button>
              <div className="flex-grow">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium shadow-sm" onClick={() => { setModeData({ ...currentModeData, style: { ...currentModeData.style, maxWords: 100 } }); draft(); }}>Shorten</button>
                  <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium shadow-sm" onClick={() => { setModeData({ ...currentModeData, style: { ...currentModeData.style, tone: 'more persuasive but still kind' } }); draft(); }}>Make persuasive</button>
                  <div className="relative">
                    <select
                      className="w-full h-full p-2.5 rounded-xl border border-gray-300 bg-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      value={currentModeData.style.language}
                      onChange={e => { setModeData({ ...currentModeData, style: { ...currentModeData.style, language: e.target.value } }); draft(); }}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 px-4 py-2 rounded-xl font-medium" onClick={() => { setOpenSender(true) }}>Sender Details</button>
              <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 px-4 py-2 rounded-xl font-medium" onClick={() => { setOpenCompany(true) }}>Company Details</button>
              <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 px-4 py-2 rounded-xl font-medium" onClick={() => { setOpenStyle(true) }}>Style & CTA</button>
            </div>
          </div>

          <div>
            <Field label="Draft Output">
              {channel === 'EMAIL' ? (
                <div className="space-y-4">
                  <input className="w-full p-4 rounded-xl border border-gray-300 bg-gray-100 font-medium text-gray-800" placeholder="Subject will appear here…" value={result?.subject || ''} readOnly />
                  <div
                    className="w-full h-72 p-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 whitespace-pre-wrap overflow-y-auto prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: result?.body && isMarkedLoaded ? window.marked.parse(result.body) : '' }}
                  />
                  <div className="toolbar">
                    <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium shadow-sm" onClick={() => copy(`${result?.subject}\n\n${result?.body}`)} disabled={!hasResult}>Copy Email</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="w-full h-80 p-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 whitespace-pre-wrap overflow-y-auto prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: result?.message && isMarkedLoaded ? window.marked.parse(result.message) : '' }}
                  />
                  <div className="toolbar">
                    <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium shadow-sm" onClick={() => copy(result?.message || '')} disabled={!hasResult}>Copy Message</button>
                  </div>
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl shadow-sm border border-red-200 mt-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Configuration Drawers */}
      <Drawer open={openCompany} onClose={() => setOpenCompany(false)} title={`Company Details for ${mode}`}>
        <div className="space-y-3">
          <Field label="Company name"><input className="w-full input" value={currentModeData.company.name} onChange={e => setModeData({ company: { ...currentModeData.company, name: e.target.value } })} /></Field>
          <Field label="Mission"><textarea className="w-full textarea h-28" value={currentModeData.company.mission} onChange={e => setModeData({ company: { ...currentModeData.company, mission: e.target.value } })} /></Field>
          <Field label="Product"><textarea className="w-full textarea h-24" value={currentModeData.company.product} onChange={e => setModeData({ company: { ...currentModeData.company, product: e.target.value } })} /></Field>
          <Field label="Key value props (comma separated)"><textarea className="w-full textarea h-24" value={currentModeData.company.valueProps} onChange={e => setModeData({ company: { ...currentModeData.company, valueProps: e.target.value } })} /></Field>
          <Field label="Links"><input className="w-full input" value={currentModeData.company.links} onChange={e => setModeData({ company: { ...currentModeData.company, links: e.target.value } })} /></Field>
          <div className="toolbar">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium" onClick={() => setOpenCompany(false)}>Save & Close</button>
          </div>
        </div>
      </Drawer>

      <Drawer open={openSender} onClose={() => setOpenSender(false)} title={`Sender Details for ${mode}`}>
        <div className="space-y-3">
          <Field label="Sender name"><input className="w-full input" value={currentModeData.sender.name} onChange={e => setModeData({ sender: { ...currentModeData.sender, name: e.target.value } })} /></Field>
          <Field label="Role"><input className="w-full input" value={currentModeData.sender.role} onChange={e => setModeData({ sender: { ...currentModeData.sender, role: e.target.value } })} /></Field>
          <Field label="Company"><input className="w-full input" value={currentModeData.sender.company} onChange={e => setModeData({ sender: { ...currentModeData.sender, company: e.target.value } })} /></Field>
          <Field label="Country"><input className="w-full input" value={currentModeData.sender.country} onChange={e => setModeData({ sender: { ...currentModeData.sender, country: e.target.value } })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium" onClick={() => setModeData({ sender: { name: '', role: '', company: '', country: '' } })}>Clear</button>
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium" onClick={() => setOpenSender(false)}>Save & Close</button>
          </div>
        </div>
      </Drawer>

      <Modal open={openStyle} onClose={() => setOpenStyle(false)} title={`Style & CTA for ${mode}`}>
        <div className="space-y-3">
          <Field label="Tone"><input className="w-full input" value={currentModeData.style.tone} onChange={e => setModeData({ style: { ...currentModeData.style, tone: e.target.value } })} /></Field>
          <Field label="Max words"><input className="w-full input" type="number" value={currentModeData.style.maxWords} onChange={e => setModeData({ style: { ...currentModeData.style, maxWords: Number(e.target.value) } })} /></Field>
          <Field label="Language"><input className="w-full input" value={currentModeData.style.language} onChange={e => setModeData({ style: { ...currentModeData.style, language: e.target.value } })} /></Field>
          <Field label="CTA"><input className="w-full input" value={currentModeData.style.cta} onChange={e => setModeData({ style: { ...currentModeData.style, cta: e.target.value } })} /></Field>
          <div className="toolbar">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium" onClick={() => setOpenStyle(false)}>Save & Close</button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
