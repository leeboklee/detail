// HTML 생성 유틸리티 함수들

/**
 * 호텔 정보를 HTML로 변환
 * @param {Object} hotel - 호텔 정보 객체
 * @returns {string} HTML 문자열
 */
export const generateHotelHtml = (hotel) => {
  if (!hotel) return '';
  
  return `
    <section class="hotel-info">
      <h2>${hotel.name || '호텔명'}</h2>
      <div class="hotel-details">
        <p><strong>주소:</strong> ${hotel.address || '주소 정보 없음'}</p>
        <p><strong>전화번호:</strong> ${hotel.phone || '전화번호 정보 없음'}</p>
        ${hotel.email ? `<p><strong>이메일:</strong> ${hotel.email}</p>` : ''}
        ${hotel.website ? `<p><strong>웹사이트:</strong> <a href="${hotel.website}" target="_blank">${hotel.website}</a></p>` : ''}
        ${hotel.description ? `<p><strong>설명:</strong> ${hotel.description}</p>` : ''}
      </div>
    </section>
  `;
};

/**
 * 객실 정보를 HTML로 변환
 * @param {Array} rooms - 객실 정보 배열
 * @returns {string} HTML 문자열
 */
export const generateRoomsHtml = (rooms) => {
  if (!rooms || rooms.length === 0) return '';
  
  const roomsHtml = rooms.map(room => `
    <div class="room-item">
              <h3>${room.name || ''}</h3>
      <div class="room-details">
        <p><strong>타입:</strong> ${room.type || '타입 정보 없음'}</p>
        <p><strong>구조:</strong> ${room.structure || '구조 정보 없음'}</p>
        <p><strong>베드:</strong> ${room.bedType || '베드 정보 없음'}</p>
        <p><strong>전망:</strong> ${room.view || '전망 정보 없음'}</p>
        <p><strong>기본 수용 인원:</strong> ${room.standardCapacity || 0}명</p>
        <p><strong>최대 수용 인원:</strong> ${room.maxCapacity || 0}명</p>
        ${room.description ? `<p><strong>설명:</strong> ${room.description}</p>` : ''}
        ${room.amenities && room.amenities.length > 0 ? `
          <p><strong>편의시설:</strong></p>
          <ul>
            ${room.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <section class="rooms-info">
      <h2>객실 정보</h2>
      <div class="rooms-grid">
        ${roomsHtml}
      </div>
    </section>
  `;
};

/**
 * 시설 정보를 HTML로 변환
 * @param {Object} facilities - 시설 정보 객체
 * @returns {string} HTML 문자열
 */
export const generateFacilitiesHtml = (facilities) => {
  if (!facilities) return '';
  
  const generateFacilityList = (title, items) => {
    if (!items || items.length === 0) return '';
    
    return `
      <div class="facility-category">
        <h4>${title}</h4>
        <ul>
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };
  
  return `
    <section class="facilities-info">
      <h2>시설 정보</h2>
      <div class="facilities-grid">
        ${generateFacilityList('일반 시설', facilities.general)}
        ${generateFacilityList('비즈니스 시설', facilities.business)}
        ${generateFacilityList('레저 시설', facilities.leisure)}
        ${generateFacilityList('식음료 시설', facilities.dining)}
      </div>
    </section>
  `;
};

/**
 * 체크인/아웃 정보를 HTML로 변환
 * @param {Object} checkin - 체크인/아웃 정보 객체
 * @returns {string} HTML 문자열
 */
export const generateCheckinHtml = (checkin) => {
  if (!checkin) return '';
  
  return `
    <section class="checkin-info">
      <h2>체크인/아웃 정보</h2>
      <div class="checkin-details">
        <p><strong>체크인 시간:</strong> ${checkin.checkInTime || '시간 정보 없음'}</p>
        <p><strong>체크아웃 시간:</strong> ${checkin.checkOutTime || '시간 정보 없음'}</p>
        <p><strong>얼리 체크인:</strong> ${checkin.earlyCheckIn || '정보 없음'}</p>
        <p><strong>레이트 체크아웃:</strong> ${checkin.lateCheckOut || '정보 없음'}</p>
      </div>
    </section>
  `;
};

/**
 * 패키지 정보를 HTML로 변환
 * @param {Array} packages - 패키지 정보 배열
 * @returns {string} HTML 문자열
 */
export const generatePackagesHtml = (packages) => {
  if (!packages || packages.length === 0) return '';
  
  const packagesHtml = packages.map(pkg => `
    <div class="package-item">
      <h3>${pkg.name || '패키지명'}</h3>
      <div class="package-details">
        ${pkg.description ? `<p><strong>설명:</strong> ${pkg.description}</p>` : ''}
        <p><strong>가격:</strong> ${pkg.price ? `${pkg.price.toLocaleString()}원` : '가격 정보 없음'}</p>
        ${pkg.includes && pkg.includes.length > 0 ? `
          <p><strong>포함 사항:</strong></p>
          <ul>
            ${pkg.includes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}
        ${pkg.salesPeriod ? `
          <p><strong>판매 기간:</strong> ${pkg.salesPeriod.start} ~ ${pkg.salesPeriod.end}</p>
        ` : ''}
        ${pkg.stayPeriod ? `
          <p><strong>투숙 기간:</strong> ${pkg.stayPeriod.start} ~ ${pkg.stayPeriod.end}</p>
        ` : ''}
        ${pkg.productComposition ? `<p><strong>상품 구성:</strong> ${pkg.productComposition}</p>` : ''}
        ${pkg.notes && pkg.notes.length > 0 ? `
          <p><strong>참고사항:</strong></p>
          <ul>
            ${pkg.notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        ` : ''}
        ${pkg.constraints && pkg.constraints.length > 0 ? `
          <p><strong>제약사항:</strong></p>
          <ul>
            ${pkg.constraints.map(constraint => `<li>${constraint}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <section class="packages-info">
      <h2>패키지 정보</h2>
      <div class="packages-grid">
        ${packagesHtml}
      </div>
    </section>
  `;
};

/**
 * 요금 정보를 HTML로 변환
 * @param {Object} pricing - 요금 정보 객체
 * @returns {string} HTML 문자열
 */
export const generatePricingHtml = (pricing) => {
  if (!pricing) return '';
  
  const generateLodgeHtml = (lodge) => {
    if (!lodge || !lodge.rooms) return '';
    
    const roomsHtml = lodge.rooms.map(room => `
      <div class="room-pricing">
        <h4>${room.roomType || '객실 타입'}</h4>
        <p><strong>전망:</strong> ${room.view || '전망 정보 없음'}</p>
        <div class="price-list">
          ${Object.entries(room.prices || {}).map(([day, price]) => `
            <div class="price-item">
              <span class="day">${day}</span>
              <span class="price">${price ? `${price.toLocaleString()}원` : '가격 정보 없음'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    return `
      <div class="lodge-pricing">
        <h3>${lodge.name || '숙소명'}</h3>
        ${roomsHtml}
      </div>
    `;
  };
  
  const dayTypesHtml = pricing.dayTypes ? `
    <div class="day-types">
      <h3>요일별 구분</h3>
      <ul>
        ${pricing.dayTypes.map(dayType => `
          <li><strong>${dayType.name}:</strong> ${dayType.type}</li>
        `).join('')}
      </ul>
    </div>
  ` : '';
  
  return `
    <section class="pricing-info">
      <h2>요금 정보</h2>
      ${pricing.lodges ? pricing.lodges.map(generateLodgeHtml).join('') : ''}
      ${dayTypesHtml}
    </section>
  `;
};

/**
 * 취소 정책을 HTML로 변환
 * @param {Object} cancel - 취소 정책 객체
 * @returns {string} HTML 문자열
 */
export const generateCancelHtml = (cancel) => {
  if (!cancel) return '';
  
  return `
    <section class="cancel-policy">
      <h2>취소 정책</h2>
      <div class="cancel-details">
        <p><strong>무료 취소:</strong> ${cancel.freeCancellation || '정보 없음'}</p>
        <p><strong>취소 수수료:</strong> ${cancel.cancellationFee || '정보 없음'}</p>
        <p><strong>노쇼 정책:</strong> ${cancel.noShow || '정보 없음'}</p>
        <p><strong>변경 정책:</strong> ${cancel.modificationPolicy || '정보 없음'}</p>
      </div>
    </section>
  `;
};

/**
 * 예약 안내를 HTML로 변환
 * @param {Object} booking - 예약 안내 객체
 * @returns {string} HTML 문자열
 */
export const generateBookingHtml = (booking) => {
  if (!booking) return '';
  
  return `
    <section class="booking-info">
      <h2>예약 안내</h2>
      <div class="booking-details">
        <p><strong>예약 방법:</strong> ${booking.reservationMethod || '정보 없음'}</p>
        <p><strong>결제 방법:</strong></p>
        <ul>
          ${(booking.paymentMethods || []).map(method => `<li>${method}</li>`).join('')}
        </ul>
        <p><strong>확인 시간:</strong> ${booking.confirmationTime || '정보 없음'}</p>
        <p><strong>특별 요청:</strong> ${booking.specialRequests || '정보 없음'}</p>
      </div>
    </section>
  `;
};

/**
 * 공지사항을 HTML로 변환
 * @param {Array} notices - 공지사항 배열
 * @returns {string} HTML 문자열
 */
export const generateNoticesHtml = (notices) => {
  if (!notices || notices.length === 0) return '';
  
  const noticesHtml = notices.map(notice => `
    <div class="notice-item ${notice.type || 'general'}">
      <h3>${notice.title || '제목 없음'}</h3>
      <p>${notice.content || '내용 없음'}</p>
    </div>
  `).join('');
  
  return `
    <section class="notices">
      <h2>공지사항</h2>
      <div class="notices-list">
        ${noticesHtml}
      </div>
    </section>
  `;
};

/**
 * 전체 데이터를 HTML로 변환
 * @param {Object} data - 전체 데이터 객체
 * @returns {string} 완성된 HTML 문자열
 */
export const generateCompleteHtml = (data) => {
  if (!data) return '';
  
  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.hotel?.name || '호텔 정보'}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3, h4 {
          color: #2c3e50;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        
        h1 {
          font-size: 2.5em;
          text-align: center;
          border-bottom: 3px solid #3498db;
          padding-bottom: 15px;
        }
        
        h2 {
          font-size: 2em;
          border-left: 5px solid #3498db;
          padding-left: 15px;
        }
        
        h3 {
          font-size: 1.5em;
          color: #34495e;
        }
        
        h4 {
          font-size: 1.2em;
          color: #7f8c8d;
        }
        
        .hotel-info, .rooms-info, .facilities-info, .checkin-info,
        .packages-info, .pricing-info, .cancel-policy, .booking-info, .notices {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          background-color: #fafafa;
        }
        
        .hotel-details, .room-details, .package-details, .cancel-details,
        .booking-details {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          border: 1px solid #e9ecef;
        }
        
        .rooms-grid, .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .room-item, .package-item {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .facilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .facility-category {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .facility-category h4 {
          color: #3498db;
          margin-top: 0;
        }
        
        .facility-category ul {
          list-style-type: none;
          padding-left: 0;
        }
        
        .facility-category li {
          padding: 5px 0;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .facility-category li:before {
          content: "✓";
          color: #27ae60;
          font-weight: bold;
          margin-right: 10px;
        }
        
        .price-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }
        
        .price-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          border: 1px solid #e9ecef;
        }
        
        .day {
          font-weight: bold;
          color: #2c3e50;
        }
        
        .price {
          color: #e74c3c;
          font-weight: bold;
        }
        
        .day-types ul {
          list-style-type: none;
          padding-left: 0;
        }
        
        .day-types li {
          padding: 8px 0;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .notices-list {
          display: grid;
          gap: 20px;
        }
        
        .notice-item {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 5px solid #3498db;
        }
        
        .notice-item.important {
          border-left-color: #e74c3c;
          background-color: #fdf2f2;
        }
        
        .notice-item.warning {
          border-left-color: #f39c12;
          background-color: #fef9e7;
        }
        
        ul {
          padding-left: 20px;
        }
        
        li {
          margin-bottom: 5px;
        }
        
        strong {
          color: #2c3e50;
        }
        
        a {
          color: #3498db;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          
          .container {
            padding: 20px;
          }
          
          .rooms-grid, .packages-grid, .facilities-grid {
            grid-template-columns: 1fr;
          }
          
          .price-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${generateHotelHtml(data.hotel)}
        ${generateRoomsHtml(data.rooms)}
        ${generateFacilitiesHtml(data.facilities)}
        ${generateCheckinHtml(data.checkin)}
        ${generatePackagesHtml(data.packages)}
        ${generatePricingHtml(data.pricing)}
        ${generateCancelHtml(data.cancel)}
        ${generateBookingHtml(data.booking)}
        ${generateNoticesHtml(data.notices)}
      </div>
    </body>
    </html>
  `;
  
  return html;
};

/**
 * HTML 생성 성능 측정
 * @param {Function} generator - HTML 생성 함수
 * @param {Object} data - 데이터 객체
 * @returns {Object} 성능 측정 결과
 */
export const measureHtmlGeneration = (generator, data) => {
  const startTime = performance.now();
  const html = generator(data);
  const endTime = performance.now();
  
  return {
    html,
    generationTime: endTime - startTime,
    htmlSize: new Blob([html]).size,
    timestamp: new Date().toISOString()
  };
};
