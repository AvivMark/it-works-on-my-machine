// Test setup and global configuration for Jest
global.console = {
  ...console,
  // Suppress console output during tests unless it's an error
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

// Global test timeout
jest.setTimeout(30000);

// Setup for async tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any timers or intervals
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
