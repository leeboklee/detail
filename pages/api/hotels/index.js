import { prisma } from '@shared/lib/prisma.js';
import { logger } from '../utils/server-utils.js';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { templates } = req.query;
        
        let queryOptions = {
          orderBy: {
            createdAt: 'desc',
          },
        };

        if (templates === 'true') {
          queryOptions.where = { isTemplate: true };
          queryOptions.select = { id: true, hotelName: true }; 
        }

        const hotels = await prisma.hotel.findMany(queryOptions);
        
        logger.info(`Prisma: 호텔 ${hotels.length}개 조회 완료`);
        res.status(200).json({ success: true, message: `호텔 ${hotels.length}개 조회 완료`, data: { hotels } });
      } catch (error) {
        logger.error('Prisma GET 요청 실패:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
      }
      break;

    case 'POST':
      try {
        const newHotel = await prisma.hotel.create({
          data: req.body,
        });
        
        logger.info(`Prisma: 새 호텔 저장 완료 (ID: ${newHotel.id})`);
        res.status(200).json({ success: true, message: '호텔이 성공적으로 저장되었습니다.', data: newHotel });
      } catch (error) {
        logger.error('Prisma POST 요청 실패:', error);
        res.status(500).json({ success: false, message: '데이터 저장에 실패했습니다.' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID가 필요합니다' });
        }
        
        const updatedHotel = await prisma.hotel.update({
          where: { id: id },
          data: updateData,
        });
        
        res.status(200).json({ success: true, message: '호텔 정보가 성공적으로 수정되었습니다.', data: updatedHotel });
      } catch (error) {
        logger.error('Prisma PUT 요청 실패:', error);
        res.status(500).json({ success: false, message: '호텔 정보 수정에 실패했습니다.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID가 필요합니다' });
        }

        await prisma.hotel.delete({
          where: { id: id },
        });
        
        res.status(200).json({ success: true, message: '호텔 정보가 성공적으로 삭제되었습니다.', data: null });
      } catch (error) {
        logger.error('Prisma DELETE 요청 실패:', error);
        res.status(500).json({ success: false, message: '호텔 정보 삭제에 실패했습니다.' });
      }
      break;

    case 'OPTIONS':
      res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS').setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization').end();
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
} 