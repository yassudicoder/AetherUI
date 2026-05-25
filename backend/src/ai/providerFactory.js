const { createMockProvider } = require('./providers/mockProvider')
const { createOpenAIProvider } = require('./providers/openaiProvider')

const getProvider = (env) => {
  const providerMode = env.AI_PROVIDER || 'auto'
  const hasOpenAI = Boolean(env.OPENAI_API_KEY)

  if (providerMode === 'openai') {
    if (!hasOpenAI) {
      throw new Error('AI_PROVIDER=openai requires OPENAI_API_KEY')
    }

    return createOpenAIProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    })
  }

  if (providerMode === 'mock') {
    return createMockProvider()
  }

  if (hasOpenAI) {
    return createOpenAIProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    })
  }

  return createMockProvider()
}

module.exports = {
  getProvider,
}
