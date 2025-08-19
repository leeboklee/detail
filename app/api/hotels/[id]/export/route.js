import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // 호텔 데이터 조회 (모든 관련 데이터 포함)
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: true,
        facilities: true,
        packages: true,
        notices: true,
      },
    });

    if (!hotel) {
      return NextResponse.json({ 
        success: false, 
        error: '템플릿을 찾을 수 없습니다.' 
      });
    }

    // 내보내기용 데이터 구조 생성
    const exportData = {
      hotel: {
        id: hotel.id,
        hotelName: hotel.hotelName,
        description: hotel.description,
        address: hotel.address,
        tel: hotel.tel,
        features: hotel.features,
        images: hotel.images,
        isTemplate: hotel.isTemplate,
        templateName: hotel.templateName,
        isActive: hotel.isActive,
        createdAt: hotel.createdAt,
        updatedAt: hotel.updatedAt,
      },
      rooms: hotel.rooms.map(room => ({
        id: room.id,
        roomType: room.roomType,
        price: room.price,
        maxOccupancy: room.maxOccupancy,
        description: room.description,
        images: room.images,
        amenities: room.amenities,
        isActive: room.isActive,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      })),
      facilities: hotel.facilities.map(facility => ({
        id: facility.id,
        name: facility.name,
        description: facility.description,
        category: facility.category,
        icon: facility.icon,
        isActive: facility.isActive,
        createdAt: facility.createdAt,
        updatedAt: facility.updatedAt,
      })),
      packages: hotel.packages.map((pkg) => ({ 
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        images: pkg.images,
        features: pkg.features,
        terms: pkg.terms,
        validFrom: pkg.validFrom,
        validTo: pkg.validTo,
        isActive: pkg.isActive,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      })),
      notices: hotel.notices.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        isActive: notice.isActive,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
      })),
      exportInfo: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        databaseType: 'hotel_detail_db',
      },
    };

    return NextResponse.json({ 
      success: true, 
      message: '템플릿이 성공적으로 내보내기되었습니다.',
      data: exportData 
    });

  } catch (error) {
    console.error('템플릿 내보내기 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
} 