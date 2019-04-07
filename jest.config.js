// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
    "json",
    "jsx",
    "ts",
    "tsx",
    "node"
  ],
  // The test environment that will be used for testing
  testEnvironment: "node",
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.?(m)js?(x)",
    "**/?(*.)(spec|test).?(m)js?(x)"
  ],
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\.m?js$": "babel-jest"
  },
};
