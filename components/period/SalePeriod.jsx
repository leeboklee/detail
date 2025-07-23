'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import styles from './SalePeriod.module.css';

/**
 * 판매기간 및 투숙일 정보 관리 컴포넌트
 * @param {object} props
 * @param {object} props.period - 기간 정보
 * @param {Function} props.onPeriodChange - 기간 정보 변경 핸들러
 */
export default function SalePeriod({ period = {}, onPeriodChange }) {
  const handleInputChange = (field, value) => {
    if (typeof onPeriodChange === 'function') {
      onPeriodChange({ ...period, [field]: value });
    }
  };

  const handleDateChange = (field, date) => {
    if (typeof onPeriodChange === 'function') {
      const value = date ? date.toISOString().split('T')[0] : null;
      onPeriodChange({ ...period, [field]: value });
    }
  };

  const toDate = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };

  return (
    <div className={styles.periodSection}>
      <h3 className={styles.sectionTitle}>판매기간 및 투숙일 정보</h3>
      <div className={styles.grid}>
        <div className={styles.gridItem}>
          <label className={styles.label}>판매 시작일</label>
          <DatePicker
            selected={toDate(period.saleStartDate)}
            onChange={(date) => handleDateChange('saleStartDate', date)}
            dateFormat="yyyy-MM-dd"
            locale={ko}
            className={styles.datePicker}
          />
        </div>
        <div className={styles.gridItem}>
          <label className={styles.label}>판매 종료일</label>
          <DatePicker
            selected={toDate(period.saleEndDate)}
            onChange={(date) => handleDateChange('saleEndDate', date)}
            dateFormat="yyyy-MM-dd"
            locale={ko}
            className={styles.datePicker}
          />
        </div>
        <div className={styles.gridItem}>
          <label className={styles.label}>투숙 시작일</label>
          <DatePicker
            selected={toDate(period.stayStartDate)}
            onChange={(date) => handleDateChange('stayStartDate', date)}
            dateFormat="yyyy-MM-dd"
            locale={ko}
            className={styles.datePicker}
          />
        </div>
        <div className={styles.gridItem}>
          <label className={styles.label}>투숙 종료일</label>
          <DatePicker
            selected={toDate(period.stayEndDate)}
            onChange={(date) => handleDateChange('stayEndDate', date)}
            dateFormat="yyyy-MM-dd"
            locale={ko}
            className={styles.datePicker}
          />
        </div>
        <div className={styles.gridItem}>
          <label className={styles.label}>체크인 시간</label>
          <input
            type="time"
            className={styles.input}
            value={period.checkInTime || '15:00'}
            onChange={(e) => handleInputChange('checkInTime', e.target.value)}
          />
        </div>
        <div className={styles.gridItem}>
          <label className={styles.label}>체크아웃 시간</label>
          <input
            type="time"
            className={styles.input}
            value={period.checkOutTime || '11:00'}
            onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
} 