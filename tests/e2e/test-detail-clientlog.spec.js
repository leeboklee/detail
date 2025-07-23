import { test, expect } from '@playwright/test';

// 서버로 로그 전송 함수
async function sendLog(log) {
  await fetch('http://localhost: {process.env.PORT || 34343}/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
}

test('test-detail 페이지 클라이언트 로그 자동 수집 및 서버 전송', async ({ page }) => {
  const logs = [];

  // 콘솔 오류/로그 수집
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning' || msg.type() === 'log') {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 페이지 오류 수집
  page.on('pageerror', error => {
    logs.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // 네트워크 오류 수집
  page.on('response', response => {
    if (response.status() >= 400) {
      logs.push({
        type: 'network_error',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // /test-detail 페이지 진입
  await page.goto('http://localhost: {process.env.PORT || 34343}/test-detail');
  await page.waitForLoadState('networkidle');

  // '테스트 시작' 버튼 클릭
  const startBtn = page.locator('button:has-text("테스트 시작")');
  await expect(startBtn).toBeVisible();
  await startBtn.click();

  // 5초간 로그 수집
  await page.waitForTimeout(5000);

  // 서버로 로그 전송
  for (const log of logs) {
    await page.evaluate(sendLog, log);
  }

  // 결과 요약 출력
  if (logs.length > 0) {
    console.log('\n🚨 감지된 클라이언트 로그:');
    logs.forEach((log, idx) => {
      console.log(`\n${idx + 1}. ${log.type}:`);
      console.log('   메시지:', log.message || log.text);
      if (log.url) console.log('   URL:', log.url);
      if (log.stack) console.log('   스택:', log.stack);
      console.log('   시간:', log.timestamp);
    });
  } else {
    console.log('✅ 오류/로그 없음');
  }

  // 오류가 있으면 테스트 실패
  expect(logs.filter(l => l.type === 'error' || l.type === 'page_error' || l.type === 'network_error').length).toBe(0);
}); 