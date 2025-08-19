// 호텔, 객실, 가격, 취소정책 등의 HTML 생성 기능을 모듈화한 파일
// 이 파일은 page.js에서 불필요한 코드를 정리하기 위해 만들어졌습니다.

// 호텔 정보 HTML 생성
export const generateHotelInfoHtml = (hotelInfo) => {
  if (!hotelInfo) return '';
  
  return `
    <div class="hotel-info">
      <h1 class="hotel-name">${hotelInfo.name || ''}</h1>
      <p class="hotel-address">${hotelInfo.address || ''}</p>
      ${hotelInfo.image ? `<img src="${hotelInfo.image}" alt="${hotelInfo.name || '호텔'}" class="hotel-image" />` : ''}
      <p class="hotel-description">${hotelInfo.description ? hotelInfo.description.replace(/\n/g, '<br>') : ''}</p>
    </div>
  `;
};

// 객실 정보 HTML 생성
export const generateRoomInfoHtml = (roomInfo) => {
  if (!roomInfo || roomInfo.length === 0) return '';
  
  const roomsHtml = roomInfo.map(room => `
    <div class="room-info-section">
      <h3 class="room-name">${room.name || ''}</h3>
      ${room.type ? `<p class="room-type">타입: ${room.type}</p>` : ''}
      ${room.standardCapacity ? `<p class="room-capacity">기준인원: ${room.standardCapacity}인</p>` : ''}
      ${room.maxCapacity ? `<p class="room-max-capacity">최대인원: ${room.maxCapacity}인</p>` : ''}
      ${room.image ? `<img src="${room.image}" alt="${room.name || '객실'}" class="room-image" />` : ''}
      ${room.description ? `<p class="room-description">${room.description.replace(/\n/g, '<br>')}</p>` : ''}
      ${room.amenities && room.amenities.length > 0 ? `
        <div class="room-amenities">
          <h4>객실 편의시설</h4>
          <ul>
            ${room.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <div class="rooms-container">
      <h2 class="info-title">객실 정보</h2>
      ${roomsHtml}
    </div>
  `;
};

// 가격 정보 HTML 생성
export const generatePriceInfoHtml = (priceInfo) => {
  if (!priceInfo || !priceInfo.lodges) return '';
  
  let priceInfoHtml = '';
  
  // 추가요금 정보 먼저 표시
  if (priceInfo.additionalChargesInfo) {
    priceInfoHtml += `
      <div class="additional-charges-info">
        <p>${priceInfo.additionalChargesInfo.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }
  
  // 각 숙소별 가격표 생성
  priceInfo.lodges.forEach(lodge => {
    if (!lodge || !lodge.rooms || lodge.rooms.length === 0) return;
    
    priceInfoHtml += `
      <div class="lodge-price-section">
        ${lodge.name ? `<h3 class="lodge-name">${lodge.name}</h3>` : ''}
      
        <div class="price-tables">
    `;
    
    // 객실별 가격표 생성
    lodge.rooms.forEach(room => {
      if (!room || !room.viewTypes || room.viewTypes.length === 0) {
        if (room && room.price && priceInfo.dayTypes && priceInfo.dayTypes.length > 0) {
          priceInfoHtml += `
            <div class="room-price-table">
              <h4 class="room-type">${room.roomType || '객실'}</h4>
              <table class="price-table">
                <thead>
                  <tr>
                    <th>숙소명</th>
                    <th>객실 유형</th>
                    <th>전망</th>
                    ${priceInfo.dayTypes.map(day => `<th>${day.name}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${lodge.name || ''}</td>
                    <td>${room.roomType || ''}</td>
                    <td>${room.view || '-'}</td> 
                    ${priceInfo.dayTypes.map(day => {
                      const price = room.price && room.price[day.id] ? room.price[day.id] : (room.price && room.price[day.type] ? room.price[day.type] : '-');
                      return `<td>${price !== '-' ? (typeof price === 'object' ? (price.price !== undefined ? Number(price.price).toLocaleString() + '원' : '-') : Number(price).toLocaleString() + '원') : '-'}</td>`;
                    }).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
          `;
        }
        return;
      }
      
      priceInfoHtml += `
        <div class="room-price-table">
          <h4 class="room-type">${room.roomType || '객실'}</h4>
          <table class="price-table">
            <thead>
              <tr>
                <th>숙소명</th>
                <th>객실 유형</th>
                <th>전망</th>
                ${priceInfo.dayTypes.map(day => `<th>${day.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
      `;
      
      // 각 전망별 가격 행 생성
      room.viewTypes.forEach(viewType => {
        priceInfoHtml += `
          <tr>
            <td>${lodge.name || ''}</td>
            <td>${room.roomType || ''}</td>
            <td>${viewType.name || ''}</td>
            ${priceInfo.dayTypes.map(day => {
              const priceKey = day.id || day.type;
              const price = viewType.prices && viewType.prices[priceKey] ? viewType.prices[priceKey] : '-';
              const displayPrice = typeof price === 'object' && price.price !== undefined ? price.price : price;
              return `<td>${displayPrice !== '-' ? Number(displayPrice).toLocaleString() + '원' : '-'}</td>`;
            }).join('')}
          </tr>
        `;
      });
      
      priceInfoHtml += `
            </tbody>
          </table>
        </div>
      `;
    });
    
    priceInfoHtml += `
        </div>
      </div>
    `;
  });
  
  return `
    <div class="price-info">
      <h2 class="info-title">가격 정보</h2>
      ${priceInfoHtml}
    </div>
  `;
};

// 취소 규정 HTML 생성
export const generateCancelInfoHtml = (cancelInfo, cancelDescription) => {
  if (!cancelInfo) return '';
  
  return `
    <div class="cancel-info">
      <h2 class="info-title">취소 규정</h2>
      ${cancelDescription ? `<p class="cancel-description">${cancelDescription}</p>` : ''}
      
      <!-- 취소 규정 테이블 형식 -->
      <div class="cancel-policy-table-section">
        ${(cancelInfo.beforeCheckIn && cancelInfo.beforeCheckIn.length > 0) || (cancelInfo.afterCheckIn && cancelInfo.afterCheckIn.length > 0) ? `
          <h3>취소/환불 규정</h3>
          <table class="cancel-policy-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 60%;">취소 시점</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 40%;">환불 비율</th>
              </tr>
            </thead>
            <tbody>
              ${(cancelInfo.beforeCheckIn || []).map(rule => 
                `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${rule.days || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${rule.rate || '-'}</td>
                </tr>`
              ).join('')}
              ${(cancelInfo.afterCheckIn || []).map(rule => 
                `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${rule.days || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${rule.rate || '-'}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
      
      <!-- 비수기/성수기 취소 규정 테이블 -->
      ${cancelInfo.offSeason && cancelInfo.offSeason.length > 0 ? `
        <div class="cancel-policy-table-section">
          <h3>비수기 취소 규정</h3>
          <table class="cancel-policy-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 60%;">취소 시점</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 40%;">환불 비율</th>
              </tr>
            </thead>
            <tbody>
              ${cancelInfo.offSeason.map(rule => 
                `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${rule.days || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${rule.rate || '-'}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${cancelInfo.highSeason && cancelInfo.highSeason.length > 0 ? `
        <div class="cancel-policy-table-section">
          <h3>성수기 취소 규정</h3>
          <table class="cancel-policy-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 60%;">취소 시점</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 40%;">환불 비율</th>
              </tr>
            </thead>
            <tbody>
              ${cancelInfo.highSeason.map(rule => 
                `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${rule.days || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${rule.rate || '-'}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${cancelInfo.additionalPolicy ? `
        <div class="additional-policy">
          <h3>추가 취소 정책</h3>
          <p>${cancelInfo.additionalPolicy.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// 시설 정보 HTML 생성
export const generateFacilitiesInfoHtml = (facilitiesInfo) => {
  if (!facilitiesInfo || facilitiesInfo.length === 0) return '';
  
  const facilitiesHtml = facilitiesInfo.map(facility => `
    <div class="facility-item">
      <h3 class="facility-name">${facility.name || ''}</h3>
      <p class="facility-description">${facility.description ? facility.description.replace(/\n/g, '<br>') : ''}</p>
    </div>
  `).join('');
  
  return `
    <div class="facilities-container">
      <h2 class="info-title">부대시설 안내</h2>
      ${facilitiesHtml}
    </div>
  `;
};

// 체크인/아웃 정보 HTML 생성
export const generateCheckinInfoHtml = (checkinInfo) => {
  if (!checkinInfo) return '';
  
  return `
    <div class="checkin-info">
      <h2 class="info-title">체크인/체크아웃 안내</h2>
      <div class="checkin-times">
        <p class="checkin-time"><strong>체크인:</strong> ${checkinInfo.checkInTime || ''}</p>
        <p class="checkout-time"><strong>체크아웃:</strong> ${checkinInfo.checkOutTime || ''}</p>
      </div>
      ${checkinInfo.additionalInfo ? `
        <div class="checkin-additional-info">
          <p>${checkinInfo.additionalInfo.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// 패키지 정보 HTML 생성
export const generatePeriodInfoHtml = (periodInfo) => {
  if (!periodInfo) return '';
  
  return `
    <div class="period-info">
      <h2 class="info-title">패키지 정보</h2>
      
      <div class="package-dates">
        <p class="sale-period"><strong>판매 기간:</strong> ${periodInfo.saleStartDate || ''} ~ ${periodInfo.saleEndDate || ''}</p>
        <p class="stay-period"><strong>숙박 기간:</strong> ${periodInfo.stayStartDate || ''} ~ ${periodInfo.stayEndDate || ''}</p>
      </div>
      
      <div class="package-details">
        <h3>${periodInfo.packageName || '패키지명'}</h3>
        <p class="package-composition">${periodInfo.packageComposition || ''}</p>
        <p class="package-features">${periodInfo.packageFeatures || ''}</p>
        ${periodInfo.packagePrice ? `<p class="package-price"><strong>패키지 가격:</strong> ${Number(periodInfo.packagePrice).toLocaleString()}원</p>` : ''}
        ${periodInfo.roomOnlyPrice ? `<p class="room-only-price"><strong>객실만:</strong> ${Number(periodInfo.roomOnlyPrice).toLocaleString()}원</p>` : ''}
        ${periodInfo.basicInfo ? `<p class="basic-info">${periodInfo.basicInfo}</p>` : ''}
      </div>
      
      ${periodInfo.additionalInfo ? `
        <div class="period-additional-info">
          <p>${periodInfo.additionalInfo.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// 예약 정보 HTML 생성
export const generateBookingInfoHtml = (bookingInfo) => {
  if (!bookingInfo) return '';
  
  return `
    <div class="booking-info">
      <h2 class="info-title">예약 안내</h2>
      <div class="booking-content">
        <p>${bookingInfo.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
  `;
};

// 공지사항 HTML 생성
export const generateNoticeInfoHtml = (noticeInfo) => {
  if (!noticeInfo) return '';
  
  return `
    <div class="notice-info">
      <h2 class="info-title">${noticeInfo.title || '안내사항'}</h2>
      <div class="notice-content">
        <p>${noticeInfo.content ? noticeInfo.content.replace(/\n/g, '<br>') : ''}</p>
      </div>
    </div>
  `;
};

// 모든 HTML 조합
export const generateFullHotelHtml = (data) => {
  const {
    hotelInfo,
    roomInfo,
    priceInfo,
    cancelInfo,
    facilitiesInfo,
    checkinInfo,
    periodInfo,
    bookingInfo,
    noticeInfo,
    cancelDescription
  } = data;
  
  const htmlParts = [];
  
  if (hotelInfo) {
    htmlParts.push(generateHotelInfoHtml(hotelInfo));
  }
  
  if (roomInfo && roomInfo.length > 0) {
    htmlParts.push(generateRoomInfoHtml(roomInfo));
  }
  
  if (facilitiesInfo && facilitiesInfo.length > 0) {
    htmlParts.push(generateFacilitiesInfoHtml(facilitiesInfo));
  }
  
  if (checkinInfo) {
    htmlParts.push(generateCheckinInfoHtml(checkinInfo));
  }
  
  if (periodInfo) {
    htmlParts.push(generatePeriodInfoHtml(periodInfo));
  }
  
  if (priceInfo && priceInfo.lodges) {
    htmlParts.push(generatePriceInfoHtml(priceInfo));
  }
  
  if (cancelInfo) {
    htmlParts.push(generateCancelInfoHtml(cancelInfo, cancelDescription));
  }
  
  if (bookingInfo) {
    htmlParts.push(generateBookingInfoHtml(bookingInfo));
  }
  
  if (noticeInfo) {
    htmlParts.push(generateNoticeInfoHtml(noticeInfo));
  }
  
  // 전체 HTML 조합
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${hotelInfo ? hotelInfo.name : '호텔 정보'}</title>
  <style>
    body {
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    h1, h2, h3, h4 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 {
      font-size: 1.8em;
      color: #222;
    }
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.3em;
      color: #444;
    }
    h3 {
      font-size: 1.3em;
      color: #555;
    }
    p {
      margin: 0.5em 0;
    }
    img {
      max-width: 100%;
      height: auto;
      margin: 1em 0;
      border-radius: 4px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
    .hotel-info, .rooms-container, .price-info, .cancel-info, .facilities-container,
    .checkin-info, .booking-info, .notice-info, .period-info {
      margin-bottom: 2em;
    }
    .room-info-section, .facility-item {
      margin-bottom: 1.5em;
      padding-bottom: 1em;
      border-bottom: 1px dashed #eee;
    }
    .room-info-section:last-child, .facility-item:last-child {
      border-bottom: none;
    }
    .price-table {
      font-size: 0.9em;
    }
    .cancel-policy-table {
      font-size: 0.9em;
    }
    .additional-charges-info, .additional-policy {
      background-color: #f9f9f9;
      padding: 10px 15px;
      border-radius: 4px;
      margin: 1em 0;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="hotel-detail-container">
    ${htmlParts.join('\n\n')}
  </div>
</body>
</html>
  `.trim();
}; 