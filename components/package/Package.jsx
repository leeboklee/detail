'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Package.module.css';
import usePackageManager from '@/hooks/usePackageManager';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * 패키지 관리 전용 컴포넌트
 * @param {object} props
 * @param {Array} props.data - 패키지 목록
 * @param {Function} props.onChange - 패키지 목록 변경 시 호출
 */
export default function Package({ data = [], onChange }) {
  const {
    newPackage,
    setNewPackage,
    newOption,
    setNewOption,
    selectedPackageIndex,
    handleAddPackage,
    handleRemovePackage,
    handleUpdatePackage,
    handleAddOption,
    handleRemoveOption,
    handleNewPackageChange,
    handleSelectPackage,
    handleNewOptionChange,
    handleKeyPress
  } = usePackageManager(data, onChange);

  return (
    <div className={styles.container}>
      <section>
        <h3 className={styles.sectionTitle}>패키지 관리</h3>
        
        <div className={styles.addPackageForm}>
          <input
            type="text"
            placeholder="패키지명"
            value={newPackage.name}
            onChange={(e) => handleNewPackageChange('name', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="가격"
            value={newPackage.price}
            onChange={(e) => handleNewPackageChange('price', e.target.value)}
            className={styles.input}
          />
          <textarea
            placeholder="패키지 설명"
            value={newPackage.description}
            onChange={(e) => handleNewPackageChange('description', e.target.value)}
            className={styles.textarea}
          />
          <input
            type="text"
            placeholder="이미지 URL"
            value={newPackage.imageUrl}
            onChange={(e) => handleNewPackageChange('imageUrl', e.target.value)}
            className={styles.input}
          />
          <button onClick={handleAddPackage} className={styles.addButton}>패키지 추가</button>
        </div>

        <div className={styles.packageList}>
          {(data || []).map((pkg, index) => (
            <div key={pkg.id || index} className={styles.packageItem}>
              <div className={styles.packageHeader} onClick={() => handleSelectPackage(index)}>
                <h4 className={styles.packageName}>{pkg.name}</h4>
                <span>{selectedPackageIndex === index ? '▲' : '▼'}</span>
              </div>

              {selectedPackageIndex === index && (
                <div className={styles.packageDetails}>
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    value={pkg.price}
                    onChange={(e) => handleUpdatePackage(index, 'price', e.target.value)}
                    className={styles.input}
                  />
                  <textarea
                    value={pkg.description}
                    onChange={(e) => handleUpdatePackage(index, 'description', e.target.value)}
                    className={styles.textarea}
                  />
                  <input
                    type="text"
                    value={pkg.imageUrl}
                    onChange={(e) => handleUpdatePackage(index, 'imageUrl', e.target.value)}
                    className={styles.input}
                  />
                  {pkg.imageUrl && isValidUrl(pkg.imageUrl) && (
                    <Image src={pkg.imageUrl} alt={pkg.name} width={100} height={100} className={styles.imagePreview} />
                  )}
                  
                  <div className={styles.optionSection}>
                    <h5>옵션</h5>
                    <ul>
                      {pkg.options && pkg.options.map((opt, optIndex) => (
                        <li key={optIndex}>
                          {opt}
                          <button onClick={() => handleRemoveOption(index, optIndex)} className={styles.removeOptionButton}>x</button>
                        </li>
                      ))}
                    </ul>
                    <input
                      type="text"
                      value={newOption}
                      onChange={handleNewOptionChange}
                      placeholder="새 옵션 추가"
                      onKeyPress={(e) => handleKeyPress(e, () => handleAddOption())}
                      className={styles.input}
                    />
                    <button onClick={() => handleAddOption()} className={styles.addButton}>옵션 추가</button>
                  </div>

                  <button onClick={() => handleRemovePackage(index)} className={styles.removeButton}>패키지 삭제</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 