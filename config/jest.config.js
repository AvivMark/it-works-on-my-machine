module.exports = {
  testEnvironment: 'node',
  rootDir: '../',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server.js as it starts the server when imported
    '!node_modules/**',
    '!coverage/**',
    '!config/**',
    '!tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'json-summary',
    'html'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/utils/test-setup.js']
};
