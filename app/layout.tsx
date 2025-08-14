import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seamless Source – Smart Reply Drafts',
  description: 'Draft polished replies for Email, LinkedIn, and Instagram using OpenAI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="glass sticky top-0 z-30 border-b border-brand-100/60">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">SS</div>
              <div>
                <div className="text-sm text-gray-500">Seamless Source</div>
                <h1 className="font-semibold leading-tight">Smart Reply Drafts</h1>
              </div>
            </div>
            <a href="https://vercel.com/new" target="_blank" className="btn btn-secondary">Deploy</a>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500">
          Built for quick, caring, and persuasive outreach.
        </footer>
      </body>
    </html>
  )
}
