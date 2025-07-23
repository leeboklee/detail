import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // 기존 데이터 정리
  await prisma.log.deleteMany();
  await prisma.session.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.package.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ 기존 데이터 정리 완료');

  // 관리자 사용자 생성
  const admin = await prisma.user.create({
    data: {
      email: 'admin@detailpage.com',
      name: '관리자',
      role: 'admin',
      isActive: true
    }
  });

  console.log('👤 관리자 계정 생성 완료');

  // 템플릿 호텔 생성
  const templateHotel = await prisma.hotel.create({
    data: {
      hotelName: '럭셔리 시티 호텔',
      description: '도심 속 최고급 호텔로 편안한 휴식과 최상의 서비스를 제공합니다.',
      address: '서울특별시 강남구 테헤란로 123',
      tel: '02-1234-5678',
      features: [
        '24시간 룸서비스',
        '피트니스 센터',
        '비즈니스 센터',
        '레스토랑',
        '바',
        '실내 수영장'
      ],
      images: [
        '/images/hotels/luxury-exterior.jpg',
        '/images/hotels/luxury-lobby.jpg',
        '/images/hotels/luxury-pool.jpg'
      ],
      isTemplate: true,
      templateName: '럭셔리 호텔 템플릿',
      isActive: true
    }
  });

  console.log('🏨 템플릿 호텔 생성 완료');

  // 객실 생성
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        hotelId: templateHotel.id,
        roomType: '디럭스 킹룸',
        price: 180000,
        maxOccupancy: 2,
        description: '킹 사이즈 침대가 있는 넓은 객실로 도시 전망을 감상할 수 있습니다.',
        images: ['/images/rooms/deluxe-king.jpg'],
        amenities: [
          '킹 사이즈 침대',
          '시티뷰',
          '무료 WiFi',
          '미니바',
          '에어컨',
          '금고',
          '업무용 책상'
        ],
        isActive: true
      }
    }),
    prisma.room.create({
      data: {
        hotelId: templateHotel.id,
        roomType: '프리미엄 트윈룸',
        price: 160000,
        maxOccupancy: 2,
        description: '트윈 침대가 있는 프리미엄 객실로 편안한 휴식을 제공합니다.',
        images: ['/images/rooms/premium-twin.jpg'],
        amenities: [
          '트윈 침대',
          '시티뷰',
          '무료 WiFi',
          '미니바',
          '에어컨',
          '금고',
          '소파'
        ],
        isActive: true
      }
    }),
    prisma.room.create({
      data: {
        hotelId: templateHotel.id,
        roomType: '스위트룸',
        price: 350000,
        maxOccupancy: 4,
        description: '별도의 거실과 침실이 있는 넓은 스위트룸입니다.',
        images: ['/images/rooms/suite.jpg'],
        amenities: [
          '킹 사이즈 침대',
          '별도 거실',
          '발코니',
          '무료 WiFi',
          '미니바',
          '에어컨',
          '금고',
          '소파베드',
          '비즈니스 공간'
        ],
        isActive: true
      }
    })
  ]);

  console.log('🛏️ 객실 3개 생성 완료');

  // 시설 생성
  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        hotelId: templateHotel.id,
        name: '피트니스 센터',
        description: '최신 운동기구를 갖춘 24시간 피트니스 센터',
        category: '건강/웰니스',
        icon: 'fitness',
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        hotelId: templateHotel.id,
        name: '실내 수영장',
        description: '온수 실내 수영장 및 자쿠지',
        category: '레저',
        icon: 'pool',
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        hotelId: templateHotel.id,
        name: '비즈니스 센터',
        description: '회의실 및 비즈니스 시설',
        category: '비즈니스',
        icon: 'business',
        isActive: true
      }
    }),
    prisma.facility.create({
      data: {
        hotelId: templateHotel.id,
        name: '스카이 라운지',
        description: '옥상 라운지 바',
        category: '식음료',
        icon: 'bar',
        isActive: true
      }
    })
  ]);

  console.log('🏢 시설 4개 생성 완료');

  // 패키지 생성
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        hotelId: templateHotel.id,
        title: '여름 휴가 패키지',
        description: '여름 성수기 특별 패키지로 조식과 스파 서비스가 포함됩니다.',
        price: 220000,
        originalPrice: 280000,
        images: ['/images/packages/summer-package.jpg'],
        features: [
          '조식 2인',
          '스파 할인 30%',
          '수영장 무료 이용',
          '늦은 체크아웃 (14시까지)'
        ],
        terms: '여름 시즌 한정 (6월~8월)',
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2024-08-31'),
        isActive: true
      }
    }),
    prisma.package.create({
      data: {
        hotelId: templateHotel.id,
        title: '비즈니스 패키지',
        description: '출장객을 위한 특별 패키지',
        price: 200000,
        originalPrice: 250000,
        images: ['/images/packages/business-package.jpg'],
        features: [
          '조식 포함',
          '비즈니스 센터 무료 이용',
          '무료 주차',
          '회의실 할인 20%'
        ],
        terms: '평일 한정 (월~목)',
        isActive: true
      }
    })
  ]);

  console.log('📦 패키지 2개 생성 완료');

  // 공지사항 생성
  const notices = await Promise.all([
    prisma.notice.create({
      data: {
        hotelId: templateHotel.id,
        title: '체크인 시간 안내',
        content: '체크인 시간은 오후 3시부터이며, 체크아웃은 오전 11시까지입니다.',
        priority: 10,
        isActive: true
      }
    }),
    prisma.notice.create({
      data: {
        hotelId: templateHotel.id,
        title: '주차 안내',
        content: '지하 1층~3층에 무료 주차가 가능합니다. 발레 파킹 서비스도 이용 가능합니다.',
        priority: 5,
        isActive: true
      }
    }),
    prisma.notice.create({
      data: {
        hotelId: templateHotel.id,
        title: '코로나19 방역 수칙',
        content: '객실 및 공용구역은 철저한 방역 소독을 실시하고 있습니다.',
        priority: 8,
        isActive: true
      }
    })
  ]);

  console.log('📢 공지사항 3개 생성 완료');

  // 로그 생성
  await prisma.log.create({
    data: {
      level: 'info',
      message: '데이터베이스 시드 완료',
      data: {
        hotels: 1,
        rooms: rooms.length,
        facilities: facilities.length,
        packages: packages.length,
        notices: notices.length
      },
      source: 'seed'
    }
  });

  console.log('✅ 시드 데이터 생성 완료!');
  console.log(`
📊 생성된 데이터:
- 호텔: 1개 (템플릿)
- 객실: ${rooms.length}개
- 시설: ${facilities.length}개  
- 패키지: ${packages.length}개
- 공지사항: ${notices.length}개
- 사용자: 1개 (관리자)
  `);
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 