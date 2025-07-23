import { neon } from '@neondatabase/serverless';

let sql;

if (process.env.DATABASE_URL) {
  const neonSql = neon(process.env.DATABASE_URL);

  // Define sql as a function that can also have properties
  sql = async (strings, ...values) => {
    return neonSql(strings, ...values);
  };

  sql.begin = async () => {
    await neonSql`BEGIN`;
  };

  sql.commit = async () => {
    await neonSql`COMMIT`;
  };

  sql.rollback = async () => {
    await neonSql`ROLLBACK`;
  };

  sql.transaction = async (callback) => {
    await sql.begin();
    try {
      const result = await callback();
      await sql.commit();
      return result;
    } catch (error) {
      await sql.rollback();
      throw error;
    }
  };

  // unsafe 메서드를 sql 객체에 추가
  sql.unsafe = neonSql.unsafe;

  console.log('✅ 데이터베이스 연결 URL이 감지되었습니다. Neon 데이터베이스에 연결합니다.');

} else {
  console.warn('⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다. 데이터베이스 작업이 비활성화됩니다.');
  // Mock sql object for when DATABASE_URL is not set
  // eslint-disable-next-line no-unused-vars
  sql = async (strings, ..._values) => {
    console.warn('❌ DATABASE_URL이 없어 데이터베이스 작업이 비활성화되었습니다. 쿼리 실행 무시:', strings.join(''));
    return { rows: [], fields: [] }; // Simulate empty result for queries
  };

  sql.begin = async () => {
    console.warn('❌ DATABASE_URL이 없어 트랜잭션 작업이 비활성화되었습니다. begin 실행 무시.');
  };

  sql.commit = async () => {
    console.warn('❌ DATABASE_URL이 없어 트랜잭션 작업이 비활성화되었습니다. commit 실행 무시.');
  };

  sql.rollback = async () => {
    console.warn('❌ DATABASE_URL이 없어 트랜잭션 작업이 비활성화되었습니다. rollback 실행 무시.');
  };

  sql.transaction = async (callback) => {
    console.warn('❌ DATABASE_URL이 없어 트랜잭션 작업이 비활성화되었습니다. transaction 실행 무시.');
    return callback(); // Just run the callback, no actual transaction
  };
}

export { sql };

// 데이터베이스 초기화 함수
export async function initDatabase() {
  try {
    console.log('🔧 데이터베이스 초기화 시작...');

    // DATABASE_URL이 설정되지 않은 경우 데이터베이스 작업 건너뛰기
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL 환경 변수가 설정되지 않아 데이터베이스 초기화 스킵합니다. 실제 데이터베이스 작업은 수행되지 않습니다.');
      return true; // 서버 시작을 위해 초기화 성공으로 간주
    }

    // 기존 테이블 삭제 (필요한 경우)
    // console.log('🗑️ 기존 테이블 삭제 중...');
    // await sql`DROP TABLE IF EXISTS packages CASCADE`;
    // await sql`DROP TABLE IF EXISTS rooms CASCADE`;
    // await sql`DROP TABLE IF EXISTS hotels CASCADE`;
    // console.log('✅ 기존 테이블 삭제 완료');

    // 호텔 테이블 생성
    console.log('🏗️ hotels 테이블 생성 쿼리 실행 중...');
    await sql`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        description TEXT,
        image_url TEXT,
        phone VARCHAR(50),
        checkin_time VARCHAR(10),
        checkout_time VARCHAR(10),
        html_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ hotels 테이블 생성 완료.');

    // 객실 테이블 생성
    console.log('🏗️ rooms 테이블 생성 쿼리 실행 중...');
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
        room_name VARCHAR(255) NOT NULL,
        room_type VARCHAR(255),
        capacity INTEGER,
        price DECIMAL(10, 2),
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ rooms 테이블 생성 완료.');

    // 패키지 테이블 생성
    console.log('🏗️ packages 테이블 생성 쿼리 실행 중...');
    await sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
        package_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        available_from DATE,
        available_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ packages 테이블 생성 완료.');

    // 기본 데이터 삽입 (선택 사항)
    // const existingHotels = await sql`SELECT COUNT(*) FROM hotels`; // Directly assign the array of rows
    // console.log('디버그: existingHotels 쿼리 결과:', existingHotels);
    // if (existingHotels && existingHotels.length > 0 && existingHotels[0].count !== undefined && parseInt(existingHotels[0].count) === 0) {
    //   console.log('➕ 기본 호텔 데이터 삽입 중...');
    //   await sql`
    //     INSERT INTO hotels (name, address, description, image_url, phone, checkin_time, checkout_time, html_content)
    //     VALUES (
    //       '그랜드 파크 호텔',
    //       '서울시 강남구 테헤란로 123',
    //       '도심 속 럭셔리 휴식을 제공하는 호텔입니다.',
    //       'https://example.com/hotel_image.jpg',
    //       '02-1234-5678',
    //       '15:00',
    //       '11:00',
    //       '<h1>그랜드 파크 호텔</h1><p>최고의 서비스로 모십니다.</p>'
    //     )
    //   `;
    //   console.log('✅ 기본 호텔 데이터 삽입 완료');
    // }

    console.log('✨ 데이터베이스 초기화 및 기본 데이터 준비 완료.');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류:', error);
    console.error('오류 상세:', error.message);
    return false;
  }
}

