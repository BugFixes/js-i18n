module.exports = {
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'lcov',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  testEnvironment: 'node',
  verbose: true,
}
