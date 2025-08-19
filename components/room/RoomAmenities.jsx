import React from 'react';

const allAmenities = [
  "Wi-Fi", "TV", "에어컨", "냉장고", "미니바", "욕조", "샤워부스", "헤어드라이어", "세면도구", "발코니", "금연"
];

const RoomAmenities = ({ selectedAmenities, onAmenitiesChange }) => {
  const handleCheckboxChange = (amenity) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(item => item !== amenity)
      : [...selectedAmenities, amenity];
    onAmenitiesChange(newAmenities);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {allAmenities.map(amenity => (
        <label key={amenity} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedAmenities.includes(amenity)}
            onChange={() => handleCheckboxChange(amenity)}
          />
          <span>{amenity}</span>
        </label>
      ))}
    </div>
  );
};

export default RoomAmenities; 