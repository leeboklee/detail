import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // 원본 호텔 데이터 조회
    const originalHotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: true,
        facilities: true,
        packages: true,
        notices: true,
      },
    });

    if (!originalHotel) {
      return NextResponse.json({ 
        success: false, 
        error: '템플릿을 찾을 수 없습니다.' 
      });
    }

    // 복제된 호텔 생성
    const duplicatedHotel = await prisma.hotel.create({
      data: {
        hotelName: `${originalHotel.hotelName} (복사본)`,
        description: originalHotel.description,
        address: originalHotel.address,
        tel: originalHotel.tel,
        features: originalHotel.features,
        images: originalHotel.images,
        isTemplate: originalHotel.isTemplate,
        templateName: originalHotel.templateName ? `${originalHotel.templateName} (복사본)` : null,
        isActive: originalHotel.isActive,
      },
    });

    // 관련 데이터 복제
    if (originalHotel.rooms?.length > 0) {
      await Promise.all(
        originalHotel.rooms.map(room =>
          prisma.room.create({
            data: {
              hotelId: duplicatedHotel.id,
              roomType: room.roomType,
              price: room.price,
              maxOccupancy: room.maxOccupancy,
              description: room.description,
              images: room.images,
              amenities: room.amenities,
              isActive: room.isActive,
            },
          })
        )
      );
    }

    if (originalHotel.facilities?.length > 0) {
      await Promise.all(
        originalHotel.facilities.map(facility =>
          prisma.facility.create({
            data: {
              hotelId: duplicatedHotel.id,
              name: facility.name,
              description: facility.description,
              category: facility.category,
              icon: facility.icon,
              isActive: facility.isActive,
            },
          })
        )
      );
    }

    if (originalHotel.packages?.length > 0) {
      await Promise.all(
        originalHotel.packages.map((pkg) =>
          prisma.package.create({
            data: {
              hotelId: duplicatedHotel.id,
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
            },
          })
        )
      );
    }

    if (originalHotel.notices?.length > 0) {
      await Promise.all(
        originalHotel.notices.map(notice =>
          prisma.notice.create({
            data: {
              hotelId: duplicatedHotel.id,
              title: notice.title,
              content: notice.content,
              isActive: notice.isActive,
            },
          })
        )
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: '템플릿이 성공적으로 복제되었습니다.',
      hotel: duplicatedHotel 
    });

  } catch (error) {
    console.error('템플릿 복제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
} 