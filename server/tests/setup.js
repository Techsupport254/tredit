// Mock environment variables
process.env.JWT_SECRET = "test-secret";
process.env.PINATA_API_KEY = "test-api-key";
process.env.PINATA_API_SECRET = "test-api-secret";

// Global test timeout
jest.setTimeout(30000);

// Clear all mocks after each test
afterEach(() => {
	jest.clearAllMocks();
});
