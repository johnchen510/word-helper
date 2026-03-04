# 🗣️ Word Helper — Deploy to Vercel

A kids' word pronunciation app powered by Claude AI + ElevenLabs voice.

---

## 🚀 How to Deploy (Step by Step)

### Step 1 — Put the code on GitHub

1. Go to **github.com** and sign in (or create a free account)
2. Click the **+** button (top right) → **New repository**
3. Name it `word-helper`, keep it **Public**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Upload ALL the files from this folder (keeping the folder structure):
   - `api/pronounce.js`
   - `src/App.js`
   - `src/index.js`
   - `public/index.html`
   - `package.json`
6. Click **Commit changes**

---

### Step 2 — Deploy on Vercel

1. Go to **vercel.com** → click **Sign up with GitHub** → Authorize
2. Click **Add New Project**
3. Find your `word-helper` repo → click **Import**
4. Under **Framework Preset** select **Create React App**
5. Click **Environment Variables** and add these two:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | your Anthropic API key |
   | `REACT_APP_ELEVEN_API_KEY` | your ElevenLabs API key |

6. Click **Deploy** — wait about 60 seconds ⏳
7. 🎉 You'll get a live link like `https://word-helper-abc123.vercel.app`

---

### Step 3 — Share with your nephew!

Just send him the link — works on any phone, tablet, or computer. No app install needed!

---

## 🔑 Where to find your API keys

- **Anthropic**: console.anthropic.com → API Keys
- **ElevenLabs**: elevenlabs.io → Profile → API Keys

---

## 🔒 Security note
Never share your API keys publicly. On Vercel they are stored securely as environment variables and never exposed to the browser.
