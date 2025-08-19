import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { databaseType } = await request.json();
    
    if (!['sqlite', 'postgresql'].includes(databaseType)) {
      return NextResponse.json({ 
        success: false, 
        error: '지원하지 않는 데이터베이스 타입입니다.' 
      });
    }

    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');

    if (databaseType === 'sqlite') {
      // SQLite 설정으로 변경
      schemaContent = schemaContent.replace(
        /datasource db \{[^}]*\}/s,
        `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
      );
      
      // Decimal 타입을 Float로 변경
      schemaContent = schemaContent.replace(/Decimal\s+@db\.Decimal\([^)]*\)/g, 'Float');
      schemaContent = schemaContent.replace(/Decimal\?/g, 'Float?');
      
    } else if (databaseType === 'postgresql') {
      // PostgreSQL 설정으로 변경
      schemaContent = schemaContent.replace(
        /datasource db \{[^}]*\}/s,
        `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
      );
      
      // Float 타입을 Decimal로 변경
      schemaContent = schemaContent.replace(/price\s+Float/g, 'price        Decimal  @db.Decimal(10, 2)');
      schemaContent = schemaContent.replace(/originalPrice\s+Float\?/g, 'originalPrice Decimal?  @db.Decimal(10, 2)');
    }

    // 스키마 파일 저장
    fs.writeFileSync(schemaPath, schemaContent);

    // Prisma 클라이언트 재생성
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate', { stdio: 'pipe' });
      execSync('npx prisma db push', { stdio: 'pipe' });
    } catch (error) {
      console.error('Prisma 명령어 실행 오류:', error);
      return NextResponse.json({ 
        success: false, 
        error: '데이터베이스 스키마 업데이트 실패' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${databaseType === 'postgresql' ? 'PostgreSQL' : 'SQLite'}로 전환 완료`,
      databaseType 
    });

  } catch (error) {
    console.error('데이터베이스 전환 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
} 