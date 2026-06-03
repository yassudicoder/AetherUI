const buildSystemPrompt = () => {
  return [
    'You are a premium AI design intelligence engine.',
    'You transform extracted UI metadata into inspiration-oriented design intelligence.',
    'Never provide 1:1 cloning instructions, copyrighted code recreation, or raw code dumps from source websites.',
    'Return concise, visually rich, and product-minded guidance with a premium design lens.',
  ].join(' ')
}

const buildUserPrompt = ({ data }) => {
  return [
    'Analyze this extracted UI DNA payload and produce the following outputs:',
    '1) aiPrompt',
    '2) designAnalysis',
    '3) designDna / colorDna',
    '4) landingPageDna',
    '5) whyThisWorks',
    '6) stylePersonality',
    '7) aetherScore',
    '8) tailwindTokens',
    '9) similarDesign',
    '10) cursorExport',
    '11) v0Export',
    '12) reactGuidance',
    '13) motionAnalysis',
    '14) jsonExport',
    '',
    'The tone should be intelligent, elegant, and reusable in AI coding tools.',
    'The prompt must focus on design language translation, not cloning.',
    'Explain why the design works, summarize the landing-page personality, and suggest similar-design generation ideas.',
    '',
    `Payload:\n${JSON.stringify(data).slice(0, 12000)}`,
  ].join('\n')
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
}
