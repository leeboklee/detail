import React from 'react';

const RoomTypeSelect = ({ value, onChange }) => (
  <input 
    type="text" 
    value={value} 
    onChange={onChange} 
    placeholder="객실 유형을 직접 입력하세요"
    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export default RoomTypeSelect; 