// Git 인증 요청 차단 모듈
module.exports = {
  // 모든 Git 자격 증명 요청 함수 비활성화
  isAvailable: () => false,
  getAuth: () => null,
  store: () => null,
  erase: () => null,
  fill: () => null,
  approve: () => null,
  get: () => null,
  configure: () => null,
  refreshToken: () => null,
  reset: () => null,
  fetch: () => Promise.resolve(null),
  request: () => Promise.resolve(null)
}; 