// 샘플 취소 규정 데이터
const sampleCancelData = {
  beforeCheckIn: [
    { days: '체크인 7일 전', rate: '객실요금 100% 환불' },
    { days: '체크인 6일 전', rate: '객실요금 90% 환불' },
    { days: '체크인 5일 전', rate: '객실요금 80% 환불' },
    { days: '체크인 4일 전', rate: '객실요금 70% 환불' },
    { days: '체크인 3일 전', rate: '객실요금 50% 환불' },
    { days: '체크인 2일 전', rate: '객실요금 30% 환불' },
    { days: '체크인 1일 전', rate: '객실요금 10% 환불' }
  ],
  afterCheckIn: [
    { days: '체크인 당일', rate: '환불 불가' },
    { days: '숙박 중 퇴실', rate: '환불 불가' }
  ],
  additionalPolicy: '- 예약 변경은 취소 후 재예약 가능합니다.\n- 천재지변 및 기상 악화에 의한 취소는 별도 문의 바랍니다.',
  description: '취소 및 환불 규정을 안내드립니다. 예약 취소 시점에 따라 환불 금액이 상이합니다.',
  notes: '상기 취소 규정은 일반 예약에 적용되며, 프로모션 상품의 경우 별도 규정이 적용될 수 있습니다.'
};

/**
 * 취소 규정을 HTML 형식으로 변환
 */
function convertCancelInfoToHtml(cancelInfo) {
  try {
    // 규정이 없을 경우
    if (!cancelInfo) {
      return '<div class="alert alert-warning">취소 규정 정보가 없습니다.</div>';
    }
    
    // HTML 생성
    let html = `
      <div class="cancel-info">
        <h2 class="info-title">취소 규정</h2>
    `;
    
    // 설명 추가
    if (cancelInfo.description) {
      html += `<p class="cancel-description">${cancelInfo.description}</p>`;
    }
    
    // 체크인 전 취소 규정
    if (cancelInfo.beforeCheckIn && cancelInfo.beforeCheckIn.length > 0) {
      html += `
        <div class="cancel-rules-section">
          <h3>체크인 전 취소 규정</h3>
          <ul>
      `;
      
      for (const rule of cancelInfo.beforeCheckIn) {
        html += `<li><strong>${rule.days || '기간 정보 없음'}</strong>: ${rule.rate || '환불 정보 없음'}</li>`;
      }
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // 체크인 후 취소 규정
    if (cancelInfo.afterCheckIn && cancelInfo.afterCheckIn.length > 0) {
      html += `
        <div class="cancel-rules-section">
          <h3>체크인 후 취소 규정</h3>
          <ul>
      `;
      
      for (const rule of cancelInfo.afterCheckIn) {
        html += `<li><strong>${rule.days || '기간 정보 없음'}</strong>: ${rule.rate || '환불 정보 없음'}</li>`;
      }
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // 추가 규정
    if (cancelInfo.additionalPolicy) {
      html += `
        <div class="additional-policy">
          <h3>추가 안내사항</h3>
          <p>${cancelInfo.additionalPolicy.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    
    // 참고사항
    if (cancelInfo.notes) {
      html += `
        <div class="cancel-notes">
          <p class="notes"><em>${cancelInfo.notes}</em></p>
        </div>
      `;
    }
    
    html += `</div>`;
    
    return html;
  } catch (error) {
    console.error('HTML 변환 오류:', error);
    return '<div class="alert alert-danger">취소 규정을 표시하는 중 오류가 발생했습니다.</div>';
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API cancel GET - 응답 데이터 준비 완료 (format: ${format || 'default'})`);
    }
    
    if (format === 'html') {
      const htmlContent = convertCancelInfoToHtml(sampleCancelData);
      return new Response(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } else {
      return Response.json(sampleCancelData);
    }
  } catch (error) {
    console.error('API cancel GET Error:', error);
    return Response.json(
      { error: '취소 규정을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { cancelData } = body;

    if (!cancelData) {
      return Response.json(
        { error: '필수 필드 누락: cancelData' },
        { status: 400 }
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API cancel POST - 요청 처리 완료');
    }
    
    return Response.json({ 
      success: true, 
      message: '취소 규정이 성공적으로 저장되었습니다.',
      data: { cancelData }
    });
  } catch (error) {
    console.error('API cancel POST Error:', error);
    return Response.json(
      { error: '취소 규정 저장 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
} 