// 샘플 데이터 저장 함수
export async function saveDebugSample(sampleData) {
  try {
    console.log('🔧 샘플 데이터 저장 시작...');
    
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL 환경 변수가 설정되지 않아 샘플 데이터 저장을 건너뜁니다.');
      return false;
    }

    // 호텔 데이터 저장
    if (sampleData.hotel) {
      console.log('🏨 호텔 샘플 데이터 저장 중...');
      const hotelResult = await sql`
        INSERT INTO hotels (name, address, description, image_url, phone, checkin_time, checkout_time, html_content)
        VALUES (
          ${sampleData.hotel.name || '샘플 호텔'},
          ${sampleData.hotel.address || '샘플 주소'},
          ${sampleData.hotel.description || '샘플 설명'},
          ${sampleData.hotel.image_url || 'https://example.com/sample.jpg'},
          ${sampleData.hotel.phone || '02-1234-5678'},
          ${sampleData.hotel.checkin_time || '15:00'},
          ${sampleData.hotel.checkout_time || '11:00'},
          ${sampleData.hotel.html_content || '<h1>샘플 호텔</h1><p>테스트용 데이터입니다.</p>'}
        ) RETURNING id
      `;
      console.log('✅ 호텔 샘플 데이터 저장 완료:', hotelResult[0]?.id);
      
      const hotelId = hotelResult[0]?.id;
      
      // 객실 데이터 저장
      if (sampleData.rooms && hotelId) {
        console.log('🛏️ 객실 샘플 데이터 저장 중...');
        for (const room of sampleData.rooms) {
          await sql`
            INSERT INTO rooms (hotel_id, room_name, room_type, capacity, price, description, image_url)
            VALUES (
              ${hotelId},
              ${room.room_name || '샘플 객실'},
              ${room.room_type || '스탠다드'},
              ${room.capacity || 2},
              ${room.price || 100000},
              ${room.description || '샘플 객실 설명'},
              ${room.image_url || 'https://example.com/room.jpg'}
            )
          `;
        }
        console.log('✅ 객실 샘플 데이터 저장 완료');
      }
      
      // 패키지 데이터 저장
      if (sampleData.packages && hotelId) {
        console.log('📦 패키지 샘플 데이터 저장 중...');
        for (const pkg of sampleData.packages) {
          await sql`
            INSERT INTO packages (hotel_id, package_name, description, price, available_from, available_to)
            VALUES (
              ${hotelId},
              ${pkg.package_name || '샘플 패키지'},
              ${pkg.description || '샘플 패키지 설명'},
              ${pkg.price || 150000},
              ${pkg.available_from || '2025-01-01'},
              ${pkg.available_to || '2025-12-31'}
            )
          `;
        }
        console.log('✅ 패키지 샘플 데이터 저장 완료');
      }
    }
    
    console.log('✨ 샘플 데이터 저장 완료');
    return true;
  } catch (error) {
    console.error('❌ 샘플 데이터 저장 중 오류:', error);
    return false;
  }
} 