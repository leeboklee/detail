import { prisma } from '../../../src/shared/lib/prisma.js';

export async function POST() {
	try {
		console.log('🔧 데이터베이스 초기화 시작...');

		await prisma.package.deleteMany();
		await prisma.room.deleteMany();
		await prisma.notice.deleteMany();
		await prisma.hotel.deleteMany();
		console.log('✅ 데이터베이스 초기화 완료');

		return Response.json({
			success: true,
			message: '데이터베이스가 성공적으로 초기화되었습니다.',
			tables: ['hotels', 'rooms', 'packages', 'notices'],
		});
	} catch (error) {
		console.error('❌ POST /api/init-db error:', error);
		return Response.json(
			{
				success: false,
				error: error.message,
				details: '데이터베이스 초기화 중 오류가 발생했습니다.',
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		console.log('🔍 데이터베이스 상태 확인...');

		const stats = {};
		stats.hotels = await prisma.hotel.count();
		stats.rooms = await prisma.room.count();
		stats.packages = await prisma.package.count();
		stats.notices = await prisma.notice.count();

		console.log('✅ 데이터베이스 상태 확인 완료');

		return Response.json({
			success: true,
			connection: {
				status: 'connected',
				time: new Date(),
			},
			tables: ['hotels', 'rooms', 'packages', 'notices'],
			statistics: stats,
			message: '데이터베이스 연결이 정상적으로 작동합니다.',
		});
	} catch (error) {
		console.error('❌ GET /api/init-db error:', error);
		return Response.json(
			{
				success: false,
				connection: {
					status: 'disconnected',
					error: error.message,
				},
				error: error.message,
				details: '데이터베이스 연결에 실패했습니다.',
			},
			{ status: 500 }
		);
	}
} 