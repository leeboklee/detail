import { prisma } from '../../../src/shared/lib/prisma.js';

const defaultPriceConfig = {
    id: 1,
    hotelId: 1,
    additionalChargesInfo: "체크인 시 보증금 50,000원이 필요합니다.",
    lodges: [
        {
            name: "샘플 호텔",
            rooms: [
                {
                    roomType: "스탠다드",
                    view: "시티뷰",
                    prices: { weekday: 100000, friday: 120000, saturday: 150000 }
                },
                {
                    roomType: "디럭스",
                    view: "시티뷰",
                    prices: { weekday: 150000, friday: 180000, saturday: 220000 }
                }
            ]
        }
    ],
    dayTypes: [
        { id: "weekday", name: "주중(월~목)", type: "weekday" },
        { id: "friday", name: "금요일", type: "friday" },
        { id: "saturday", name: "토요일", type: "saturday" }
    ]
};

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                console.log('API price GET - 요청 시작');
                const { hotelId } = req.query;

                if (!hotelId) {
                    console.log('API price GET - 기본 요금 정보 반환');
                    return res.status(200).json(defaultPriceConfig);
                }

                const priceConfig = await prisma.priceConfiguration.findUnique({
                    where: { hotelId: parseInt(hotelId) },
                });

                if (!priceConfig) {
                    return res.status(404).json({ message: 'Price configuration not found for this hotel' });
                }

                console.log('API price GET - 응답 데이터 준비 완료');
                return res.status(200).json(priceConfig);
            } catch (error) {
                console.error('Error fetching price configuration:', error);
                return res.status(500).json({ error: 'Failed to fetch price configuration' });
            }

        case 'POST':
            try {
                const { hotelId, additionalChargesInfo, lodges, dayTypes } = req.body;

                if (!hotelId) {
                    return res.status(400).json({ error: 'Hotel ID is required' });
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

                return res.status(200).json(upsertedPriceConfig);
            } catch (error) {
                console.error('Error upserting price configuration:', error);
                return res.status(500).json({ error: 'Failed to upsert price configuration' });
            }
        
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
} 