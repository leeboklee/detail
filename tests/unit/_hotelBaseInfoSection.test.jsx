import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppContext } from '../../app/context/AppContext.jsx'; // Corrected relative path
import HotelBaseInfoSection from '../../app/components/sections/HotelBaseInfoSection.jsx'; // Corrected relative path

// AppContext Mock
const mockUpdateHotelInfo = vi.fn();
const mockHotelInfo = {
  name: 'Initial Hotel',
  address: 'Initial Address',
  description: 'Initial Description'
};

// Mock AppContext Provider 수정
const MockAppContextProvider = ({ children }) => (
  <AppContext.Provider value={{ 
    hotelInfo: mockHotelInfo, 
    updateHotelInfo: mockUpdateHotelInfo,
    // 추가 필요한 AppContext 기본값 추가
    roomInfo: [],
    facilitiesInfo: [],
    checkinInfo: {},
    periodInfo: {},
    priceInfo: {},
    cancelInfo: {},
    bookingInfo: {},
    noticeInfo: {},
    sections: [],
    updateRoomInfo: vi.fn(),
    updateFacilitiesInfo: vi.fn(),
    updateCheckinInfo: vi.fn(),
    updatePeriodInfo: vi.fn(),
    updatePriceInfo: vi.fn(),
    updateCancelInfo: vi.fn(),
    updateBookingInfo: vi.fn(),
    updateNoticeInfo: vi.fn(),
    updateSections: vi.fn(),
    updateSectionVisibility: vi.fn(),
    updateHtmlPreviewData: vi.fn(),
    updateSelectedTab: vi.fn(),
    resetData: vi.fn(),
    batchUpdateSectionData: vi.fn(),
  }}>
    {children}
  </AppContext.Provider>
);

describe('HotelBaseInfoSection', () => {
  beforeEach(() => {
    // 각 테스트 전에 mock 함수 호출 기록 초기화
    mockUpdateHotelInfo.mockClear();
  });

  it('renders input fields with initial values from context', () => {
    render(
      <MockAppContextProvider>
        <HotelBaseInfoSection />
      </MockAppContextProvider>
    );

    // 레이블 텍스트로 입력 필드를 찾고 초기 값 확인
    expect(screen.getByLabelText(/호텔 이름/i)).toHaveValue(mockHotelInfo.name);
    expect(screen.getByLabelText(/주소/i)).toHaveValue(mockHotelInfo.address);
    expect(screen.getByLabelText(/설명/i)).toHaveValue(mockHotelInfo.description);
  });

  it('calls updateHotelInfo with updated values when name is changed', () => {
    render(
      <MockAppContextProvider>
        <HotelBaseInfoSection />
      </MockAppContextProvider>
    );
    const nameInput = screen.getByLabelText(/호텔 이름/i);
    const newName = 'Updated Hotel Name';

    fireEvent.change(nameInput, { target: { value: newName } });

    // updateHotelInfo가 올바른 데이터로 호출되었는지 확인
    expect(mockUpdateHotelInfo).toHaveBeenCalledTimes(1);
    expect(mockUpdateHotelInfo).toHaveBeenCalledWith({
      name: newName,
      address: mockHotelInfo.address, // 다른 값은 그대로 유지
      description: mockHotelInfo.description
    });
  });

  it('calls updateHotelInfo with updated values when address is changed', () => {
    render(
      <MockAppContextProvider>
        <HotelBaseInfoSection />
      </MockAppContextProvider>
    );
    const addressInput = screen.getByLabelText(/주소/i);
    const newAddress = 'Updated Address 123';

    fireEvent.change(addressInput, { target: { value: newAddress } });

    expect(mockUpdateHotelInfo).toHaveBeenCalledTimes(1);
    expect(mockUpdateHotelInfo).toHaveBeenCalledWith({
      name: mockHotelInfo.name,
      address: newAddress,
      description: mockHotelInfo.description
    });
  });

  it('calls updateHotelInfo with updated values when description is changed', () => {
    render(
      <MockAppContextProvider>
        <HotelBaseInfoSection />
      </MockAppContextProvider>
    );
    const descriptionInput = screen.getByLabelText(/설명/i);
    const newDescription = 'New description content.';

    fireEvent.change(descriptionInput, { target: { value: newDescription } });

    expect(mockUpdateHotelInfo).toHaveBeenCalledTimes(1);
    expect(mockUpdateHotelInfo).toHaveBeenCalledWith({
      name: mockHotelInfo.name,
      address: mockHotelInfo.address,
      description: newDescription
    });
  });
}); 