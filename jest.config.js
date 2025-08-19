module.exports = {
  // Jest 환경 설정
  testEnvironment: 'jsdom', // 브라우저 DOM 환경을 시뮬레이션
  
  // 테스트 파일 패턴
  testMatch: ['**/static/scripts/__tests__/**/*.js'],
  
  // 테스트에서 제외할 패턴
  testPathIgnorePatterns: ['/node_modules/', '/cleanup_backup/'],
  
  // 변환 설정
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // JS/JSX 파일을 babel-jest로 변환
  },
  
  // 모듈 경로 별칭 (필요시 설정)
  moduleNameMapper: {
    // 정적 파일 가짜 모듈 (필요시)
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // 테스트 실행 전후 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 테스트 타임아웃 설정
  testTimeout: 5000, // 5초 타임아웃
  
  // 테스트 커버리지 설정 (선택적)
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'static/scripts/**/*.{js,jsx}',
    '!static/scripts/vendor/**',
    '!**/node_modules/**',
  ],
}; 