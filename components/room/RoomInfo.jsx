import styles from './RoomInfoEditor.module.css';
import PriceTable from '../price/PriceTable';
import RoomTypeSelect from './RoomTypeSelect';
import RoomAmenities from './RoomAmenities';
import OptimizedInput from './OptimizedInput';
import FixedInput from './FixedInput';
import { FaPlus, FaTrash } from 'react-icons/fa';

const RoomInfo = ({ rooms, onRoomDataChange }) => {
  const handleRoomDataChange = (index, field, value) => {
    const updatedRooms = rooms.map((room, i) => 
      i === index ? { ...room, [field]: value } : room
    );
    onRoomDataChange(updatedRooms);
  };

  const addRoom = () => {
    const newRoom = { type: '스탠다드', amenities: [] }; // 기본값으로 새 객실 추가
    onRoomDataChange([...rooms, newRoom]);
  };

  if (!Array.isArray(rooms)) {
    console.error('RoomInfo: rooms prop is not an array!', rooms);
    return <div>객실 정보 데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className={styles.title}>객실 정보</h2>
        <button onClick={addRoom} className={styles.addButton}><FaPlus /> 새 객실 추가</button>
      </div>

      {rooms.length === 0 ? (
        <div className={styles.emptyState}>
          <p>등록된 객실 정보가 없습니다. '새 객실 추가' 버튼을 눌러 시작하세요.</p>
        </div>
      ) : (
        rooms.map((roomData, index) => (
          <div key={index} className={styles.roomContainer}>
            <div className={styles.inputGroup}>
              <label htmlFor={`roomType-${index}`}>객실 유형</label>
              <RoomTypeSelect 
                value={roomData.type || ''} 
                onChange={(e) => handleRoomDataChange(index, 'type', e.target.value)} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>객실 편의시설</label>
              <RoomAmenities 
                selectedAmenities={roomData.amenities || []}
                onAmenitiesChange={(amenities) => handleRoomDataChange(index, 'amenities', amenities)}
              />
            </div>
             <button onClick={() => onRoomDataChange(rooms.filter((_, i) => i !== index))} className={styles.removeButton}><FaTrash /> 삭제</button>
          </div>
        ))
      )}
      <PriceTable rooms={rooms} />
    </div>
  );
};

export default RoomInfo; 