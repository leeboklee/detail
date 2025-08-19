import { prisma } from '../../../src/shared/lib/prisma.js';
import { logError, measurePerformance } from '../utils/server-utils.js';

export async function GET(request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const hotelId = searchParams.get('hotelId');
		const isActiveStr = searchParams.get('isActive');
		const isActive = isActiveStr !== 'false';

		console.log('🔍 객실 목록 조회 시작...');

		const whereClause = { isActive };
		if (hotelId) {
			whereClause.hotelId = hotelId;
		}

		const rooms = await prisma.room.findMany({
			where: whereClause,
			include: { hotel: { select: { hotelName: true } } },
			orderBy: { createdAt: 'desc' },
		});

		measurePerformance('GET /api/rooms', startTime);
		console.log(`✅ ${rooms.length}개 객실 조회 완료`);
		return Response.json({ success: true, rooms, count: rooms.length });
	} catch (error) {
		logError('GET /api/rooms', error);
		return Response.json({ success: false, error: error.message, details: '객실 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
	}
}

export async function POST(request) {
	const startTime = Date.now();
	try {
		const { hotelId, roomType, price, maxOccupancy, description, images, amenities } = await request.json();
		console.log('🏨 새 객실 생성 시작:', roomType);

		if (!hotelId || !roomType) {
			return Response.json({ success: false, error: 'hotelId와 roomType은 필수입니다.' }, { status: 400 });
		}

		const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
		if (!hotel) {
			return Response.json({ success: false, error: '존재하지 않는 호텔입니다.' }, { status: 404 });
		}

		const newRoom = await prisma.room.create({
			data: {
				hotelId,
				roomType,
				price: parseFloat(price) || 0,
				maxOccupancy: parseInt(maxOccupancy) || 2,
				description,
				images: images || [],
				amenities: amenities || [],
				isActive: true,
			},
		});

		measurePerformance('POST /api/rooms', startTime);
		console.log('✅ 객실 생성 완료:', newRoom.id);
		return Response.json({ success: true, room: newRoom, message: '객실이 성공적으로 생성되었습니다.' }, { status: 201 });
	} catch (error) {
		logError('POST /api/rooms', error);
		return Response.json({ success: false, error: error.message, details: '객실 생성 중 오류가 발생했습니다.' }, { status: 500 });
	}
}

export async function PUT(request) {
	const startTime = Date.now();
	try {
		const { id, ...updateData } = await request.json();
		if (!id) {
			return Response.json({ success: false, error: '객실 ID가 필요합니다.' }, { status: 400 });
		}
		console.log('🔄 객실 업데이트 시작:', id);

		const updatedRoom = await prisma.room.update({
			where: { id },
			data: {
				roomType: updateData.roomType,
				price: updateData.price ? parseFloat(updateData.price) : undefined,
				maxOccupancy: updateData.maxOccupancy ? parseInt(updateData.maxOccupancy) : undefined,
				description: updateData.description,
				images: updateData.images,
				amenities: updateData.amenities,
				isActive: updateData.isActive !== undefined ? updateData.isActive : undefined,
			},
		});

		measurePerformance('PUT /api/rooms', startTime);
		console.log('✅ 객실 업데이트 완료:', updatedRoom.roomType);
		return Response.json({ success: true, room: updatedRoom, message: '객실 정보가 성공적으로 업데이트되었습니다.' });
	} catch (error) {
		if (error.code === 'P2025') {
			return Response.json({ success: false, error: '객실을 찾을 수 없습니다.' }, { status: 404 });
		}
		logError('PUT /api/rooms', error);
		return Response.json({ success: false, error: error.message, details: '객실 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
	}
}

export async function DELETE(request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		if (!id) {
			return Response.json({ success: false, error: '객실 ID가 필요합니다.' }, { status: 400 });
		}
		console.log('🗑️ 객실 삭제 시작:', id);

		await prisma.room.delete({ where: { id } });

		measurePerformance('DELETE /api/rooms', startTime);
		console.log('✅ 객실 삭제 완료:', id);
		return Response.json({ success: true, message: '객실이 성공적으로 삭제되었습니다.' });
	} catch (error) {
		if (error.code === 'P2025') {
			return Response.json({ success: false, error: '객실을 찾을 수 없습니다.' }, { status: 404 });
		}
		logError('DELETE /api/rooms', error);
		return Response.json({ success: false, error: error.message, details: '객실 삭제 중 오류가 발생했습니다.' }, { status: 500 });
	}
} 