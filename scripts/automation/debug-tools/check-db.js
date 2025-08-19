import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'env.local') });

const dbUrl = process.env.DATABASE_URL;

console.log(`DEBUG: DATABASE_URL in check-db.js: ${dbUrl}`);

async function checkDatabase() {
  if (!dbUrl) {
    console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    return;
  }

  const sql = neon(dbUrl);

  try {
    console.log('🔍 데이터베이스 연결 및 호텔 데이터 조회 시작...');

    const hotels = await sql`SELECT id, name, address FROM hotels ORDER BY created_at DESC LIMIT 5`;

    if (hotels.length > 0) {
      console.log('✅ 조회된 호텔 목록:');
      hotels.forEach(hotel => {
        console.log(`- ID: ${hotel.id}, 이름: ${hotel.name}, 주소: ${hotel.address}`);
      });
    } else {
      console.log('⚠️ 데이터베이스에 저장된 호텔이 없습니다.');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 조회 중 오류:', error);
  } finally {
    // Neon serverless connection should automatically close after query
  }
}

checkDatabase(); 