// 샘플 예약 안내 데이터
const sampleBookingInfo = {
  content: `■ 예약 및 문의
  - 예약 전화: 000-0000-0000 (09:00-18:00, 공휴일 휴무)
  - 이메일 문의: booking@example.com

■ 예약 확인 안내
  - 예약 확정 후 예약 확인 이메일이 발송됩니다.
  - 체크인 시 예약자 본인 확인을 위해 신분증을 반드시 지참해주세요.

■ 체크인/체크아웃 안내
  - 체크인: 오후 3시 이후
  - 체크아웃: 오전 11시 이전
  - 얼리 체크인 또는 레이트 체크아웃은 사전 문의 필요

■ 결제 안내
  - 예약 시 신용카드 정보가 필요할 수 있습니다.
  - 현장에서 체크인 시 전액 결제 또는 카드 승인이 진행됩니다.`
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API bookingInfo GET - 응답 데이터 준비 완료 (format: ${format || 'default'})`);
    }
    
    if (format === 'html') {
      const htmlContent = `
        <div class="booking-info">
          <h2 class="info-title">예약 안내</h2>
          <div class="booking-content">
            <p>${sampleBookingInfo.content.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `;
      return new Response(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } else {
      return Response.json(sampleBookingInfo);
    }
  } catch (error) {
    console.error('API bookingInfo GET Error:', error);
    return Response.json(
      { error: '예약 안내를 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return Response.json(
        { error: '필수 필드 누락: content' },
        { status: 400 }
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API bookingInfo POST - 요청 처리 완료');
    }
    
    return Response.json({ 
      success: true, 
      message: '예약 안내가 성공적으로 저장되었습니다.',
      data: { content }
    });
  } catch (error) {
    console.error('API bookingInfo POST Error:', error);
    return Response.json(
      { error: '예약 안내 저장 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
} 