// import { Configuration, OpenAIApi } from 'openai'
// import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const data = req.body;
    console.log('HTML 생성 요청 데이터:', JSON.stringify(data, null, 2));
    
    // 판매기간&투숙일 정보 추출
    const period = data.period || {};
    const hotel = data.hotel || data;
    const rooms = data.rooms || [];
    const packages = data.packages || [];
    const facilities = data.facilities || {};
    const checkin = data.checkin || {};
    const cancel = data.cancel || {};
    const booking = data.booking || {};
    const notices = data.notices || [];
    const pricing = data.pricing || {};
    
    // 사용자 입력 데이터 기반 HTML 콘텐츠 생성
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${hotel.name || '호텔 상세 페이지'}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .hotel-title { 
            font-size: 32px; 
            margin-bottom: 10px; 
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hotel-desc { color: #666; margin-bottom: 30px; font-size: 18px; }
          .section {
            background: rgba(102, 126, 234, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 5px solid #667eea;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #e0e6ed;
          }
          .info-label {
            font-weight: 600;
            color: #34495e;
            margin-bottom: 5px;
          }
          .info-value {
            color: #2c3e50;
          }
          .highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 14px;
          }
          .facility-category {
            margin-bottom: 15px;
          }
          .facility-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .facility-tag {
            background: #f8f9fa;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
            border: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="hotel-title">${hotel.name || '호텔명이 입력되지 않았습니다'}</h1>
          <p class="hotel-desc">${hotel.description || '호텔 설명이 입력되지 않았습니다.'}</p>
          
          <div class="section">
            <h2 class="section-title">🏨 기본 정보</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">주소</div>
                <div class="info-value">${hotel.address || '주소 정보가 입력되지 않았습니다.'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">전화번호</div>
                <div class="info-value">${hotel.phone || '전화번호가 입력되지 않았습니다.'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">기본 체크인</div>
                <div class="info-value">${checkin.checkInTime || period.checkInTime || '체크인 시간이 설정되지 않았습니다.'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">기본 체크아웃</div>
                <div class="info-value">${checkin.checkOutTime || period.checkOutTime || '체크아웃 시간이 설정되지 않았습니다.'}</div>
              </div>
            </div>
          </div>

          ${rooms && rooms.length > 0 ? `
          <div class="section">
            <h2 class="section-title">🛏️ 객실 정보</h2>
            ${rooms.map(room => `
            <div class="info-item" style="margin-bottom: 15px;">
              <h3 style="margin-bottom: 10px;">${room.name || room.roomType || '객실명 미입력'}</h3>
              <div class="info-grid">
                <div>
                  <div class="info-label">객실 타입</div>
                  <div class="info-value">${room.roomType || room.name || '타입 미입력'}</div>
                </div>
                <div>
                  <div class="info-label">전망</div>
                  <div class="info-value">${room.view || '전망 정보 없음'}</div>
                </div>
                <div>
                  <div class="info-label">침대 정보</div>
                  <div class="info-value">${room.bedInfo || room.bedType || '침대 정보 없음'}</div>
                </div>
                <div>
                  <div class="info-label">최대 인원</div>
                  <div class="info-value">${room.maxOccupancy || room.maxCapacity || '인원 정보 없음'}명</div>
                </div>
              </div>
              <p style="margin: 10px 0;">${room.description || '객실 설명이 입력되지 않았습니다.'}</p>
              ${room.amenities && room.amenities.length > 0 ? `
              <div class="info-label">편의시설:</div>
              <div class="facility-list">
                ${room.amenities.map(amenity => `<span class="facility-tag">${amenity}</span>`).join('')}
              </div>` : ''}
            </div>`).join('')}
          </div>` : `
          <div class="section">
            <h2 class="section-title">🛏️ 객실 정보</h2>
            <div class="info-item">
              <p style="color: #999; text-align: center;">객실 정보가 입력되지 않았습니다.</p>
            </div>
          </div>`}

          ${Object.keys(facilities).length > 0 && Object.values(facilities).some(arr => arr && arr.length > 0) ? `
          <div class="section">
            <h2 class="section-title">🏢 호텔 시설</h2>
            ${Object.entries(facilities).map(([category, items]) => {
              if (!items || items.length === 0) return '';
              const categoryNames = {
                general: '일반 시설',
                business: '비즈니스 시설',
                leisure: '레저 시설',
                dining: '다이닝 시설'
              };
              return `
              <div class="facility-category">
                <h3 style="margin-bottom: 10px; color: #667eea;">${categoryNames[category] || category}</h3>
                <div class="facility-list">
                  ${items.map(item => `<span class="facility-tag">${typeof item === 'string' ? item : item.name}</span>`).join('')}
                </div>
              </div>`;
            }).filter(Boolean).join('')}
          </div>` : ''}

          ${packages && packages.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📦 패키지 정보</h2>
            ${packages.map(pkg => `
            <div class="info-item" style="margin-bottom: 15px;">
              <h3 style="margin-bottom: 10px;">${pkg.name || '패키지명 미입력'}</h3>
              <p style="margin-bottom: 10px;">${pkg.description || '패키지 설명이 입력되지 않았습니다.'}</p>
              <div class="info-grid">
                <div>
                  <div class="info-label">가격</div>
                  <div class="info-value"><span class="highlight">${pkg.price ? pkg.price.toLocaleString() + '원' : '가격 정보 없음'}</span></div>
                </div>
                ${pkg.availableFrom ? `
                <div>
                  <div class="info-label">이용 가능 시작일</div>
                  <div class="info-value">${pkg.availableFrom}</div>
                </div>` : ''}
                ${pkg.availableTo ? `
                <div>
                  <div class="info-label">이용 가능 종료일</div>
                  <div class="info-value">${pkg.availableTo}</div>
                </div>` : ''}
              </div>
              ${pkg.includes && pkg.includes.length > 0 ? `
              <div class="info-label">포함사항:</div>
              <div class="facility-list">
                ${pkg.includes.map(item => `<span class="facility-tag">${item}</span>`).join('')}
              </div>` : ''}
            </div>`).join('')}
          </div>` : ''}

          ${period.saleStartDate || period.stayStartDate ? `
          <div class="section">
            <h2 class="section-title">📅 판매기간 & 투숙일</h2>
            
            ${period.saleStartDate ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #e74c3c; margin-bottom: 10px;">🛒 판매기간</h3>
              <div class="info-grid">
                ${period.saleStartDate ? `
                <div class="info-item">
                  <div class="info-label">판매 시작일</div>
                  <div class="info-value">${period.saleStartDate}</div>
                </div>` : ''}
                ${period.saleEndDate ? `
                <div class="info-item">
                  <div class="info-label">판매 종료일</div>
                  <div class="info-value">${period.saleEndDate}</div>
                </div>` : ''}
                ${period.earlyBirdDiscount ? `
                <div class="info-item">
                  <div class="info-label">얼리버드 할인</div>
                  <div class="info-value"><span class="highlight">${period.earlyBirdDiscount}</span></div>
                </div>` : ''}
                ${period.lastMinuteDiscount ? `
                <div class="info-item">
                  <div class="info-label">막판 할인</div>
                  <div class="info-value"><span class="highlight">${period.lastMinuteDiscount}</span></div>
                </div>` : ''}
              </div>
              ${period.specialBenefits ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">특별 혜택</div>
                <div class="info-value">${period.specialBenefits}</div>
              </div>` : ''}
              ${period.saleRestrictions ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">판매 제한사항</div>
                <div class="info-value">${period.saleRestrictions}</div>
              </div>` : ''}
            </div>` : ''}
            
            ${period.stayStartDate ? `
            <div>
              <h3 style="color: #e74c3c; margin-bottom: 10px;">🏨 투숙일</h3>
              <div class="info-grid">
                ${period.stayStartDate ? `
                <div class="info-item">
                  <div class="info-label">투숙 시작일</div>
                  <div class="info-value">${period.stayStartDate}</div>
                </div>` : ''}
                ${period.stayEndDate ? `
                <div class="info-item">
                  <div class="info-label">투숙 종료일</div>
                  <div class="info-value">${period.stayEndDate}</div>
                </div>` : ''}
                ${period.checkInTime ? `
                <div class="info-item">
                  <div class="info-label">체크인 시간</div>
                  <div class="info-value">${period.checkInTime}</div>
                </div>` : ''}
                ${period.checkOutTime ? `
                <div class="info-item">
                  <div class="info-label">체크아웃 시간</div>
                  <div class="info-value">${period.checkOutTime}</div>
                </div>` : ''}
                ${period.minStayDays ? `
                <div class="info-item">
                  <div class="info-label">최소 숙박일</div>
                  <div class="info-value">${period.minStayDays}일</div>
                </div>` : ''}
                ${period.maxStayDays ? `
                <div class="info-item">
                  <div class="info-label">최대 숙박일</div>
                  <div class="info-value">${period.maxStayDays}일</div>
                </div>` : ''}
              </div>
              ${period.blackoutDates ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">예약 불가 날짜</div>
                <div class="info-value">${period.blackoutDates}</div>
              </div>` : ''}
              ${period.seasonalRates ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">시즌별 요금</div>
                <div class="info-value">${period.seasonalRates}</div>
              </div>` : ''}
              ${period.weekendSurcharge ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">주말 할증료</div>
                <div class="info-value">${period.weekendSurcharge}</div>
              </div>` : ''}
              ${period.holidaySurcharge ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">공휴일 할증료</div>
                <div class="info-value">${period.holidaySurcharge}</div>
              </div>` : ''}
              ${period.cancellationPolicy ? `
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">취소 정책</div>
                <div class="info-value">${period.cancellationPolicy}</div>
              </div>` : ''}
            </div>` : ''}
          </div>` : ''}

          ${cancel.freeCancellation || cancel.cancellationFee ? `
          <div class="section">
            <h2 class="section-title">❌ 취소 정책</h2>
            <div class="info-grid">
              ${cancel.freeCancellation ? `
              <div class="info-item">
                <div class="info-label">무료 취소</div>
                <div class="info-value">${cancel.freeCancellation}</div>
              </div>` : ''}
              ${cancel.cancellationFee ? `
              <div class="info-item">
                <div class="info-label">취소 수수료</div>
                <div class="info-value">${cancel.cancellationFee}</div>
              </div>` : ''}
              ${cancel.noShow ? `
              <div class="info-item">
                <div class="info-label">노쇼 정책</div>
                <div class="info-value">${cancel.noShow}</div>
              </div>` : ''}
              ${cancel.modificationPolicy ? `
              <div class="info-item">
                <div class="info-label">변경 정책</div>
                <div class="info-value">${cancel.modificationPolicy}</div>
              </div>` : ''}
            </div>
          </div>` : ''}

          ${booking.reservationMethod || booking.paymentMethods ? `
          <div class="section">
            <h2 class="section-title">📞 예약 정보</h2>
            <div class="info-grid">
              ${booking.reservationMethod ? `
              <div class="info-item">
                <div class="info-label">예약 방법</div>
                <div class="info-value">${booking.reservationMethod}</div>
              </div>` : ''}
              ${booking.confirmationTime ? `
              <div class="info-item">
                <div class="info-label">예약 확인 시간</div>
                <div class="info-value">${booking.confirmationTime}</div>
              </div>` : ''}
              ${booking.specialRequests ? `
              <div class="info-item">
                <div class="info-label">특별 요청</div>
                <div class="info-value">${booking.specialRequests}</div>
              </div>` : ''}
            </div>
            ${booking.paymentMethods && booking.paymentMethods.length > 0 ? `
            <div class="info-item" style="margin-top: 15px;">
              <div class="info-label">결제 방법:</div>
              <div class="facility-list">
                ${booking.paymentMethods.map(method => `<span class="facility-tag">${method}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>` : ''}

          ${notices && notices.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📢 공지사항</h2>
            ${notices.map(notice => `
            <div class="info-item" style="margin-bottom: 15px;">
              <h3 style="margin-bottom: 10px; color: ${notice.type === 'important' ? '#e74c3c' : '#667eea'};">${notice.title || '제목 없음'}</h3>
              <p style="margin: 0;">${notice.content || '내용이 입력되지 않았습니다.'}</p>
            </div>`).join('')}
          </div>` : ''}

          ${pricing.additionalChargesInfo || (pricing.lodges && pricing.lodges.length > 0) ? `
          <div class="section">
            <h2 class="section-title">💰 요금 정보</h2>
            ${pricing.additionalChargesInfo ? `
            <div class="info-item" style="margin-bottom: 15px;">
              <div class="info-label">추가 요금 정보</div>
              <div class="info-value">${pricing.additionalChargesInfo}</div>
            </div>` : ''}
            ${pricing.lodges && pricing.lodges.length > 0 ? `
            ${pricing.lodges.map(lodge => `
            <div class="info-item" style="margin-bottom: 15px;">
              <h3 style="margin-bottom: 10px;">${lodge.name || '숙소명 미입력'}</h3>
              ${lodge.rooms && lodge.rooms.length > 0 ? `
              <div class="info-grid">
                ${lodge.rooms.map(room => `
                <div>
                  <div class="info-label">${room.roomType || '객실'} - ${room.view || '전망'}</div>
                  <div class="info-value">
                    ${pricing.dayTypes && pricing.dayTypes.length > 0 ? 
                      pricing.dayTypes.map(dayType => 
                        `${dayType.name}: ${room.prices && room.prices[dayType.type] ? room.prices[dayType.type].toLocaleString() + '원' : '가격 미설정'}`
                      ).join(' | ') : '가격 정보 없음'}
                  </div>
                </div>`).join('')}
              </div>` : ''}
            </div>`).join('')}` : ''}
          </div>` : ''}
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            생성일: ${new Date().toLocaleString('ko-KR')}
          </div>
        </div>
      </body>
      </html>
    `;
    
    // 파일 저장 로직 (선택적)
    const shouldSaveToFile = req.query.save === 'true';
    if (shouldSaveToFile) {
      const dirPath = path.join(process.cwd(), 'public', 'generated');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const fileName = `hotel-${Date.now()}.html`;
      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, htmlContent);
      console.log(`HTML 파일 저장 완료: ${filePath}`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8').status(200).send(htmlContent);

  } catch (error) {
    console.error('HTML 생성 실패:', error);
    res.status(500).json({ success: false, message: 'HTML 생성 중 오류가 발생했습니다.', error: error.message });
  }
} 