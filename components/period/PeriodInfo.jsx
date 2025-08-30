'use client';

import React, { useState } from 'react';

import Labels from '@/src/shared/labels';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale/ko';
import { useAppContext } from '../AppContext.Context';
import styles from './PeriodInfo.module.css';

/**
 * 패키지 정보 컴포넌트 - app/page.js의 periodInfo 상태 직접 사용
 * props:
 *  - data: { packageName: string, ..., additionalInfo: string }
 *  - setData: Function to update the periodInfo state in app/page.js
 */
const PeriodInfo = () => {
  const { 
    period: periodData,
    updatePeriod
  } = useAppContext();

  // 통합된 데이터 관리
  const [localData, setLocalData] = useState({
    saleStartDate: periodData?.saleStartDate ? new Date(periodData.saleStartDate) : null,
    saleEndDate: periodData?.saleEndDate ? new Date(periodData.saleEndDate) : null,
    stayStartDate: periodData?.stayStartDate ? new Date(periodData.stayStartDate) : null,
    stayEndDate: periodData?.stayEndDate ? new Date(periodData.stayEndDate) : null,
    earlyBirdDiscount: periodData?.earlyBirdDiscount || '',
    lastMinuteDiscount: periodData?.lastMinuteDiscount || '',
    specialBenefits: periodData?.specialBenefits || '',
    saleRestrictions: periodData?.saleRestrictions || '',
    checkInTime: periodData?.checkInTime || '15:00',
    checkOutTime: periodData?.checkOutTime || '11:00',
    minStayDays: periodData?.minStayDays || '1',
    maxStayDays: periodData?.maxStayDays || '30',
    blackoutDates: periodData?.blackoutDates || '',
    cancellationPolicy: periodData?.cancellationPolicy || ''
  });

  const handleInputChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field, date) => {
    setLocalData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSave = () => {
    // Date 객체를 ISO 문자열로 변환해서 저장
    const saveData = {
      ...localData,
      saleStartDate: localData.saleStartDate ? localData.saleStartDate.toISOString().split('T')[0] : '',
      saleEndDate: localData.saleEndDate ? localData.saleEndDate.toISOString().split('T')[0] : '',
      stayStartDate: localData.stayStartDate ? localData.stayStartDate.toISOString().split('T')[0] : '',
      stayEndDate: localData.stayEndDate ? localData.stayEndDate.toISOString().split('T')[0] : ''
    };
    updatePeriod(saveData);
  };

  return (
    <div className={styles.periodContainer}>
      <div className={styles.header}>
        <h3>📅 판매기간 & 투숙일 관리</h3>
        <button onClick={handleSave} className={styles.saveButton}>
          💾 저장
        </button>
      </div>

      {/* 판매기간 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>🛒 판매기간</h4>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label>{Labels.판매_시작일}</label>
            <DatePicker
              selected={localData.saleStartDate}
              onChange={(date) => handleDateChange('saleStartDate', date)}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="판매 시작일을 선택하세요"
              className={styles.datePicker}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.판매_종료일}</label>
            <DatePicker
              selected={localData.saleEndDate}
              onChange={(date) => handleDateChange('saleEndDate', date)}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="판매 종료일을 선택하세요"
              className={styles.datePicker}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              minDate={localData.saleStartDate}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.얼리버드_할인}</label>
            <input
              type="text"
              value={localData.earlyBirdDiscount}
              onChange={(e) => handleInputChange('earlyBirdDiscount', e.target.value)}
              placeholder={Labels["30일_전_예약_시_10_할인_PH"]}
              className={styles.input}
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.막판_할인}</label>
            <input
              type="text"
              value={localData.lastMinuteDiscount}
              onChange={(e) => handleInputChange('lastMinuteDiscount', e.target.value)}
              placeholder={Labels["당일_예약_시_20_할인_PH"]}
              className={styles.input}
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
        </div>
        
        <div className={styles.textareaGroup}>
          <label>{Labels.특별_혜택}</label>
          <textarea
            value={localData.specialBenefits}
            onChange={(e) => handleInputChange('specialBenefits', e.target.value)}
            placeholder={Labels["조식_무료_제공_스파_이용권_등_PH"]}
            className={styles.textarea}
            rows="3"
            autoComplete="off"
            style={{
              pointerEvents: 'auto',
              userSelect: 'text',
              cursor: 'text'
            }}
          />
        </div>
        
        <div className={styles.textareaGroup}>
          <label>{Labels.판매_제한사항}</label>
          <textarea
            value={localData.saleRestrictions}
            onChange={(e) => handleInputChange('saleRestrictions', e.target.value)}
            placeholder={Labels["1인_최대_2박_중복_예약_불가_등_PH"]}
            className={styles.textarea}
            rows="3"
          />
        </div>
      </div>

      {/* 투숙일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>🏨 투숙일</h4>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label>{Labels.투숙_시작일}</label>
            <DatePicker
              selected={localData.stayStartDate}
              onChange={(date) => handleDateChange('stayStartDate', date)}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="투숙 시작일을 선택하세요"
              className={styles.datePicker}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              minDate={new Date()}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.투숙_종료일}</label>
            <DatePicker
              selected={localData.stayEndDate}
              onChange={(date) => handleDateChange('stayEndDate', date)}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="투숙 종료일을 선택하세요"
              className={styles.datePicker}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              minDate={localData.stayStartDate || new Date()}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.체크인_시간_1}</label>
            <input
              type="time"
              value={localData.checkInTime}
              onChange={(e) => handleInputChange('checkInTime', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.체크아웃_시간_1}</label>
            <input
              type="time"
              value={localData.checkOutTime}
              onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.최소_숙박일}</label>
            <input
              type="number"
              value={localData.minStayDays}
              onChange={(e) => handleInputChange('minStayDays', e.target.value)}
              min="1"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{Labels.최대_숙박일}</label>
            <input
              type="number"
              value={localData.maxStayDays}
              onChange={(e) => handleInputChange('maxStayDays', e.target.value)}
              min="1"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.textareaGroup}>
          <label>{Labels.블랙아웃_날짜}</label>
          <textarea
            value={localData.blackoutDates}
            onChange={(e) => handleInputChange('blackoutDates', e.target.value)}
            placeholder={Labels["20241231_20250101_예약_불가_날짜_PH"]}
            className={styles.textarea}
            rows="2"
          />
        </div>

        <div className={styles.textareaGroup}>
          <label>{Labels.취소_정책}</label>
          <textarea
            value={localData.cancellationPolicy}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            placeholder={Labels["체크인_3일_전까지_무료_취소_당일_취소_시_100_위약금_PH"]}
            className={styles.textarea}
            rows="3"
          />
        </div>
      </div>

      {/* 성공/실패 정보 저장 체크박스 */}
      <div className={styles.footer}>
        <div className={styles.checkboxGroup}>
          <input 
            type="checkbox" 
            id="autoSave" 
            defaultChecked 
            className={styles.checkbox}
          />
          <label htmlFor="autoSave">{Labels.성공실패_정보_자동_저장}</label>
        </div>
      </div>
    </div>
  );
};

export default PeriodInfo; 