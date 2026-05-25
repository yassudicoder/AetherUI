const buildSystemPrompt = () => {
  return [
    'You are a UI design language analyst.',
    'You transform extracted UI metadata into inspiration-oriented design intelligence.',
    'Never provide 1:1 cloning instructions, copyrighted code recreation, or raw code dumps from source websites.',
    'Return concise and practical guidance with a premium product design lens.',
  ].join(' ')
}

const buildUserPrompt = ({ data }) => {
  return [
    'Analyze this extracted UI DNA payload and produce six outputs:',
    '1) aiPrompt',
    '2) designAnalysis',
    '3) tailwindTokens',
    '4) reactGuidance',
    '5) motionAnalysis',
    '6) jsonExportSummary',
    '',
    'The tone should be intelligent and reusable in AI coding tools.',
    'The prompt must focus on design language translation, not cloning.',
    '',
    `Payload:\n${JSON.stringify(data).slice(0, 12000)}`,
  ].join('\n')
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
}
