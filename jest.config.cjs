module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/ui/(.*)$': '<rootDir>/ui/$1',
    '^@/actions/(.*)$': '<rootDir>/actions/$1',
    '^@/contracts/(.*)$': '<rootDir>/contracts/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1'
  },
  preset: 'ts-jest/presets/js-with-ts',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx)'
  ],
  testTimeout: 5000
};