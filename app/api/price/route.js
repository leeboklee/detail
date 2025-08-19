import { prisma } from '../../../src/shared/lib/prisma.js';

const defaultPriceConfig = {
	id: 1,
	hotelId: 1,
	additionalChargesInfo: '체크인 시 보증금 50,000원이 필요합니다.',
	lodges: [
		{
			name: '샘플 호텔',
			rooms: [
				{
					roomType: '스탠다드',
					view: '시티뷰',
					prices: { weekday: 100000, friday: 120000, saturday: 150000 },
				},
				{
					roomType: '디럭스',
					view: '시티뷰',
					prices: { weekday: 150000, friday: 180000, saturday: 220000 },
				},
			],
		},
	],
	dayTypes: [
		{ id: 'weekday', name: '주중(월~목)', type: 'weekday' },
		{ id: 'friday', name: '금요일', type: 'friday' },
		{ id: 'saturday', name: '토요일', type: 'saturday' },
	],
};

export async function GET(request) {
	try {
		console.log('API price GET - 요청 시작');
		const { searchParams } = new URL(request.url);
		const hotelId = searchParams.get('hotelId');

		if (!hotelId) {
			console.log('API price GET - 기본 요금 정보 반환');
			return Response.json(defaultPriceConfig);
		}

		const priceConfig = await prisma.priceConfiguration.findUnique({
			where: { hotelId: parseInt(hotelId) },
		});

		if (!priceConfig) {
			return Response.json({ message: 'Price configuration not found for this hotel' }, { status: 404 });
		}

		console.log('API price GET - 응답 데이터 준비 완료');
		return Response.json(priceConfig);
	} catch (error) {
		console.error('Error fetching price configuration:', error);
		return Response.json({ error: 'Failed to fetch price configuration' }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const body = await request.json();
		const { hotelId, additionalChargesInfo, lodges, dayTypes } = body;

		if (!hotelId) {
			return Response.json({ error: 'Hotel ID is required' }, { status: 400 });
		}

		const upsertedPriceConfig = await prisma.priceConfiguration.upsert({
			where: { hotelId: parseInt(hotelId) },
			update: {
				additionalChargesInfo,
				lodges: { set: lodges },
				dayTypes: { set: dayTypes },
			},
			create: {
				hotelId: parseInt(hotelId),
				additionalChargesInfo,
				lodges,
				dayTypes,
			},
		});

		return Response.json(upsertedPriceConfig);
	} catch (error) {
		console.error('Error upserting price configuration:', error);
		return Response.json({ error: 'Failed to upsert price configuration' }, { status: 500 });
	}
} 