const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');
  
  const hotel = await prisma.hotel.create({
    data: {
      hotelName: '테스트 호텔',
      description: '이곳은 테스트 호텔입니다.',
      address: '서울시 강남구 테스트로 123',
      tel: '02-1234-5678',
    },
  });

  console.log(`Created hotel with id: ${hotel.id}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 