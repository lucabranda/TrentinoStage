module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
      // Add any necessary mappings if you use path aliases in TypeScript
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };
  