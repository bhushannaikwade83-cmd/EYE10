import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
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

            const env = loadEnv(mode, process.cwd(), '')
            const keys = [
              'BREVO_API_KEY',
              'BREVO_SENDER_EMAIL',
              'BREVO_SENDER_NAME',
              'BREVO_SUBJECT_PREFIX',
              'VITE_BREVO_API_KEY',
              'VITE_BREVO_SENDER_EMAIL',
              'VITE_BREVO_SENDER_NAME',
              'VITE_BREVO_SUBJECT_PREFIX',
            ]
            for (const k of keys) {
              if (env[k] != null && env[k] !== '') process.env[k] = env[k]
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
    ],
    server: {
      port: 3000,
      open: true,
    },
  }
})
