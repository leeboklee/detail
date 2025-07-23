'use client';

import { useState, useEffect } from 'react';

// 패키지 정보를 관리하는 훅
export default function usePeriodInfo() {
  // 패키지 정보 상태
  const [periodInfo, setPeriodInfo] = useState({
    packageName: '',
    packageType: 'standard',
    packageComposition: '',
    packageBenefits: '',
    saleStart: '',
    saleEnd: '',
    stayStart: '',
    stayEnd: '',
    roomOnlyPrice: '',
    packagePrice: '',
    notes: [],
    additionalNotes: ''
  });

  // 저장된 패키지 목록 상태
  const [savedPackages, setSavedPackages] = useState([]);
  const [showPackageList, setShowPackageList] = useState(false);

  // 로컬 스토리지에서 저장된 패키지 목록 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('savedPackagesData');
    if (savedData) {
      try {
        setSavedPackages(JSON.parse(savedData));
      } catch (error) {
        console.error('패키지 데이터 파싱 오류:', error);
        setSavedPackages([]);
      }
    }
  }, []);

  // 로컬 스토리지에서 패키지 정보 불러오기
  useEffect(() => {
    const storedData = localStorage.getItem('periodInfoData');
    if (storedData) {
      try {
        setPeriodInfo(JSON.parse(storedData));
      } catch (error) {
        console.error('패키지 정보 파싱 오류:', error);
      }
    }
  }, []);

  // 패키지 정보 저장
  const savePackageInfo = () => {
    if (!periodInfo.packageName.trim()) {
      alert('패키지 이름을 입력해주세요.');
      return;
    }

    // 현재 패키지 정보 저장
    localStorage.setItem('periodInfoData', JSON.stringify(periodInfo));

    // 고유 ID 생성
    const newPackage = {
      id: Date.now().toString(),
      name: periodInfo.packageName,
      type: periodInfo.packageType,
      data: { ...periodInfo }
    };

    // 기존 패키지 배열에 추가
    const updatedPackages = [...savedPackages, newPackage];
    setSavedPackages(updatedPackages);
    localStorage.setItem('savedPackagesData', JSON.stringify(updatedPackages));

    alert('패키지 정보가 저장되었습니다.');
  };

  // 저장된 패키지 정보 불러오기
  const loadPackageInfo = (id) => {
    const selectedPackage = savedPackages.find(pkg => pkg.id === id);
    if (selectedPackage) {
      setPeriodInfo(selectedPackage.data);
      localStorage.setItem('periodInfoData', JSON.stringify(selectedPackage.data));
      setShowPackageList(false);
      alert(`${selectedPackage.name} 패키지를 불러왔습니다.`);
    }
  };

  // 저장된 패키지 삭제
  const deletePackageInfo = (id) => {
    if (confirm('이 패키지를 삭제하시겠습니까?')) {
      const updatedPackages = savedPackages.filter(pkg => pkg.id !== id);
      setSavedPackages(updatedPackages);
      localStorage.setItem('savedPackagesData', JSON.stringify(updatedPackages));
    }
  };

  // 패키지 정보 HTML 생성
  const generatePeriodInfoHtml = () => {
    const notesHtml = periodInfo.notes.map(note => `<li>${note}</li>`).join('');
    
    return `
      <div class="package-info">
        <h3>${periodInfo.packageName || '패키지명'}</h3>
        <p class="package-type">${periodInfo.packageType === 'standard' ? '스탠다드' : 
          periodInfo.packageType === 'premium' ? '프리미엄' : '스페셜'} 패키지</p>
        
        ${periodInfo.packageComposition ? `
        <div class="package-composition">
          <h4>패키지 구성</h4>
          <p>${periodInfo.packageComposition.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${periodInfo.packageBenefits ? `
        <div class="package-benefits">
          <h4>패키지 특전</h4>
          <p>${periodInfo.packageBenefits.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        <div class="package-period">
          <div class="period-item">
            <span>판매 기간:</span>
            <span>${periodInfo.saleStart || ''} ~ ${periodInfo.saleEnd || ''}</span>
          </div>
          <div class="period-item">
            <span>투숙 기간:</span>
            <span>${periodInfo.stayStart || ''} ~ ${periodInfo.stayEnd || ''}</span>
          </div>
        </div>
        
        <div class="package-price">
          ${periodInfo.roomOnlyPrice ? `<div class="price-item"><span>객실만:</span> <span>${periodInfo.roomOnlyPrice}원</span></div>` : ''}
          ${periodInfo.packagePrice ? `<div class="price-item"><span>패키지:</span> <span>${periodInfo.packagePrice}원</span></div>` : ''}
        </div>
        
        ${periodInfo.notes.length > 0 ? `
        <div class="package-notes">
          <h4>기본 안내</h4>
          <ul>${notesHtml}</ul>
        </div>` : ''}
        
        ${periodInfo.additionalNotes ? `
        <div class="additional-notes">
          <h4>추가 안내</h4>
          <p>${periodInfo.additionalNotes.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
      </div>
    `;
  };

  return {
    periodInfo,
    setPeriodInfo,
    showPackageList,
    setShowPackageList,
    savedPackages,
    savePackageInfo,
    loadPackageInfo,
    deletePackageInfo,
    generatePeriodInfoHtml
  };
} 