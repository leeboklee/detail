
import fetch from 'node-fetch';

const checkServer = async () => {
  try {
    const response = await fetch('http://localhost:3900');
    if (response.ok) {
      console.log('서버가 정상적으로 실행 중입니다. (상태 코드: 200)');
      process.exit(0);
    } else {
      console.error(`서버 응답 오류. 상태 코드: ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('서버에 연결할 수 없습니다:', error.message);
    process.exit(1);
  }
};

checkServer(); 