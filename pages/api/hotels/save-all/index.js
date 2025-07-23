import { prisma } from '@shared/lib/prisma.js';
import { logger } from '../../utils/server-utils';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const allData = req.body;
        const hotelInfo = allData.hotel;
        
        logger.info('[/api/hotels/save-all] 수신 데이터:', { hotelName: hotelInfo.name });

        const hotelName = hotelInfo.name;
        if (!hotelName) {
            return res.status(400).json({ success: false, message: '호텔 이름(hotel.name)이 필요합니다.' });
        }

        const dataToSave = {
            hotelName: hotelName,
            description: hotelInfo.description,
            address: hotelInfo.address,
            tel: hotelInfo.phone,
            isTemplate: true,
            features: allData, // 전체 데이터를 'features' JSON 필드에 저장
        };

        const existingTemplate = await prisma.hotel.findFirst({
            where: { hotelName: hotelName, isTemplate: true },
        });

        let result;
        if (existingTemplate) {
            result = await prisma.hotel.update({
                where: { id: existingTemplate.id },
                data: dataToSave,
            });
            logger.info('템플릿 업데이트 성공:', { id: result.id });
            return res.status(200).json({ success: true, data: result, message: '템플릿이 성공적으로 업데이트되었습니다.' });
        } else {
            result = await prisma.hotel.create({
                data: dataToSave,
            });
            logger.info('새 템플릿 생성 성공:', { id: result.id });
            return res.status(201).json({ success: true, data: result, message: '템플릿이 성공적으로 생성되었습니다.' });
        }
    } catch (error) {
        logger.error('[/api/hotels/save-all] 처리 실패:', error);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
}