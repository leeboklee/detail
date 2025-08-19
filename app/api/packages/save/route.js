import { PrismaClient } from '@prisma/client'

let prisma

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

// 패키지 템플릿 저장
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, packages, hotelId } = body;

    const packageTemplate = await getPrismaClient().packageTemplate.create({
      data: {
        name,
        packages: packages,
        hotelId: hotelId || 'default',
        isActive: true
      }
    });

    return Response.json({ 
      success: true, 
      message: '패키지 템플릿이 저장되었습니다.',
      data: packageTemplate 
    });
  } catch (error) {
    console.error('패키지 템플릿 저장 오류:', error);
    return Response.json({ 
      success: false, 
      message: '패키지 템플릿 저장에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

// 패키지 템플릿 불러오기
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId') || 'default';

    const packageTemplates = await getPrismaClient().packageTemplate.findMany({
      where: {
        hotelId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ 
      success: true, 
      data: packageTemplates 
    });
  } catch (error) {
    console.error('패키지 템플릿 불러오기 오류:', error);
    return Response.json({ 
      success: false, 
      message: '패키지 템플릿 불러오기에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}