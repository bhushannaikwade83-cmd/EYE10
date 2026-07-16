import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import b2StorageHandler from './api/b2-storage.js'
import sendCouponEmailHandler from './api/send-coupon-email.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const indexHtmlPath = path.join(distDir, 'index.html')

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', true)

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.all(
  '/api/send-coupon-email',
  express.json({ limit: '1mb' }),
  async (req, res, next) => {
    try {
      await sendCouponEmailHandler(req, res)
    } catch (error) {
      next(error)
    }
  }
)

function b2BodyParser(req, res, next) {
  const action = String(req.query?.action || '').trim()
  if (req.method === 'POST' && action === 'uploadFile') {
    return express.raw({ type: '*/*', limit: '50mb' })(req, res, next)
  }
  if (req.method === 'POST') {
    return express.json({ limit: '2mb' })(req, res, next)
  }
  return next()
}

app.all('/api/b2-storage', b2BodyParser, async (req, res, next) => {
  try {
    await b2StorageHandler(req, res)
  } catch (error) {
    next(error)
  }
})

if (fs.existsSync(distDir)) {
  app.use(
    express.static(distDir, {
      index: false,
      extensions: ['html'],
      maxAge: '1h',
      redirect: false,
    })
  )
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }
  if (!fs.existsSync(indexHtmlPath)) {
    res.status(503).send('Frontend build not found. Run `npm run build` first.')
    return
  }
  res.sendFile(indexHtmlPath)
})

app.use((error, _req, res, _next) => {
  console.error('[elga-server]', error)
  if (res.headersSent) return
  res.status(500).json({ error: error?.message || 'Server error' })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`EYE10 server running on port ${port}`)
})

export default app
