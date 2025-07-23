'use client';

import React, { useState, useEffect } from 'react';

const SimpleHotelInfo = ({ value, onChange }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (value) {
      setName(value.name || '');
      setAddress(value.address || '');
      setDescription(value.description || '');
    }
  }, [value]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    console.log('🔥 이름 변경:', newName);
    setName(newName);
    
    if (onChange) {
      onChange({
        name: newName,
        address,
        description,
        imageUrl: value?.imageUrl || ''
      });
    }
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    console.log('🔥 주소 변경:', newAddress);
    setAddress(newAddress);
    
    if (onChange) {
      onChange({
        name,
        address: newAddress,
        description,
        imageUrl: value?.imageUrl || ''
      });
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    console.log('🔥 설명 변경:', newDescription);
    setDescription(newDescription);
    
    if (onChange) {
      onChange({
        name,
        address,
        description: newDescription,
        imageUrl: value?.imageUrl || ''
      });
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', margin: '20px 0' }}>
      <h3 style={{ color: '#007bff', marginBottom: '20px' }}>🧪 간단한 호텔 정보 입력 테스트</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          호텔명:
        </label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="호텔명을 입력하세요"
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          주소:
        </label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="주소를 입력하세요"
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          설명:
        </label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="호텔 설명을 입력하세요"
          rows="3"
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>현재 값:</strong><br/>
        이름: {name}<br/>
        주소: {address}<br/>
        설명: {description}
      </div>
    </div>
  );
};

export default SimpleHotelInfo; 