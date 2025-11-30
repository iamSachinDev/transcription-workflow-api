import neostandard from 'neostandard'

export default neostandard({
  // Enable TypeScript support
  ts: true,

  // Standard Style (no semicolons)
  semi: false,

  // Files to ignore
  ignores: [
    'dist/**',
    'coverage/**',
    'node_modules/**',
    'tests/**/*.js',
    '**/*.test.js',
    '*.config.js',
    '*.config.mjs'
  ],

  // Custom rule overrides if strictly necessary (usually not needed with Standard)
  rules: {
    // Example: Allow unused vars if they start with _
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
})
