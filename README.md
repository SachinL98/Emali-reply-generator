# Seamless Source – Smart Reply Drafts

I built a small Next.js app that reads an incoming email/DM and prepares a reply in the voice of the Seamless Source marketing team. It supports **Email**, **LinkedIn**, and **Instagram** channels and is ready to deploy on **Vercel**.

## ✨ Features
- Paste any incoming email/DM and generate a caring, persuasive reply
- One-click Channel toggle (Email / LinkedIn / Instagram)
- Company drawer to save mission, product, value props, links (stored in `localStorage`)
- Sender drawer to capture name, role, company, country (stored in `localStorage`)
- Style & CTA modal to set tone, word count, language, and CTA
- Clean, colorful, modern Tailwind UI with drawers and popups
- Serverless API route `/api/draft` that calls OpenAI
- Returns strict JSON shaped for email or DM

## 🧩 Tech stack
- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI Node SDK
- Vercel serverless functions

## 🔐 Environment
Create `.env.local`:

```
OPENAI_API_KEY=sk-...yourkey...
# optional
OPENAI_MODEL=gpt-4o-mini
APP_BASE_URL=http://localhost:3000
```

## 🚀 Run locally
```bash
npm i
npm run dev
# open http://localhost:3000
```

## ☁️ Deploy to Vercel (A to Z)
1. Push this folder to a new GitHub repo (or import directly in Vercel).
2. Go to Vercel → New Project → Import your repo.
3. In **Environment Variables**, add:
   - `OPENAI_API_KEY` = your key
   - `OPENAI_MODEL` = `gpt-4o-mini` (or your preferred model)
4. Click **Deploy**.
5. After deploy, open the app URL. The drawers let me save company and sender details.

## 🧠 How the prompt works
- System prompt sets the Seamless Source marketing persona and rules.
- User prompt passes channel, incoming message, sender details, style, and CTA.
- API returns JSON:
  - Email → `{ subject, body }`
  - DM → `{ message }`

## 📝 Notes & Tips
- Data I set in drawers is saved in my browser using `localStorage`.
- To support a database, I can later add Vercel KV or Postgres and swap the storage helpers.
- If the model returns non-JSON, the API falls back to a simple object so I still get a draft.

## 📁 Project structure
```
app/
  api/draft/route.ts   # serverless OpenAI call
  layout.tsx
  page.tsx             # main UI with drawers & modal
components/
  Drawer.tsx
  Field.tsx
  Modal.tsx
  Toolbar.tsx
lib/
  prompt.ts            # system & user prompt builders
utils/
  storage.ts           # localStorage helpers
styles via app/globals.css, Tailwind config, etc.
```

## 🔒 Security
- The OpenAI API key only lives on the server (Vercel Function). The browser never sees it.

## 🧪 Test quickly
- Paste any sample email in the left box and hit **Draft Reply**.
- Switch Channel to see Email vs DM output formats.
- Try the **Shorten** and **Make persuasive** quick actions.

---

Enjoy!
