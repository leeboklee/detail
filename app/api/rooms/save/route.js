import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, rooms, hotelId } = body;
    
    if (!name || !rooms) {
      return NextResponse.json({ 
        success: false, 
        message: '객실 템플릿 이름과 데이터가 필요합니다' 
      }, { status: 400 });
    }

    const savedTemplate = await prisma.roomTemplate.create({
      data: {
        name,
        rooms: rooms,
        hotelId: hotelId || 'default',
        isActive: true
      }
    });
    
    console.log('✅ 객실 템플릿 저장:', name);
    return NextResponse.json({ 
      success: true, 
      message: '객실 템플릿이 성공적으로 저장되었습니다.', 
      data: savedTemplate 
    });
  } catch (error) {
    console.error('🔴 객실 저장 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '객실 저장에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId') || 'default';
    
    const templates = await prisma.roomTemplate.findMany({
      where: {
        hotelId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: templates,
      message: '객실 템플릿 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('🔴 객실 템플릿 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '객실 템플릿 조회에 실패했습니다.',
      data: []
    }, { status: 500 });
  }
} 