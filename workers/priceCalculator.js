// 요금 계산 Web Worker
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'CALCULATE_TOTAL_PRICE':
      const totalPrice = calculateTotalPrice(data);
      self.postMessage({
        type: 'TOTAL_PRICE_CALCULATED',
        result: totalPrice
      });
      break;
      
    case 'GENERATE_PRICE_REPORT':
      const report = generatePriceReport(data);
      self.postMessage({
        type: 'PRICE_REPORT_GENERATED',
        result: report
      });
      break;
      
    case 'VALIDATE_PRICE_DATA':
      const validation = validatePriceData(data);
      self.postMessage({
        type: 'PRICE_DATA_VALIDATED',
        result: validation
      });
      break;
      
    case 'OPTIMIZE_PRICE_STRUCTURE':
      const optimization = optimizePriceStructure(data);
      self.postMessage({
        type: 'PRICE_STRUCTURE_OPTIMIZED',
        result: optimization
      });
      break;
      
    default:
      self.postMessage({
        type: 'ERROR',
        error: 'Unknown message type'
      });
  }
};

// 총 요금 계산
function calculateTotalPrice(priceData) {
  try {
    let total = 0;
    let breakdown = {};
    
    if (priceData.roomTypes) {
      priceData.roomTypes.forEach(roomType => {
        let roomTypeTotal = 0;
        
        if (roomType.types) {
          roomType.types.forEach(type => {
            let typeTotal = 0;
            
            if (type.prices) {
              Object.values(type.prices).forEach(periodPrices => {
                if (typeof periodPrices === 'object') {
                  Object.values(periodPrices).forEach(price => {
                    if (typeof price === 'number' && price > 0) {
                      typeTotal += price;
                    }
                  });
                }
              });
            }
            
            typeTotal = typeTotal || 0;
            typeTotal = Math.round(typeTotal);
            
            if (!breakdown[roomType.name]) {
              breakdown[roomType.name] = {};
            }
            breakdown[roomType.name][type.name] = typeTotal;
            roomTypeTotal += typeTotal;
          });
        }
        
        breakdown[roomType.name].total = roomTypeTotal;
        total += roomTypeTotal;
      });
    }
    
    return {
      total: Math.round(total),
      breakdown,
      currency: 'KRW',
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      total: 0,
      breakdown: {}
    };
  }
}

// 요금 보고서 생성
function generatePriceReport(priceData) {
  try {
    const report = {
      summary: {
        totalRoomTypes: priceData.roomTypes?.length || 0,
        totalPriceTypes: 0,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 }
      },
      details: [],
      recommendations: [],
      generatedAt: new Date().toISOString()
    };
    
    let allPrices = [];
    
    if (priceData.roomTypes) {
      priceData.roomTypes.forEach(roomType => {
        const roomTypeDetail = {
          name: roomType.name,
          types: [],
          totalPrice: 0
        };
        
        if (roomType.types) {
          report.summary.totalPriceTypes += roomType.types.length;
          
          roomType.types.forEach(type => {
            const typeDetail = {
              name: type.name,
              prices: {},
              totalPrice: 0
            };
            
            if (type.prices) {
              Object.entries(type.prices).forEach(([period, prices]) => {
                typeDetail.prices[period] = {};
                
                Object.entries(prices).forEach(([day, price]) => {
                  if (typeof price === 'number' && price > 0) {
                    typeDetail.prices[period][day] = price;
                    typeDetail.totalPrice += price;
                    allPrices.push(price);
                  }
                });
              });
            }
            
            typeDetail.totalPrice = Math.round(typeDetail.totalPrice);
            roomTypeDetail.totalPrice += typeDetail.totalPrice;
            roomTypeDetail.types.push(typeDetail);
          });
        }
        
        roomTypeDetail.totalPrice = Math.round(roomTypeDetail.totalPrice);
        report.details.push(roomTypeDetail);
      });
    }
    
    // 통계 계산
    if (allPrices.length > 0) {
      report.summary.averagePrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);
      report.summary.priceRange.min = Math.min(...allPrices);
      report.summary.priceRange.max = Math.max(...allPrices);
    }
    
    // 권장사항 생성
    if (report.summary.averagePrice > 100000) {
      report.recommendations.push('고급 패키지로 분류되어 프리미엄 가격 정책이 적합합니다.');
    } else if (report.summary.averagePrice > 50000) {
      report.recommendations.push('중급 패키지로 분류되어 균형잡힌 가격 정책이 적합합니다.');
    } else {
      report.recommendations.push('경제적 패키지로 분류되어 접근성 높은 가격 정책이 적합합니다.');
    }
    
    if (report.summary.totalRoomTypes > 5) {
      report.recommendations.push('다양한 객실 타입을 제공하여 고객 선택의 폭을 넓힐 수 있습니다.');
    }
    
    return report;
  } catch (error) {
    return {
      error: error.message,
      summary: {},
      details: [],
      recommendations: []
    };
  }
}

