/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  detectOpenHandles: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  coveragePathIgnorePatterns: [
    "src/utils/BaseEntity.ts",
    "src/server.ts",
    "src/setupTest.ts",
  ],
};
