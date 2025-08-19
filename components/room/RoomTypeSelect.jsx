import React from 'react';

const roomTypes = [
  "스탠다드", "디럭스", "스위트", "패밀리", "프리미엄", "오션뷰", "마운틴뷰"
];

const RoomTypeSelect = ({ value, onChange }) => (
  <select value={value} onChange={onChange} className="w-full p-2 border rounded">
    <option value="">객실 유형 선택</option>
    {roomTypes.map(type => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
);

export default RoomTypeSelect; 