// 요금 데이터 검증
function validatePriceData(priceData) {
  const errors = [];
  const warnings = [];
  
  try {
    // 필수 필드 검증
    if (!priceData.title || priceData.title.trim() === '') {
      errors.push('리조트 타이틀이 필요합니다.');
    }
    
    if (!priceData.roomTypes || priceData.roomTypes.length === 0) {
      errors.push('최소 하나의 객실 타입이 필요합니다.');
    }
    
    // 객실 타입 검증
    if (priceData.roomTypes) {
      priceData.roomTypes.forEach((roomType, roomIndex) => {
        if (!roomType.name || roomType.name.trim() === '') {
          errors.push(`객실 타입 ${roomIndex + 1}의 이름이 필요합니다.`);
        }
        
        if (!roomType.types || roomType.types.length === 0) {
          errors.push(`객실 타입 '${roomType.name}'에 최소 하나의 타입이 필요합니다.`);
        }
        
        if (roomType.types) {
          roomType.types.forEach((type, typeIndex) => {
            if (!type.name || type.name.trim() === '') {
              errors.push(`타입 ${typeIndex + 1}의 이름이 필요합니다.`);
            }
            
            // 가격 검증
            if (type.prices) {
              let hasValidPrice = false;
              
              Object.values(type.prices).forEach(periodPrices => {
                if (typeof periodPrices === 'object') {
                  Object.values(periodPrices).forEach(price => {
                    if (typeof price === 'number' && price > 0) {
                      hasValidPrice = true;
                      
                      if (price > 1000000) {
                        warnings.push(`타입 '${type.name}'의 가격이 매우 높습니다: ${price.toLocaleString()}원`);
                      }
                    }
                  });
                }
              });
              
              if (!hasValidPrice) {
                warnings.push(`타입 '${type.name}'에 유효한 가격이 설정되지 않았습니다.`);
              }
            }
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
      warnings: [],
      validatedAt: new Date().toISOString()
    };
  }
}

// 가격 구조 최적화
function optimizePriceStructure(priceData) {
  try {
    const optimization = {
      suggestions: [],
      priceAdjustments: [],
      marketAnalysis: {},
      optimizedAt: new Date().toISOString()
    };
    
    // 가격 일관성 분석
    if (priceData.roomTypes) {
      const allPrices = [];
      const roomTypePrices = {};
      
      priceData.roomTypes.forEach(roomType => {
        roomTypePrices[roomType.name] = [];
        
        if (roomType.types) {
          roomType.types.forEach(type => {
            if (type.prices) {
              Object.values(type.prices).forEach(periodPrices => {
                if (typeof periodPrices === 'object') {
                  Object.values(periodPrices).forEach(price => {
                    if (typeof price === 'number' && price > 0) {
                      allPrices.push(price);
                      roomTypePrices[roomType.name].push(price);
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      // 가격 분포 분석
      if (allPrices.length > 0) {
        const sortedPrices = allPrices.sort((a, b) => a - b);
        const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
        const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
        const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
        
        optimization.marketAnalysis = {
          totalPrices: allPrices.length,
          averagePrice: Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length),
          medianPrice: median,
          priceRange: {
            min: sortedPrices[0],
            max: sortedPrices[sortedPrices.length - 1],
            q1,
            q3
          }
        };
        
        // 이상치 감지
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const outliers = allPrices.filter(price => price < lowerBound || price > upperBound);
        
        if (outliers.length > 0) {
          optimization.suggestions.push(`${outliers.length}개의 가격이 이상치로 감지되었습니다. 가격 일관성을 검토해주세요.`);
        }
        
        // 가격 조정 제안
        priceData.roomTypes.forEach(roomType => {
          if (roomType.types) {
            roomType.types.forEach(type => {
              if (type.prices) {
                Object.entries(type.prices).forEach(([period, prices]) => {
                  Object.entries(prices).forEach(([day, price]) => {
                    if (typeof price === 'number' && price > 0) {
                      const priceRatio = price / median;
                      
                      if (priceRatio > 2) {
                        optimization.priceAdjustments.push({
                          roomType: roomType.name,
                          type: type.name,
                          period,
                          day,
                          currentPrice: price,
                          suggestedPrice: Math.round(median * 1.5),
                          reason: '가격이 중간값 대비 2배 이상 높습니다.'
                        });
                      } else if (priceRatio < 0.5) {
                        optimization.priceAdjustments.push({
                          roomType: roomType.name,
                          type: type.name,
                          period,
                          day,
                          currentPrice: price,
                          suggestedPrice: Math.round(median * 0.8),
                          reason: '가격이 중간값 대비 절반 이하로 낮습니다.'
                        });
                      }
                    }
                  });
                });
              }
            });
          }
        });
      }
    }
    
    // 시장 경쟁력 분석
    if (optimization.marketAnalysis.averagePrice > 80000) {
      optimization.suggestions.push('평균 가격이 높아 프리미엄 시장을 타겟팅하는 것이 적합합니다.');
    } else if (optimization.marketAnalysis.averagePrice < 30000) {
      optimization.suggestions.push('평균 가격이 낮아 대중 시장을 타겟팅하는 것이 적합합니다.');
    }
    
    return optimization;
  } catch (error) {
    return {
      error: error.message,
      suggestions: [],
      priceAdjustments: [],
      marketAnalysis: {},
      optimizedAt: new Date().toISOString()
    };
  }
}
