import { prisma } from '@shared/lib/prisma.js';
import { logError, measurePerformance } from '../utils/server-utils.js';

export default async function handler(req, res) {
    const { method } = req;
    const startTime = Date.now();

    switch (method) {
        case 'GET':
            try {
                const { hotelId, isActive: isActiveStr } = req.query;
                const isActive = isActiveStr !== 'false';
                
                console.log('🔍 공지사항 목록 조회 시작...');
                
                const whereClause = { isActive };
                if (hotelId) {
                    whereClause.hotelId = hotelId;
                }
                
                const notices = await prisma.notice.findMany({
                    where: whereClause,
                    include: {
                        hotel: { select: { hotelName: true } }
                    },
                    orderBy: [
                        { priority: 'desc' },
                        { createdAt: 'desc' }
                    ]
                });

                measurePerformance('GET /api/notices', startTime);
                console.log(`✅ ${notices.length}개 공지사항 조회 완료`);
                res.status(200).json({ success: true, notices, count: notices.length });
            } catch (error) {
                logError('GET /api/notices', error);
                res.status(500).json({ success: false, error: error.message, details: '공지사항 목록 조회 중 오류가 발생했습니다.' });
            }
            break;

        case 'POST':
            try {
                const { hotelId, title, content, priority } = req.body;
                console.log('📢 새 공지사항 생성 시작:', title);

                if (!hotelId || !title || !content) {
                    return res.status(400).json({ success: false, error: 'hotelId, title, content는 필수입니다.' });
                }

                const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
                if (!hotel) {
                    return res.status(404).json({ success: false, error: '존재하지 않는 호텔입니다.' });
                }

                const newNotice = await prisma.notice.create({
                    data: { hotelId, title, content, priority: parseInt(priority) || 0, isActive: true }
                });

                measurePerformance('POST /api/notices', startTime);
                console.log('✅ 공지사항 생성 완료:', newNotice.id);
                res.status(201).json({ success: true, notice: newNotice, message: '공지사항이 성공적으로 생성되었습니다.' });
            } catch (error) {
                logError('POST /api/notices', error);
                res.status(500).json({ success: false, error: error.message, details: '공지사항 생성 중 오류가 발생했습니다.' });
            }
            break;

        case 'PUT':
            try {
                const { id, ...updateData } = req.body;
                if (!id) {
                    return res.status(400).json({ success: false, error: '공지사항 ID가 필요합니다.' });
                }
                console.log('🔄 공지사항 업데이트 시작:', id);

                const updatedNotice = await prisma.notice.update({
                    where: { id },
                    data: {
                        title: updateData.title,
                        content: updateData.content,
                        priority: updateData.priority !== undefined ? parseInt(updateData.priority) : undefined,
                        isActive: updateData.isActive !== undefined ? updateData.isActive : undefined
                    }
                });

                measurePerformance('PUT /api/notices', startTime);
                console.log('✅ 공지사항 업데이트 완료:', updatedNotice.title);
                res.status(200).json({ success: true, notice: updatedNotice, message: '공지사항이 성공적으로 업데이트되었습니다.' });
            } catch (error) {
                if (error.code === 'P2025') { // Record to update not found
                    return res.status(404).json({ success: false, error: '공지사항을 찾을 수 없습니다.' });
                }
                logError('PUT /api/notices', error);
                res.status(500).json({ success: false, error: error.message, details: '공지사항 업데이트 중 오류가 발생했습니다.' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ success: false, error: '공지사항 ID가 필요합니다.' });
                }
                console.log('🗑️ 공지사항 삭제 시작:', id);

                await prisma.notice.delete({ where: { id } });

                measurePerformance('DELETE /api/notices', startTime);
                console.log('✅ 공지사항 삭제 완료:', id);
                res.status(200).json({ success: true, message: '공지사항이 성공적으로 삭제되었습니다.' });
            } catch (error) {
                if (error.code === 'P2025') { // Record to delete not found
                    return res.status(404).json({ success: false, error: '공지사항을 찾을 수 없습니다.' });
                }
                logError('DELETE /api/notices', error);
                res.status(500).json({ success: false, error: error.message, details: '공지사항 삭제 중 오류가 발생했습니다.' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
} 