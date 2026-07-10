const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로 제공
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // 모듈 별칭 처리
    '^@/(.*)$': '<rootDir>/$1',
    // CSS 모듈 모킹
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // CSS 파일 모킹
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // 이미지 파일 모킹
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverageFrom: [
    'app/api/artifacts/route.ts',
    'components/artifact-card.tsx',
    'components/cultural-property-badge.tsx',
    'components/favorite-artifact-card.tsx',
    'components/server-artifact-card.tsx',
    'hooks/useLanguage.tsx',
    'lib/artifact-utils.ts',
    'lib/server/artifact-repository.ts',
    'lib/validation.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
