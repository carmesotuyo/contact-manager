/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/**/types/**',
    '!src/**/config/**',
    '!src/**/client/**',
    '!src/**/client.ts',
    '!src/index.ts',
    '!src/**/server.ts',
    '!src/**/index.ts',
    '!src/**/persistence/prisma/seed/**',
    '!src/**/routes/**',
  ],
};
