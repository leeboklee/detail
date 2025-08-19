import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('📋 호텔 목록 조회');
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: true,
        facilities: true,
        packages: true,
        notices: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: hotels,
      message: '호텔 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('🔴 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '호텔 목록 조회에 실패했습니다.',
      data: []
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const newHotel = await prisma.hotel.create({
      data: {
        hotelName: body.name || '새 호텔',
        description: body.description || '',
        address: body.address || '',
        tel: body.phone || '',
        features: body.facilities || {},
        images: body.imageUrl ? [body.imageUrl] : [],
        isTemplate: false,
        isActive: true
      },
      include: {
        rooms: true,
        facilities: true,
        packages: true,
        notices: true
      }
    });
    
    console.log('✅ 호텔 생성:', newHotel.hotelName);
    return NextResponse.json({ 
      success: true, 
      message: '호텔이 성공적으로 저장되었습니다.', 
      data: newHotel 
    });
  } catch (error) {
    console.error('🔴 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '데이터 저장에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID가 필요합니다' 
      }, { status: 400 });
    }
    
    const hotelIndex = hotels.findIndex(hotel => hotel.id === id);
    if (hotelIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '호텔을 찾을 수 없습니다' 
      }, { status: 404 });
    }
    
    hotels[hotelIndex] = { ...hotels[hotelIndex], ...updateData };
    
    console.log('✅ 호텔 수정:', hotels[hotelIndex].name);
    return NextResponse.json({ 
      success: true, 
      message: '호텔 정보가 성공적으로 수정되었습니다.', 
      data: hotels[hotelIndex] 
    });
  } catch (error) {
    console.error('🔴 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '호텔 정보 수정에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID가 필요합니다' 
      }, { status: 400 });
    }

    const hotelIndex = hotels.findIndex(hotel => hotel.id === id);
    if (hotelIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '호텔을 찾을 수 없습니다' 
      }, { status: 404 });
    }
    
    const deletedHotel = hotels.splice(hotelIndex, 1)[0];
    
    console.log('✅ 호텔 삭제:', deletedHotel.name);
    return NextResponse.json({ 
      success: true, 
      message: '호텔 정보가 성공적으로 삭제되었습니다.', 
      data: null 
    });
  } catch (error) {
    console.error('🔴 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '호텔 정보 삭제에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 