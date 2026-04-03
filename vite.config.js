import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

export default defineConfig(({ mode }) => {
  /**
   * Browser code only sees `import.meta.env.VITE_*` unless we inject here.
   * Vercel often sets `SUPABASE_URL` + `SUPABASE_ANON_KEY` (no VITE_ prefix) — map those into the client bundle at build time.
   * Never inject service_role or other secrets.
   */
  const envAll = loadEnv(mode, process.cwd(), '')
  const supabasePublicUrl = String(
    envAll.VITE_SUPABASE_URL ||
      envAll.SUPABASE_URL ||
      envAll.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ''
  ).trim()
  const supabasePublicAnon = String(
    envAll.VITE_SUPABASE_ANON_KEY ||
      envAll.SUPABASE_ANON_KEY ||
      envAll.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
  ).trim()

  const readDotEnvValue = (key) => {
    try {
      const raw = fs.readFileSync('.env', 'utf8')
      const re = new RegExp(`^${key}=(.*)$`, 'm')
      const match = raw.match(re)
      if (!match) return ''
      return String(match[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
    } catch {
      return ''
    }
  }

  const resolveServerEnvValue = (env, key) => {
    // In dev, prioritize .env file values over process.env snapshot values
    // so edits immediately replace stale values used by local API handlers.
    const fromDotEnv = readDotEnvValue(key)
    if (fromDotEnv) return fromDotEnv
    const fromLoadEnv = String(env[key] ?? '').trim()
    if (fromLoadEnv) return fromLoadEnv
    return ''
  }

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabasePublicUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabasePublicAnon),
    },
    plugins: [
      react(),
      {
        name: 'send-coupon-email-dev-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url?.split('?')[0] || ''
            if (url !== '/api/send-coupon-email') {
              return next()
            }

            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              res.end()
              return
            }

            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            // Merge VITE_* (includes VITE_EMAILJS_*) with EMAILJS_* from all .env* files — avoid loadEnv(..., '').
            const env = {
              ...loadEnv(mode, process.cwd(), 'VITE_'),
              ...loadEnv(mode, process.cwd(), 'EMAILJS_'),
            }
            const keys = [
              'EMAILJS_PUBLIC_KEY',
              'EMAILJS_PRIVATE_KEY',
              'EMAILJS_SERVICE_ID',
              'EMAILJS_TEMPLATE_ID',
              'EMAILJS_SUBJECT_PREFIX',
              'VITE_EMAILJS_PUBLIC_KEY',
              'VITE_EMAILJS_PRIVATE_KEY',
              'VITE_EMAILJS_SERVICE_ID',
              'VITE_EMAILJS_TEMPLATE_ID',
              'VITE_EMAILJS_SUBJECT_PREFIX',
            ]
            for (const k of keys) {
              process.env[k] = resolveServerEnvValue(env, k)
            }

            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const raw = Buffer.concat(chunks).toString('utf8')
            let body = {}
            try {
              body = raw ? JSON.parse(raw) : {}
            } catch {
              body = {}
            }

            try {
              const { handleSendCouponEmail } = await import('./lib/sendCouponEmailApi.js')
              const { status, json } = await handleSendCouponEmail(body)
              res.statusCode = status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(json))
            } catch (e) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: e?.message || 'Server error' }))
            }
          })
        },
      },
      {
        name: 'b2-storage-dev-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url?.split('?')[0] || ''
            if (url !== '/api/b2-storage') {
              return next()
            }

            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              res.end()
              return
            }

            if (req.method !== 'GET' && req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            const env = loadEnv(mode, process.cwd(), '')
            const keys = [
              'SUPABASE_URL',
              'SUPABASE_SERVICE_ROLE_KEY',
              'B2B_BUCKET_NAME',
              'B2B_BUCKET_ID',
              'B2B_KEY_ID',
              'B2B_APPLICATION_KEY',
              'B2B_FILE_BASE_URL',
            ]
            for (const k of keys) {
              const v = resolveServerEnvValue(env, k)
              // Always write to process.env to clear stale values
              process.env[k] = v
            }
            const isUploadFileAction = String(req.url || '').includes('action=uploadFile')
            const isGet = req.method === 'GET' || req.method === 'HEAD'
            let body = {}
            if (!isGet && !isUploadFileAction) {
              const chunks = []
              for await (const chunk of req) chunks.push(chunk)
              const raw = Buffer.concat(chunks).toString('utf8')
              try {
                body = raw ? JSON.parse(raw) : {}
              } catch {
                body = {}
              }
            }

            try {
              const { default: handler } = await import('./api/b2-storage.js')
              req.body = body
              const parsed = new URL(req.url || '', 'http://localhost')
              req.query = Object.fromEntries(parsed.searchParams.entries())
              // Minimal Express-like helpers expected by api/b2-storage.js
              if (typeof res.status !== 'function') {
                res.status = (code) => {
                  res.statusCode = code
                  return res
                }
              }
              if (typeof res.json !== 'function') {
                res.json = (payload) => {
                  if (!res.headersSent) res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(payload))
                }
              }
              if (typeof res.send !== 'function') {
                res.send = (payload) => {
                  if (Buffer.isBuffer(payload) || typeof payload === 'string') {
                    res.end(payload)
                    return
                  }
                  if (!res.headersSent) res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(payload))
                }
              }
              await handler(req, res)
            } catch (e) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: e?.message || 'Server error' }))
            }
          })
        },
      },
    ],
    server: {
      port: 3000,
      open: true,
    },
  }
})
