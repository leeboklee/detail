/**
 * 미리보기 모듈 (PreviewManager) - 개선된 버전 (div 기반)
 * 
 * 기능:
 * - 호텔, 객실, 패키지, 가격, 취소정책 등의 정보 미리보기
 * - div 기반 렌더링 (iframe 대신)
 * - 데이터 수집 및 HTML 렌더링
 * - 버튼 이벤트 처리
 * - 로딩 상태 및 에러 처리
 * - 성능 최적화
 * - 서버 로그 오류 처리
 * 
 * 의존성:
 * - UICore: 전체 UI 모듈 관리
 * - UICommon: 공통 UI 기능
 * - HotelApp: 데이터 관리
 */

'use client';

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../hooks/useAppState';

const Preview = React.memo(({ data: propData, activeTab: propActiveTab } = {}) => {
  // prefer props from parent; fall back to hook state if not provided
  const { data: stateData } = useAppState();
  const data = propData || stateData;
  const activeTab = propActiveTab || 'hotel';
  const previewRef = useRef(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // 모든 데이터를 평면화하여 확인
  const allData = useMemo(() => {
    const flatData = {};
    
    // hotel 데이터
    if (data?.hotel) {
      Object.entries(data.hotel).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          flatData[`hotel_${key}`] = value;
        }
      });
    }
    
    // rooms 데이터
    if (data?.rooms && Array.isArray(data.rooms)) {
      data.rooms.forEach((room, index) => {
        if (room && typeof room === 'object') {
          Object.entries(room).forEach(([key, value]) => {
            if (value && value.toString().trim()) {
              flatData[`room${index + 1}_${key}`] = value;
            }
          });
        }
      });
    }
    
    // facilities 데이터
    if (data?.facilities) {
      Object.entries(data.facilities).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          flatData[`facility_${category}`] = items.join(', ');
        }
      });
    }
    
    // packages 데이터
    if (data?.packages && Array.isArray(data.packages)) {
      data.packages.forEach((pkg, index) => {
        if (pkg && typeof pkg === 'object') {
          Object.entries(pkg).forEach(([key, value]) => {
            if (value && value.toString().trim()) {
              flatData[`package${index + 1}_${key}`] = value;
            }
          });
        }
      });
    }
    
    // bookingInfo 데이터
    if (data?.bookingInfo) {
      Object.entries(data.bookingInfo).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          flatData[`booking_${key}`] = value;
        }
      });
    }
    
    return flatData;
  }, [data]);

  const hasData = Object.keys(allData).length > 0;
  
  console.log('[Preview] Data analysis:', {
    hasData,
    allData,
    dataKeys: Object.keys(data || {}),
    activeTab,
    hotelData: data?.hotel,
    roomsData: data?.rooms,
    facilitiesData: data?.facilities,
    packagesData: data?.packages,
    bookingInfoData: data?.bookingInfo
  });

  const previewContent = useMemo(() => {
    const sectionData = activeTab === 'booking' ? data.bookingInfo : data[activeTab];
    
    console.log('[Preview] Generating content for:', {
      activeTab,
      sectionData,
      hasSectionData: !!sectionData,
      sectionDataKeys: sectionData ? Object.keys(sectionData) : [],
      sectionDataValues: sectionData ? Object.values(sectionData) : []
    });

    // 데이터가 없거나 빈 객체인 경우 처리
    if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) {
      return `
        <div style="padding: 30px; color: #333; text-align: center; font-size: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 24px; margin-bottom: 15px;">🛈</div>
          <div style="font-weight: 600; margin-bottom: 10px; color: #2c3e50;">미리보기 내용이 없습니다</div>
          <div style="color: #6c757d; font-size: 14px; line-height: 1.5;">해당 섹션의 정보를 입력한 뒤 생성 버튼을 눌러주세요.</div>
          <div style="margin-top: 20px; padding: 10px; background: #e3f2fd; border-radius: 6px; border: 1px solid #90caf9; color: #1565c0; font-size: 12px;">💡 현재 탭: ${activeTab || '호텔 정보'}</div>
          <div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7; color: #856404; font-size: 11px;">
            디버그: sectionData = ${JSON.stringify(sectionData)}
          </div>
        </div>
      `;
    }

    // 섹션별 미리보기 템플릿
    switch (activeTab) {
      case 'hotel': {
        const h = sectionData;
        return `
          <div style="padding:20px;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="display: grid; gap: 16px;">
              <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 24px; height: 24px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                    <span style="color: white; font-size: 12px;">🏷️</span>
                  </div>
                  <div style="font-weight: 600; color: #1e293b;">호텔명</div>
                </div>
                <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px;">${h.name || '호텔명을 입력해주세요'}</div>
              </div>
              
              <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 24px; height: 24px; background: #10b981; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                    <span style="color: white; font-size: 12px;">📍</span>
                  </div>
                  <div style="font-weight: 600; color: #1e293b;">주소</div>
                </div>
                <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px;">${h.address || '주소를 입력해주세요'}</div>
              </div>
              
              <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 24px; height: 24px; background: #f59e0b; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                    <span style="color: white; font-size: 12px;">📝</span>
                  </div>
                  <div style="font-weight: 600; color: #1e293b;">설명</div>
                </div>
                <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px; line-height: 1.6;">${h.description || '호텔 설명을 입력해주세요'}</div>
              </div>
              
              ${h.phone ? `
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 24px; height: 24px; background: #8b5cf6; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                      <span style="color: white; font-size: 12px;">📞</span>
                    </div>
                    <div style="font-weight: 600; color: #1e293b;">전화번호</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px;">${h.phone}</div>
                </div>
              ` : ''}
              
              ${h.email ? `
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 24px; height: 24px; background: #ef4444; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                      <span style="color: white; font-size: 12px;">✉️</span>
                    </div>
                    <div style="font-weight: 600; color: #1e293b;">이메일</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px;">${h.email}</div>
                </div>
              ` : ''}
              
              ${h.website ? `
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 24px; height: 24px; background: #06b6d4; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                      <span style="color: white; font-size: 12px;">🌐</span>
                    </div>
                    <div style="font-weight: 600; color: #1e293b;">웹사이트</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; font-size: 15px;">
                    <a href="${h.website}" target="_blank" style="color: #3b82f6; text-decoration: none;">${h.website}</a>
                  </div>
                </div>
              ` : ''}
              
              ${h.imageUrl ? `
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 24px; height: 24px; background: #f97316; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                      <span style="color: white; font-size: 12px;">🖼️</span>
                    </div>
                    <div style="font-weight: 600; color: #1e293b;">호텔 이미지</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                    <img src="${h.imageUrl}" alt="호텔 이미지" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display: none; color: #6b7280; font-size: 14px; text-align: center; padding: 20px;">이미지를 불러올 수 없습니다</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      case 'rooms': {
        // rooms 데이터 구조 처리: data.rooms가 배열이거나 { rooms: [] } 구조일 수 있음
        let rooms = [];
        if (Array.isArray(data.rooms)) {
          rooms = data.rooms;
        } else if (data.rooms && Array.isArray(data.rooms.rooms)) {
          rooms = data.rooms.rooms;
        } else if (sectionData && Array.isArray(sectionData.rooms)) {
          rooms = sectionData.rooms;
        }
        
        return `
          <div style="padding:20px;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

            
            ${rooms.length === 0 ? `
              <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1;">
                <div style="font-size: 48px; margin-bottom: 16px;">🏨</div>
                <div style="font-size: 18px; font-weight: 600; color: #475569; margin-bottom: 8px;">등록된 객실이 없습니다</div>
                <div style="color: #64748b; font-size: 14px;">객실 정보를 추가하면 여기에 미리보기가 표시됩니다</div>
              </div>
            ` : `
              <div style="display: grid; gap: 16px;">
                ${rooms.map((r, index) => `
                  <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s ease;">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <span style="color: white; font-size: 14px; font-weight: 600;">${index + 1}</span>
                      </div>
                      <div>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">${r.name || r.type || '이름 없음'}</h3>
                        <div style="color: #64748b; font-size: 14px; margin-top: 2px;">객실 정보</div>
                      </div>
                    </div>
                    
                    ${r.description ? `
                      <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; color: #374151; line-height: 1.5;">
                        ${r.description}
                      </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                      ${r.structure ? `
                        <div style="display: flex; align-items: center; padding: 8px 12px; background: #fef3c7; border-radius: 6px;">
                          <span style="margin-right: 8px; font-size: 16px;">🏗️</span>
                          <div>
                            <div style="font-size: 12px; color: #92400e; font-weight: 600;">구조</div>
                            <div style="font-size: 14px; color: #374151;">${r.structure}</div>
                          </div>
                        </div>
                      ` : ''}
                      
                      ${r.bedType ? `
                        <div style="display: flex; align-items: center; padding: 8px 12px; background: #dbeafe; border-radius: 6px;">
                          <span style="margin-right: 8px; font-size: 16px;">🛏️</span>
                          <div>
                            <div style="font-size: 12px; color: #1e40af; font-weight: 600;">베드 타입</div>
                            <div style="font-size: 14px; color: #374151;">${r.bedType}</div>
                          </div>
                        </div>
                      ` : ''}
                      
                      ${r.view ? `
                        <div style="display: flex; align-items: center; padding: 8px 12px; background: #dcfce7; border-radius: 6px;">
                          <span style="margin-right: 8px; font-size: 16px;">🌅</span>
                          <div>
                            <div style="font-size: 12px; color: #166534; font-weight: 600;">전망</div>
                            <div style="font-size: 14px; color: #374151;">${r.view}</div>
                          </div>
                        </div>
                      ` : ''}
                      
                      ${r.standardCapacity ? `
                        <div style="display: flex; align-items: center; padding: 8px 12px; background: #f3e8ff; border-radius: 6px;">
                          <span style="margin-right: 8px; font-size: 16px;">👥</span>
                          <div>
                            <div style="font-size: 12px; color: #7c3aed; font-weight: 600;">기본 인원</div>
                            <div style="font-size: 14px; color: #374151;">${r.standardCapacity}명</div>
                          </div>
                        </div>
                      ` : ''}
                      
                      ${r.maxCapacity ? `
                        <div style="display: flex; align-items: center; padding: 8px 12px; background: #fef2f2; border-radius: 6px;">
                          <span style="margin-right: 8px; font-size: 16px;">👨‍👩‍👧‍👦</span>
                          <div>
                            <div style="font-size: 12px; color: #dc2626; font-weight: 600;">최대 인원</div>
                            <div style="font-size: 14px; color: #374151;">${r.maxCapacity}명</div>
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      }
      case 'packages': {
        // 패키지 데이터 구조 처리: data.packages가 배열이거나 다른 구조일 수 있음
        let pkgs = [];
        if (Array.isArray(data.packages)) {
          pkgs = data.packages;
        } else if (data.packages && Array.isArray(data.packages.packages)) {
          pkgs = data.packages.packages;
        } else if (sectionData && Array.isArray(sectionData.packages)) {
          pkgs = sectionData.packages;
        } else if (sectionData && Array.isArray(sectionData)) {
          pkgs = sectionData;
        }
        
        console.log('[Preview] 패키지 데이터 분석:', {
          dataPackages: data.packages,
          sectionData: sectionData,
          pkgs: pkgs,
          pkgsLength: pkgs.length
        });
        
        return `
          <div style="padding:20px;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);min-height:100vh;">
            ${pkgs.length === 0 ? `
              <div style="text-align: center; padding: 60px 40px; background: rgba(255,255,255,0.95); border-radius: 20px; border: 2px dashed #cbd5e1; backdrop-filter: blur(10px);">
                <div style="font-size: 64px; margin-bottom: 24px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📦</div>
                <div style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">등록된 패키지가 없습니다</div>
                <div style="color: #64748b; font-size: 16px; line-height: 1.6;">패키지 정보를 추가하면 여기에 아름다운 미리보기가 표시됩니다</div>
              </div>
            ` : `
              <div style="display: grid; gap: 24px;">
                ${pkgs.map((p, index) => `
                  <div style="background: rgba(255,255,255,0.95); padding: 0; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.1); backdrop-filter: blur(10px); overflow: hidden; transition: all 0.3s ease; position: relative;">
                    <!-- 헤더 그라데이션 -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; color: white; position: relative;">
                      <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30px, -30px);"></div>
                      <div style="position: absolute; bottom: 0; left: 0; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-20px, 20px);"></div>
                      
                      <div style="display: flex; align-items: center; margin-bottom: 16px; position: relative; z-index: 1;">
                        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; backdrop-filter: blur(10px);">
                          <span style="color: white; font-size: 20px; font-weight: 700;">${index + 1}</span>
                        </div>
                        <div>
                          <h3 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${p.name || '패키지명'}</h3>
                          <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px; font-weight: 500;">✨ 특별 패키지</div>
                        </div>
                      </div>
                      
                      ${p.price ? `
                        <div style="background: rgba(255,255,255,0.2); padding: 12px 16px; border-radius: 12px; backdrop-filter: blur(10px); position: relative; z-index: 1;">
                          <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                              <div style="font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 4px;">💰 가격</div>
                              <div style="font-size: 20px; color: white; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${p.price.toLocaleString()}원</div>
                            </div>
                            <div style="font-size: 32px; opacity: 0.3;">💎</div>
                          </div>
                        </div>
                      ` : ''}
                    </div>
                    
                    <!-- 본문 내용 -->
                    <div style="padding: 24px;">
                      ${p.description ? `
                        <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 12px; color: #374151; line-height: 1.6; border-left: 4px solid #667eea;">
                          <div style="font-size: 14px; color: #667eea; font-weight: 600; margin-bottom: 8px;">📝 패키지 설명</div>
                          <div style="font-size: 15px;">${p.description}</div>
                        </div>
                      ` : ''}
                      
                      <!-- 기간 정보 -->
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
                        ${p.salesPeriod && (p.salesPeriod.start || p.salesPeriod.end) ? `
                          <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 16px; border-radius: 12px; border: 1px solid #93c5fd;">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                              <span style="margin-right: 8px; font-size: 18px;">📅</span>
                              <div style="font-size: 13px; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">판매기간</div>
                            </div>
                            <div style="font-size: 15px; color: #1e293b; font-weight: 600;">${p.salesPeriod.start || ''} ~ ${p.salesPeriod.end || ''}</div>
                          </div>
                        ` : ''}
                        
                        ${p.stayPeriod && (p.stayPeriod.start || p.stayPeriod.end) ? `
                          <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 16px; border-radius: 12px; border: 1px solid #86efac;">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                              <span style="margin-right: 8px; font-size: 18px;">🏨</span>
                              <div style="font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">투숙기간</div>
                            </div>
                            <div style="font-size: 15px; color: #1e293b; font-weight: 600;">${p.stayPeriod.start || ''} ~ ${p.stayPeriod.end || ''}</div>
                          </div>
                        ` : ''}
                      </div>
                      
                      ${p.productComposition ? `
                        <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 12px; border: 1px solid #c4b5fd; position: relative;">
                          <div style="position: absolute; top: -8px; left: 20px; background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">🎁 상품구성</div>
                          <div style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 12px;">${p.productComposition}</div>
                        </div>
                      ` : ''}
                      
                      ${p.includes && p.includes.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                          <div style="font-size: 14px; color: #7c3aed; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🎯 포함사항</div>
                          <div style="display: flex; flex-wrap: gap: 8px;">
                            ${p.includes.map(include => `
                              <span style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: #3730a3; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid #a5b4fc; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                ✨ ${include}
                              </span>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                      
                      ${p.notes && p.notes.length > 0 ? `
                        <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 12px; border: 1px solid #fca5a5; position: relative;">
                          <div style="position: absolute; top: -8px; left: 20px; background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ 유의사항</div>
                          <div style="color: #374151; font-size: 14px; line-height: 1.6; margin-top: 12px;">
                            ${p.notes.map(note => `<div style="margin-bottom: 6px;">• ${note}</div>`).join('')}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      }
      case 'facilities': {
        const facilities = data.facilities || {};
        const totalFacilities = Object.values(facilities).flat().length;
        return `
          <div style="padding:20px;">
            <h3 style="margin-top:0">시설 정보 미리보기 (총 ${totalFacilities}개)</h3>
            ${totalFacilities === 0 ? '<div>등록된 시설이 없습니다.</div>' : Object.entries(facilities).map(([category, items]) => `
              <div style="margin-bottom:12px;padding:12px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
                <div style="font-weight:600;color:#0369a1;">${category === 'general' ? '일반 시설' : category === 'business' ? '비즈니스 시설' : category === 'leisure' ? '레저 시설' : '식음료 시설'} (${items.length}개)</div>
                <div style="color:#666;font-size:12px;margin-top:4px;">${items.join(', ')}</div>
              </div>
            `).join('')}
          </div>
        `;
      }
      case 'checkin': {
        const checkin = data.checkin || {};
        return `
          <div style="padding:20px;">
            <h3 style="margin-top:0">체크인/아웃 정보 미리보기</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="padding:12px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
                <div style="font-weight:600;color:#0369a1;">체크인 시간</div>
                <div style="color:#666;">${checkin.checkInTime || '미설정'}</div>
              </div>
              <div style="padding:12px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
                <div style="font-weight:600;color:#0369a1;">체크아웃 시간</div>
                <div style="color:#666;">${checkin.checkOutTime || '미설정'}</div>
              </div>
              ${checkin.earlyCheckIn ? `
                <div style="padding:12px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
                  <div style="font-weight:600;color:#d97706;">얼리 체크인</div>
                  <div style="color:#666;">${checkin.earlyCheckIn}</div>
                </div>
              ` : ''}
              ${checkin.lateCheckOut ? `
                <div style="padding:12px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
                  <div style="font-weight:600;color:#d97706;">레이트 체크아웃</div>
                  <div style="color:#666;">${checkin.lateCheckOut}</div>
                </div>
              ` : ''}
              ${checkin.checkInLocation ? `
                <div style="padding:12px;border-radius:8px;background:#f3e8ff;border:1px solid #c4b5fd;">
                  <div style="font-weight:600;color:#7c3aed;">체크인 장소</div>
                  <div style="color:#666;">${checkin.checkInLocation}</div>
                </div>
              ` : ''}
              ${checkin.checkOutLocation ? `
                <div style="padding:12px;border-radius:8px;background:#f3e8ff;border:1px solid #c4b5fd;">
                  <div style="font-weight:600;color:#7c3aed;">체크아웃 장소</div>
                  <div style="color:#666;">${checkin.checkOutLocation}</div>
                </div>
              ` : ''}
            </div>
            ${checkin.specialInstructions ? `
              <div style="margin-top:16px;padding:12px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;">
                <div style="font-weight:600;color:#166534;">특별 안내사항</div>
                <div style="color:#666;">${checkin.specialInstructions}</div>
              </div>
            ` : ''}
          </div>
        `;
      }
      case 'pricing': {
        const pricing = data.pricing || {};
        const priceTable = pricing.priceTable || {};
        const roomTypes = priceTable.roomTypes || [];
        

        
        return `
          <div style="padding:20px;">
            <div style="margin-bottom:16px;padding:12px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
              <div style="font-weight:600;color:#0369a1;">결제 대표요금</div>
              <div style="color:#666;">${pricing.title || '미설정'}</div>
            </div>
            
            <div style="margin-bottom:16px;padding:12px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
              <div style="font-weight:600;color:#d97706;">추가요금표</div>
              <div style="color:#666;margin-top:8px;">
                <div><strong>제목:</strong> ${priceTable.title || '미설정'}</div>
                <div><strong>기간:</strong> ${priceTable.period || '미설정'}</div>
              </div>
            </div>
            
            ${roomTypes.length > 0 ? `
              <div style="margin-bottom:16px;">
                <div style="font-weight:600;color:#7c3aed;margin-bottom:8px;">객실 타입 (${roomTypes.length}개)</div>
                ${roomTypes.map(roomType => `
                  <div style="padding:12px;border-radius:8px;background:#f3e8ff;border:1px solid #c4b5fd;margin-bottom:8px;">
                    <div style="font-weight:600;color:#7c3aed;">${roomType.name || '이름 없음'}</div>
                    ${roomType.types && roomType.types.length > 0 ? `
                      <div style="margin-top:8px;">
                        ${roomType.types.map(type => `
                          <div style="padding:8px;background:#ffffff;border-radius:4px;margin-bottom:4px;border:1px solid #e5e7eb;">
                            <div style="font-size:12px;color:#666;">
                              ${type.id || 'ID 없음'} - ${type.name || '타입 없음'}
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${pricing.additionalInfo ? `
              <div style="padding:12px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;">
                <div style="font-weight:600;color:#166534;">추가 정보</div>
                <div style="color:#666;margin-top:8px;">
                  ${Object.entries(pricing.additionalInfo).map(([key, value]) => `
                    <div><strong>${key}:</strong> ${value || '미설정'}</div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }
      case 'cancel': {
        const cancelPolicies = data.cancelPolicies || data.cancelPolicy || [];
        console.log('Preview cancel data:', { data, cancelPolicies });
        return `
          <div style="padding:20px;">
            ${cancelPolicies.length > 0 ? `
              <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                ${cancelPolicies.map(policy => `
                  <div style="padding:16px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                      <h4 style="margin:0;font-weight:600;color:#1e293b;">${policy.name || '정책명 없음'}</h4>
                      <span style="padding:4px 8px;border-radius:4px;background:#3b82f6;color:white;font-size:12px;">
                        ${policy.policyType || '기타'}
                      </span>
                    </div>
                    <div style="color:#64748b;margin-bottom:12px;line-height:1.5;">
                      ${policy.description || '설명 없음'}
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                      ${policy.cancellationFee ? `
                        <div style="padding:8px;border-radius:6px;background:#fef3c7;border:1px solid #fcd34d;">
                          <div style="font-weight:600;color:#d97706;font-size:12px;">취소 수수료</div>
                          <div style="color:#666;font-size:14px;">${policy.cancellationFee}</div>
                        </div>
                      ` : ''}
                      ${policy.refundPercentage ? `
                        <div style="padding:8px;border-radius:6px;background:#f0fdf4;border:1px solid #bbf7d0;">
                          <div style="font-weight:600;color:#166534;font-size:12px;">환불 비율</div>
                          <div style="color:#666;font-size:14px;">${policy.refundPercentage}%</div>
                        </div>
                      ` : ''}
                      ${policy.noticePeriod ? `
                        <div style="padding:8px;border-radius:6px;background:#f0f9ff;border:1px solid #bae6fd;">
                          <div style="font-weight:600;color:#0369a1;font-size:12px;">사전 통보 기간</div>
                          <div style="color:#666;font-size:14px;">${policy.noticePeriod}</div>
                        </div>
                      ` : ''}
                    </div>
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                      생성일: ${new Date(policy.createdAt).toLocaleDateString()}
                      ${policy.updatedAt !== policy.createdAt ? ` | 수정일: ${new Date(policy.updatedAt).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="text-align:center;padding:40px;color:#64748b;">
                <div style="font-size:18px;margin-bottom:8px;">등록된 취소 정책이 없습니다</div>
                <div style="font-size:14px;">취소 정책을 추가하면 여기에 미리보기가 표시됩니다</div>
              </div>
            `}
          </div>
        `;
      }
      case 'common': {
        const common = data.common || {};
        return `
          <div style="padding:20px;">
            <div style="margin-bottom:20px;padding:16px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
              <h4 style="margin:0;font-weight:600;color:#0369a1;font-size:18px;">${common.title || '공통안내'}</h4>
            </div>
            
            ${common.notices && common.notices.length > 0 ? `
              <div style="margin-bottom:20px;">
                <h5 style="margin:0 0 12px 0;font-weight:600;color:#374151;">안내사항</h5>
                <div style="space-y:8px;">
                  ${common.notices.map(notice => `
                    <div style="display:flex;align-items:flex-start;padding:8px 0;">
                      <span style="color:#6b7280;margin-right:8px;margin-top:2px;">•</span>
                      <span style="color:#374151;line-height:1.5;">${notice}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="margin-bottom:20px;padding:16px;border-radius:8px;background:#f9fafb;border:1px solid #e5e7eb;">
                <div style="color:#6b7280;text-align:center;">등록된 안내사항이 없습니다</div>
              </div>
            `}
            
            ${common.additionalInfo ? `
              <div style="padding:16px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
                <h5 style="margin:0 0 8px 0;font-weight:600;color:#d97706;">추가 정보</h5>
                <div style="color:#374151;">${common.additionalInfo}</div>
              </div>
            ` : ''}
            
            ${common.createdAt ? `
              <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
                생성일: ${new Date(common.createdAt).toLocaleDateString()}
                ${common.updatedAt && common.updatedAt !== common.createdAt ? ` | 수정일: ${new Date(common.updatedAt).toLocaleDateString()}` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }
      case 'booking': {
        const booking = data.bookingInfo || {};
        return `
          <div style="padding:20px;">
            <div style="margin-bottom:20px;padding:16px;border-radius:8px;background:#f0f9ff;border:1px solid #bae6fd;">
              <h4 style="margin:0;font-weight:600;color:#0369a1;font-size:18px;">${booking.title || '숙박권 구매안내'}</h4>
            </div>
            
            ${booking.purchaseGuide ? `
              <div style="margin-bottom:20px;padding:16px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;">
                <h5 style="margin:0 0 12px 0;font-weight:600;color:#166534;">구매 안내</h5>
                <div style="color:#374151;line-height:1.6;white-space:pre-line;">${booking.purchaseGuide}</div>
              </div>
            ` : ''}
            
            ${booking.referenceNotes ? `
              <div style="margin-bottom:20px;padding:16px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
                <h5 style="margin:0 0 12px 0;font-weight:600;color:#d97706;">참고 사항</h5>
                <div style="color:#374151;line-height:1.6;white-space:pre-line;">${booking.referenceNotes}</div>
              </div>
            ` : ''}
            
            ${booking.kakaoChannel ? `
              <div style="padding:16px;border-radius:8px;background:#f3e8ff;border:1px solid #c4b5fd;">
                <h5 style="margin:0 0 8px 0;font-weight:600;color:#7c3aed;">카카오 채널</h5>
                <div style="color:#374151;">${booking.kakaoChannel}</div>
              </div>
            ` : ''}
          </div>
        `;
      }
      case 'notices': {
        const notices = data.notices || [];
        return `
          <div style="padding:20px;">
            ${notices.length > 0 ? `
              <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                ${notices.map((notice, index) => `
                  <div style="padding:16px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                      <h4 style="margin:0;font-weight:600;color:#1e293b;">${notice.title || `공지사항 ${index + 1}`}</h4>
                      ${notice.createdAt ? `
                        <span style="color:#64748b;font-size:12px;">
                          ${new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      ` : ''}
                    </div>
                    <div style="color:#64748b;line-height:1.5;">
                      ${notice.content || '내용 없음'}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="text-align:center;padding:40px;color:#64748b;">
                <div style="font-size:18px;margin-bottom:8px;">등록된 공지사항이 없습니다</div>
                <div style="font-size:14px;">공지사항을 추가하면 여기에 미리보기가 표시됩니다</div>
              </div>
            `}
          </div>
        `;
      }
      default: {
        // generic JSON preview
        const pretty = typeof sectionData === 'string' ? sectionData : JSON.stringify(sectionData, null, 2);
        return `
          <div style="padding:16px;">
            <h3 style="margin-top:0">${(activeTab || '섹션').toString().toUpperCase()} 미리보기</h3>
            <pre style="white-space:pre-wrap;background:#f7f9fc;padding:12px;border-radius:6px;border:1px solid #e6eef8;color:#000000;">${pretty}</pre>
          </div>
        `;
      }
    }
  }, [data, activeTab]);

  // 미리보기 업데이트
  useEffect(() => {
    if (previewRef.current) {
      try {
        console.log('[Preview] Updating content:', {
          hasData,
          previewContentLength: previewContent.length,
          allDataKeys: Object.keys(allData),
          allDataValues: Object.values(allData),
          activeTab,
          dataKeys: Object.keys(data || {})
        });
        
        // 강제로 미리보기 업데이트
        previewRef.current.innerHTML = previewContent;
        setLastUpdateTime(Date.now());
        
        console.log('[Preview] Content updated successfully');
        
        // send client-side debug log to server
        try {
          if (typeof fetch === 'function') {
            fetch('/api/client-log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                tag: 'preview-update', 
                hasData, 
                keys: Object.keys(allData),
                activeTab,
                timestamp: Date.now()
              })
            }).catch(e => console.warn('log send failed', e));
          }
        } catch (e) {}
      } catch (error) {
        console.error('[Preview] Update failed:', error);
      }
    }
  }, [previewContent, hasData, allData, activeTab, data]);

  const handleRefresh = useCallback(() => {
    console.log('[Preview] Manual refresh triggered');
    setLastUpdateTime(Date.now());
    
    // 강제로 미리보기 다시 렌더링
    if (previewRef.current) {
      previewRef.current.innerHTML = previewContent;
    }
  }, [previewContent]);

  // 전역 미리보기 트리거 함수 등록
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.triggerPreview = (tabName) => {
        console.log('[Preview] Global trigger called for:', tabName);
        handleRefresh();
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.triggerPreview;
      }
    };
  }, [handleRefresh]);

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid #ddd', position: 'relative' }}>
      {/* 미리보기 컨테이너 */}
      <div 
        ref={previewRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          background: '#ffffff',
          padding: '10px',
          border: '1px solid #e9ecef'
        }}
      />
      
      {/* 업데이트 시간 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '10px',
        opacity: 0.7
      }}>
        {new Date(lastUpdateTime).toLocaleTimeString('ko-KR')}
      </div>

      {/* 새로고침 버튼 */}
      <button 
        onClick={handleRefresh}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          padding: '2px 6px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
        title="새로고침"
      >
        🔄
      </button>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
