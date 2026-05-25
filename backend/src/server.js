const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { getProvider } = require('./ai/providerFactory')
const { createAnalyzeRouter } = require('./routes/analyze')

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const provider = getProvider(process.env)

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: provider.name,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/analyze', createAnalyzeRouter(provider))

app.listen(port, () => {
  console.log(`[ui-dna-backend] listening on ${port} with provider=${provider.name}`)
})
