const OpenAI = require('openai')
const { buildSystemPrompt, buildUserPrompt } = require('../promptBuilder')

const parseJsonFromText = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1))
      } catch {
        return null
      }
    }

    return null
  }
}

const createOpenAIProvider = (config) => {
  const client = new OpenAI({ apiKey: config.apiKey })

  return {
    name: 'openai',
    async analyze(payload) {
      const model = config.model || 'gpt-4.1-mini'

      const completion = await client.responses.create({
        model,
        input: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'ui_dna_analysis',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                aiPrompt: { type: 'string' },
                designAnalysis: { type: 'string' },
                designDna: { type: 'string' },
                landingPageDna: { type: 'string' },
                whyThisWorks: { type: 'string' },
                stylePersonality: { type: 'string' },
                aetherScore: { type: 'string' },
                tailwindTokens: { type: 'string' },
                similarDesign: { type: 'string' },
                cursorExport: { type: 'string' },
                v0Export: { type: 'string' },
                reactGuidance: { type: 'string' },
                motionAnalysis: { type: 'string' },
                jsonExport: { type: 'string' },
              },
              required: [
                'aiPrompt',
                'designAnalysis',
                'designDna',
                'landingPageDna',
                'whyThisWorks',
                'stylePersonality',
                'aetherScore',
                'tailwindTokens',
                'similarDesign',
                'cursorExport',
                'v0Export',
                'reactGuidance',
                'motionAnalysis',
                'jsonExport',
              ],
            },
          },
        },
      })

      const text = completion.output_text || ''
      return parseJsonFromText(text)
    },
  }
}

module.exports = {
  createOpenAIProvider,
}
