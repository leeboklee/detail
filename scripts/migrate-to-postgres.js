const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite 연결
const sqliteDb = new sqlite3.Database(path.join(__dirname, '../dev.db'));

// PostgreSQL Prisma 클라이언트
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 마이그레이션 시작...');
    
    // SQLite에서 데이터 읽기
    const packages = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM Package', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📦 ${packages.length}개의 패키지 발견`);
    
    // PostgreSQL로 데이터 이전
    for (const pkg of packages) {
      await prisma.package.create({
        data: {
          name: pkg.name,
          description: pkg.description,
          salesPeriod: pkg.salesPeriod,
          stayPeriod: pkg.stayPeriod,
          createdAt: new Date(pkg.createdAt),
          updatedAt: new Date(pkg.updatedAt)
        }
      });
    }
    
    console.log('✅ 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

migrateData();
