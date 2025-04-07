module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
}; 