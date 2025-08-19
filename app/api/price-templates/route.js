import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, template, hotelId } = body;
    
    if (!name || !template) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿 이름과 데이터가 필요합니다' 
      }, { status: 400 });
    }

    // 요금표 템플릿 저장
    const savedTemplate = await getPrismaClient().priceTemplate.create({
      data: {
        name,
        template: template,
        hotelId: hotelId || 'default',
        isActive: true
      }
    });
    
    console.log('✅ 요금표 템플릿 저장:', name);
    return NextResponse.json({ 
      success: true, 
      message: '요금표 템플릿이 성공적으로 저장되었습니다.', 
      data: savedTemplate 
    });
  } catch (error) {
    console.error('🔴 요금표 템플릿 저장 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '요금표 템플릿 저장에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId') || 'default';
    
    const templates = await getPrismaClient().priceTemplate.findMany({
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
      message: '요금표 템플릿 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('🔴 요금표 템플릿 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '요금표 템플릿 조회에 실패했습니다.',
      data: []
    }, { status: 500 });
  }
}
