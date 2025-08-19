// 테스트용 서버 오류 API
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const errorType = searchParams.get('type') || 'general';
  
  console.log(`[test-error] 테스트 오류 요청: ${errorType}`);
  
  // 오류 타입에 따른 응답
  switch (errorType) {
    case '500':
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: '테스트용 500 오류입니다.',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'timeout':
      // 타임아웃 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 10000));
      return new Response(JSON.stringify({
        error: 'Timeout',
        message: '테스트용 타임아웃 오류입니다.',
        timestamp: new Date().toISOString()
      }), {
        status: 408,
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'network':
      // 네트워크 오류 시뮬레이션
      throw new Error('테스트용 네트워크 오류입니다.');
      
    case 'database':
      // 데이터베이스 오류 시뮬레이션
      return new Response(JSON.stringify({
        error: 'Database Error',
        message: '테스트용 데이터베이스 오류입니다.',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
      
    default:
      return new Response(JSON.stringify({
        error: 'Test Error',
        message: '테스트용 일반 오류입니다.',
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[test-error] POST 요청:', body);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'POST 테스트 오류',
      message: body.message || '테스트용 POST 오류입니다.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid Request',
      message: '잘못된 요청입니다.',
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 