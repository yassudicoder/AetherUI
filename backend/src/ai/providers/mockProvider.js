const { buildFallbackAnalysis } = require('../formatter')

const createMockProvider = () => {
  return {
    name: 'mock',
    async analyze(payload) {
      return buildFallbackAnalysis(payload.data)
    },
  }
}

module.exports = {
  createMockProvider,
}
