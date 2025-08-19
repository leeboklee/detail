// Prisma 오류 시뮬레이션 API
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 의도적으로 Prisma 오류 발생
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Prisma 클라이언트 초기화 오류 시뮬레이션
    await prisma.$connect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Prisma 연결 성공' 
    });
  } catch (error) {
    console.error('🔴 Prisma 오류 시뮬레이션:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Prisma 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 