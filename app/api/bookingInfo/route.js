import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 샘플 예약 안내 데이터
const sampleBookingInfo = {
  title: "숙박권 구매안내",
  purchaseGuide: `1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송
2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송
* 문자(카톡)는 근무시간내 수신자 번호로 전송

⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!

본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.
구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)
결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.
예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.
1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매
ex) 1박 2실 : 2매 / 2박 1실 : 2매
요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.`,
  referenceNotes: `해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
부분환불 불가
옵션수량은 대기가능 수량을 의미
현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
상세페이지와 상품명이 다른 경우 상품명 우선적용
추가요금 발생시 추가금 안내후 예약확정
빠른 확정 문의는 카톡상담 부탁드립니다.`,
  kakaoChannel: "카톡에서 한투어 채널 추가하세요 +"
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const list = searchParams.get('list'); // '1'이면 최근 목록 반환
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API bookingInfo GET - 응답 데이터 준비 완료 (format: ${format || 'default'})`);
    }
    
    // 목록 요청 처리: 최근 20건
    if (list === '1' || list === 'true') {
      const items = await prisma.bookingInfo.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      return Response.json({ items });
    }

    // 데이터베이스에서 예약안내 정보 조회 (최근 1건, active 우선)
    let bookingInfo = await prisma.bookingInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // 데이터가 없으면 샘플 데이터 반환
    if (!bookingInfo) {
      // 샘플 데이터를 데이터베이스에 저장
      bookingInfo = await prisma.bookingInfo.create({
        data: {
          ...sampleBookingInfo,
          hotelId: "default"
        }
      });
    }
    
    if (format === 'html') {
      const htmlContent = `
        <div class="booking-info">
          <h2 class="info-title">${bookingInfo.title}</h2>
          <div class="booking-content">
            <h3>📋 숙박권 구매안내</h3>
            <div class="purchase-guide">
              ${bookingInfo.purchaseGuide.replace(/\n/g, '<br>')}
            </div>
            <h3>📋 참고사항</h3>
            <div class="reference-notes">
              ${bookingInfo.referenceNotes.replace(/\n/g, '<br>')}
            </div>
            ${bookingInfo.kakaoChannel ? `
              <div class="kakao-channel">
                <span style="background: #fbbf24; padding: 8px 16px; border-radius: 8px; color: #92400e; font-weight: 600;">
                  💬 ${bookingInfo.kakaoChannel}
                </span>
              </div>
            ` : ''}
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
      return Response.json(bookingInfo);
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
    const { title, purchaseGuide, referenceNotes, kakaoChannel } = body;

    if (!purchaseGuide || !referenceNotes) {
      return Response.json(
        { error: '필수 필드 누락: purchaseGuide, referenceNotes' },
        { status: 400 }
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API bookingInfo POST - 요청 처리 완료');
    }
    
    // 기존 데이터를 비활성화하고 새 데이터 생성
    await prisma.bookingInfo.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    const newBookingInfo = await prisma.bookingInfo.create({
      data: {
        title: title || "숙박권 구매안내",
        purchaseGuide,
        referenceNotes,
        kakaoChannel,
        hotelId: "default"
      }
    });
    
    return Response.json({ 
      success: true, 
      message: '예약 안내가 성공적으로 저장되었습니다.',
      data: newBookingInfo
    });
  } catch (error) {
    console.error('API bookingInfo POST Error:', error);
    return Response.json(
      { error: '예약 안내 저장 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
} 