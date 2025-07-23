import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { throttle } from 'lodash';

// 로컬스토리지 저장을 throttle로 최적화
const saveRoomsToLocalStorage = throttle((rooms) => {
  try {
    localStorage.setItem('roomsData', JSON.stringify(rooms));
  } catch (error) {
    console.warn('객실 데이터 로컬스토리지 저장 실패:', error);
  }
}, 1500); // 1.5초마다 최대 한 번만 저장

const useRoomStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // 객실 데이터
      rooms: [],
      
      // 현재 편집 중인 객실 ID
      editingRoomId: null,
      
      // 객실 추가
      addRoom: (roomData) => {
        const newRoom = {
          id: Date.now().toString(),
          name: '',
          type: '',
          capacity: 2,
          size: '',
          amenities: [],
          description: '',
          images: [],
          priceInfo: {
            basePrice: 0,
            weekendSurcharge: 0,
            peakSeasonSurcharge: 0
          },
          ...roomData
        };
        
        set((state) => {
          state.rooms.push(newRoom);
        });
        
        saveRoomsToLocalStorage(get().rooms);
        return newRoom.id;
      },

      // 객실 업데이트 (부분 업데이트 지원)
      updateRoom: (roomId, updates) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1) {
            Object.assign(state.rooms[roomIndex], updates);
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 특정 객실의 특정 필드만 업데이트
      updateRoomField: (roomId, field, value) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1) {
            if (field.includes('.')) {
              // 중첩된 객체 처리 (예: 'priceInfo.basePrice')
              const [parent, child] = field.split('.');
              if (state.rooms[roomIndex][parent]) {
                state.rooms[roomIndex][parent][child] = value;
              }
            } else {
              state.rooms[roomIndex][field] = value;
            }
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 객실 삭제
      removeRoom: (roomId) => {
        set((state) => {
          state.rooms = state.rooms.filter(room => room.id !== roomId);
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 객실 순서 변경
      reorderRooms: (startIndex, endIndex) => {
        set((state) => {
          const result = Array.from(state.rooms);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          state.rooms = result;
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 객실 이미지 관리
      addRoomImage: (roomId, imageData) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1) {
            state.rooms[roomIndex].images.push(imageData);
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      removeRoomImage: (roomId, imageIndex) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1) {
            state.rooms[roomIndex].images.splice(imageIndex, 1);
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 어메니티 관리
      addAmenity: (roomId, amenity) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1 && !state.rooms[roomIndex].amenities.includes(amenity)) {
            state.rooms[roomIndex].amenities.push(amenity);
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      removeAmenity: (roomId, amenity) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (roomIndex !== -1) {
            state.rooms[roomIndex].amenities = state.rooms[roomIndex].amenities.filter(a => a !== amenity);
          }
        });
        
        saveRoomsToLocalStorage(get().rooms);
      },

      // 편집 상태 관리
      setEditingRoom: (roomId) => {
        set((state) => {
          state.editingRoomId = roomId;
        });
      },

      clearEditingRoom: () => {
        set((state) => {
          state.editingRoomId = null;
        });
      },

      // 로컬스토리지에서 데이터 로드
      loadRoomsFromLocalStorage: () => {
        try {
          const savedRooms = localStorage.getItem('roomsData');
          if (savedRooms) {
            const parsedRooms = JSON.parse(savedRooms);
            set((state) => {
              state.rooms = parsedRooms;
            });
          }
        } catch (error) {
          console.warn('객실 데이터 로컬스토리지 로드 실패:', error);
        }
      },

      // 데이터 초기화
      resetRooms: () => {
        set((state) => {
          state.rooms = [];
          state.editingRoomId = null;
        });
        localStorage.removeItem('roomsData');
      },

      // 특정 객실 조회
      getRoomById: (roomId) => {
        return get().rooms.find(room => room.id === roomId);
      },

      // 객실 복제
      duplicateRoom: (roomId) => {
        const sourceRoom = get().getRoomById(roomId);
        if (sourceRoom) {
          const duplicatedRoom = {
            ...sourceRoom,
            id: Date.now().toString(),
            name: `${sourceRoom.name} (복사본)`
          };
          
          set((state) => {
            state.rooms.push(duplicatedRoom);
          });
          
          saveRoomsToLocalStorage(get().rooms);
          return duplicatedRoom.id;
        }
        return null;
      }
    }))
  )
);

export default useRoomStore; 