const express = require('express')
const { z } = require('zod')
const { normalizeAnalysisShape, buildFallbackAnalysis } = require('../ai/formatter')

const optionsSchema = z.object({
  typography: z.boolean(),
  colors: z.boolean(),
  layout: z.boolean(),
  animations: z.boolean(),
  heroSection: z.boolean(),
  buttonsAndCTA: z.boolean(),
  spacingSystem: z.boolean(),
  designLanguage: z.boolean(),
  responsiveBehavior: z.boolean(),
  hoverEffects: z.boolean(),
  componentStructure: z.boolean(),
})

const requestSchema = z.object({
  data: z.record(z.any()),
  options: optionsSchema,
})

const createAnalyzeRouter = (provider) => {
  const router = express.Router()

  router.post('/', async (req, res) => {
    const parsed = requestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      })
    }

    try {
      const analysis = await provider.analyze(parsed.data)
      const safe = normalizeAnalysisShape(analysis, parsed.data.data)

      return res.json(safe)
    } catch (error) {
      const fallback = buildFallbackAnalysis(parsed.data.data)
      return res.status(200).json({
        ...fallback,
        designAnalysis: `${fallback.designAnalysis}\n\nProvider fallback reason: ${error instanceof Error ? error.message : 'unknown error'}`,
      })
    }
  })

  return router
}

module.exports = {
  createAnalyzeRouter,
}
