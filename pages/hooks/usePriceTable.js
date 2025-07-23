'use client';

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@shared/hooks/common/useLocalStorage.js';

// 기본 가격 구조 (요일 기반)
const getDefaultPrices = (dayTypes) => {
  const prices = {};
  dayTypes.forEach(day => {
    prices[day.id] = { price: 0, note: day.name };
  });
  return prices;
};

// 기본 객실 구조 정의
const getDefaultRoom = (dayTypes) => ({
  type: '새 객실',
  specs: { structure: '', bedType: '', capacity: '', maxCapacity: '', view: '' },
  prices: getDefaultPrices(dayTypes), // 요일 기반 가격 구조 사용
  imageUrl: ''
});

// 기본 숙소 구조 정의
const getDefaultLodge = (dayTypes) => ({
  name: '새 숙소',
  location: '',
  rooms: [getDefaultRoom(dayTypes)]
});

/**
 * 가격 테이블 관리를 위한 커스텀 훅
 * 가격 데이터 관리 및 형식화 기능 제공
 */
export default function usePriceTable(options = {}) {
  // 가격 정보 상태
  const [priceInfo, setPriceInfo] = useState({
    weekday: '',
    weekend: '',
    options: []
  });

  // 초기 데이터가 제공되면 상태 초기화
  useEffect(() => {
    if (options.initialData) {
      setPriceInfo({
        weekday: options.initialData.weekday || '',
        weekend: options.initialData.weekend || '',
        options: Array.isArray(options.initialData.options) ? options.initialData.options : []
      });
    }
  }, [options.initialData]);

  // 가격 유형 및 요일 구분 상태 관리 (로컬 스토리지 연동)
  const [priceTypes, setPriceTypes] = useLocalStorage('priceTypesData', [
    { id: 'standard', name: '스탠다드' }, 
    { id: 'parkview', name: '파크뷰' }
  ]); // 예시 데이터
  const [dayTypes, setDayTypes] = useLocalStorage('dayTypesData', [
    { id: 'weekday', name: '주중 (5/1 포함)' },
    { id: 'friday', name: '금요일' },
    { id: 'saturday', name: '토요일' },
    { id: 'gold1', name: '골드① (5/2,6/5)' },
    { id: 'gold2', name: '골드② (5/3~5,6/6~7)' }
  ]); // 예시 데이터

  // 객실 정보 상태 (로컬 스토리지 연동, 초기값에 dayTypes, priceTypes 전달)
  const [lodges, setLodges] = useLocalStorage('lodgesData', [getDefaultLodge(dayTypes)]);

  // 테이블 헤더 상태 (지금 구조에서는 사용 빈도 낮아짐, 필요시 유지)
  const [tableHeaders, setTableHeaders] = useLocalStorage('tableHeadersData', {
    lodgeName: '숙소명',
    roomType: '룸타입',
    checkIn: '체크인',
    priceHeader: '가격'
  });

  // 가격 형식화 함수
  const formatPrice = useCallback((price) => {
    if (!price) return '';
    return Number(price).toLocaleString();
  }, []);

  // 가격 변경 핸들러
  const handlePriceChange = useCallback((field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setPriceInfo(prev => ({
      ...prev,
      [field]: numericValue
    }));
  }, []);

  // 옵션 가격 변경 핸들러
  const handleOptionPriceChange = useCallback((index, field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setPriceInfo(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = {
        ...newOptions[index],
        [field]: numericValue
      };
      
      return {
        ...prev,
        options: newOptions
      };
    });
  }, []);

  // 옵션 추가 핸들러
  const handleAddOption = useCallback(() => {
    setPriceInfo(prev => ({
      ...prev,
      options: [...prev.options, { name: '', price: '' }]
    }));
  }, []);

  // 옵션 삭제 핸들러
  const handleRemoveOption = useCallback((index) => {
    setPriceInfo(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * 가격 정보 완전 초기화 
   * @param {Object} data 새로운 가격 데이터
   */
  const resetPriceInfo = (data) => {
    setPriceInfo({
      weekday: data?.weekday || '',
      weekend: data?.weekend || '',
      options: Array.isArray(data?.options) ? data.options : []
    });
  };

  // --- 가격 유형 핸들러 --- 
  const handleAddPriceType = () => {
    const name = prompt('추가할 가격 유형 이름을 입력하세요 (예: 스위트):');
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-'); // 고유 ID 생성
    if (priceTypes.some(pt => pt.id === id)) {
      alert('이미 존재하는 ID입니다.');
      return;
    }
    const newPriceType = { id, name };
    setPriceTypes([...priceTypes, newPriceType]);
    // TODO: 기존 lodges 데이터의 room 객체에 이 priceType을 반영할지 결정 필요
    // (예: room.priceType 필드 추가 또는 prices 구조 변경)
    // 현재 구조에서는 가격 유형별로 테이블을 분리하거나, 
    // 객실 데이터 내에 가격 유형 정보를 포함해야 함.
    // 간단하게는 새 priceType을 추가만 하고, 사용자가 수동으로 객체에 적용하도록 둘 수 있음.
  };

  const handleRemovePriceType = (idToRemove) => {
    if (priceTypes.length <= 1) {
      alert('최소 하나 이상의 가격 유형이 필요합니다.');
      return;
    }
    if (!confirm('정말 이 가격 유형을 삭제하시겠습니까? 관련된 객실 데이터는 수동으로 조정해야 할 수 있습니다.')) return;
    setPriceTypes(priceTypes.filter(pt => pt.id !== idToRemove));
    // TODO: lodges 데이터에서 해당 priceType 관련 정보 정리 로직 추가 (필요시)
  };

  // --- 요일 구분 핸들러 --- 
  const handleAddDayType = () => {
    console.log('handleAddDayType called!');
    const name = prompt('추가할 요일 구분 이름을 입력하세요 (예: 공휴일):');
    if (!name) {
      console.log('Prompt cancelled or empty name.');
      return;
    }
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (dayTypes.some(dt => dt.id === id)) {
      alert('이미 존재하는 ID입니다.');
      return;
    }
    const newDayType = { id, name };
    console.log('Adding new day type:', newDayType);
    setDayTypes([...dayTypes, newDayType]);

    // 모든 객실의 prices 객체에 새 요일 구분 추가
    const updatedLodges = lodges.map(lodge => ({
      ...lodge,
      rooms: lodge.rooms.map(room => ({
        ...room,
        prices: {
          ...room.prices,
          [id]: { price: 0, note: name } // 기본값 설정
        }
      }))
    }));
    console.log('Updating lodges with new day type...');
    setLodges(updatedLodges);
  };

  const handleRemoveDayType = (idToRemove) => {
    if (dayTypes.length <= 1) {
      alert('최소 하나 이상의 요일 구분이 필요합니다.');
      return;
    }
    if (!confirm('정말 이 요일 구분을 삭제하시겠습니까? 모든 객실 가격에서 해당 요일 데이터가 삭제됩니다.')) return;
    setDayTypes(dayTypes.filter(dt => dt.id !== idToRemove));

    // 모든 객실의 prices 객체에서 해당 요일 구분 제거
    const updatedLodges = lodges.map(lodge => ({
      ...lodge,
      rooms: lodge.rooms.map(room => {
        const newPrices = { ...room.prices };
        delete newPrices[idToRemove];
        return { ...room, prices: newPrices };
      })
    }));
    setLodges(updatedLodges);
  };

  // --- 기존 핸들러 (lodges 상태 사용하도록 수정) --- 
  const handleLodgeChange = (lodgeIndex, field, value) => {
    const newLodges = [...lodges];
    newLodges[lodgeIndex][field] = value;
    setLodges(newLodges);
  };
  // handleRoomChange, handleSpecChange 등 다른 핸들러들도 lodges 상태 사용...
  const handleAddLodge = () => {
    setLodges([...lodges, getDefaultLodge(dayTypes)]);
  };
  const handleAddRoom = (lodgeIndex) => {
    const newLodges = [...lodges];
    newLodges[lodgeIndex].rooms.push(getDefaultRoom(dayTypes));
    setLodges(newLodges);
  };
  const handleRemoveLodge = (lodgeIndex) => {
    const newLodges = lodges.filter((_, index) => index !== lodgeIndex);
    if (newLodges.length === 0) {
        setLodges([getDefaultLodge(dayTypes)]);
    } else {
        setLodges(newLodges);
    }
  };
  const handleRemoveRoom = (lodgeIndex, roomIndex) => {
    const newLodges = [...lodges];
    newLodges[lodgeIndex].rooms = newLodges[lodgeIndex].rooms.filter((_, index) => index !== roomIndex);
    setLodges(newLodges);
  };
  const handlePriceInputChange = (lodgeIndex, roomIndex, dayTypeId, value) => {
    const newLodges = [...lodges];
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId]) {
      const dayTypeInfo = dayTypes.find(dt => dt.id === dayTypeId);
      newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId] = { price: 0, note: dayTypeInfo?.name || dayTypeId };
    }
    newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId].price = parseInt(numericValue, 10) || 0;
    setLodges(newLodges);
  };
  const handleNoteChange = (lodgeIndex, roomIndex, dayTypeId, value) => {
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId]) {
       const dayTypeInfo = dayTypes.find(dt => dt.id === dayTypeId);
      newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId] = { price: 0, note: dayTypeInfo?.name || dayTypeId };
    }
    newLodges[lodgeIndex].rooms[roomIndex].prices[dayTypeId].note = value;
    setLodges(newLodges);
  };  
  const handleSpecChange = (lodgeIndex, roomIndex, specKey, value) => {
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex].rooms[roomIndex].specs) {
      newLodges[lodgeIndex].rooms[roomIndex].specs = { structure: '', bedType: '', capacity: '', maxCapacity: '', view: '' };
    }
    newLodges[lodgeIndex].rooms[roomIndex].specs[specKey] = value;
    setLodges(newLodges);
  };
  const handleRoomChange = (lodgeIndex, roomIndex, field, value) => {
    const newLodges = [...lodges];
    // 이미지 URL 변경 시에는 prices 객체 건드리지 않음
    if (field !== 'prices') {
        newLodges[lodgeIndex].rooms[roomIndex][field] = value;
    }
    setLodges(newLodges);
  };

  // HTML 생성 함수 (수정 불필요할 수 있음, PriceTable 구조 변경에 따라 확인 필요)
  const generatePriceTableHtml = () => {
    if (!lodges || lodges.length === 0 || !lodges[0].rooms || lodges[0].rooms.length === 0) {
      return '<p>가격 정보가 없습니다.</p>';
    }

    // 동적 헤더 생성 (모든 객실의 prices 키를 취합하여 중복 제거)
    const allDayTypes = Array.from(new Set(
      lodges.flatMap(lodge => 
        lodge.rooms.flatMap(room => Object.keys(room.prices || {}))
      )
    ));

    // 헤더 순서 정의 (예: 주중, 금요일, 토요일 순서 유지)
    const dayTypeOrder = ['weekday', 'friday', 'saturday'];
    const sortedDayTypes = allDayTypes.sort((a, b) => {
        const indexA = dayTypeOrder.indexOf(a);
        const indexB = dayTypeOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1; // 정의된 순서가 앞에 오도록
        if (indexB !== -1) return 1;  // 정의된 순서가 앞에 오도록
        return a.localeCompare(b); // 나머지는 문자열 순서
    });

    let tableHtml = `
      <div class="price-table-container">
        <table class="price-table">
          <thead>
            <tr>
              <th rowspan="2">${tableHeaders.lodgeName}</th>
              <th rowspan="2">${tableHeaders.roomType}</th>
              <th colspan="${sortedDayTypes.length}">${tableHeaders.priceHeader}</th>
            </tr>
            <tr>
              ${sortedDayTypes.map(dayType => `<th>${lodges[0].rooms[0].prices[dayType]?.note || dayType}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    lodges.forEach(lodge => {
      if (!lodge || !lodge.rooms) return; 
      lodge.rooms.forEach((room, roomIndex) => {
        if (!room || !room.prices) return; 

        const priceCells = sortedDayTypes.map(dayType => 
          `<td>${formatPrice(room.prices[dayType]?.price)}원</td>`
        ).join('');

        tableHtml += `
          <tr>
            ${roomIndex === 0 ? `<td rowspan="${lodge.rooms.length}">${lodge.name}<br>${lodge.location || ''}</td>` : ''}
            <td>${room.type || ''}</td>
            ${priceCells}
          </tr>
        `;
      });
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;

    return tableHtml;
  };

  // 훅에서 반환할 값들
  return {
    lodges, // roomTypes 대신 lodges 반환
    setLodges, // setRoomTypes 대신 setLodges 반환
    priceTypes, // 추가
    setPriceTypes, // 추가
    dayTypes, // 추가
    setDayTypes, // 추가
    tableHeaders, 
    setTableHeaders, 
    formatPrice, 
    // 모든 핸들러 함수 반환
    handleAddLodge, handleRemoveLodge, handleLodgeChange,
    handleAddRoom, handleRemoveRoom, handleRoomChange, handleSpecChange,
    handleAddPriceType, handleRemovePriceType,
    handleAddDayType, handleRemoveDayType,
    handlePriceInputChange, handleNoteChange,
    generatePriceTableHtml,
    priceInfo,
    setPriceInfo,
    handlePriceChange,
    handleOptionPriceChange,
    handleAddOption,
    handleRemoveOption,
    resetPriceInfo
  };
} 