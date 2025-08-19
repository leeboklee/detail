import { prisma } from '../../../src/shared/lib/prisma.js';
import { logError, measurePerformance } from '../utils/server-utils.js';

export default async function handler(req, res) {
    const { method } = req;
    const startTime = Date.now();

    switch (method) {
        case 'GET':
            try {
                const { hotelId, isActive: isActiveStr } = req.query;
                const isActive = isActiveStr !== 'false';
                
                console.log('🔍 패키지 목록 조회 시작...');
                
                const whereClause = { isActive };
                if (hotelId) {
                    whereClause.hotelId = hotelId;
                }
                
                const packages = await prisma.package.findMany({
                    where: whereClause,
                    include: { hotel: { select: { hotelName: true } } },
                    orderBy: { createdAt: 'desc' }
                });

                measurePerformance('GET /api/packages', startTime);
                console.log(`✅ ${packages.length}개 패키지 조회 완료`);
                res.status(200).json({ success: true, packages, count: packages.length });
            } catch (error) {
                logError('GET /api/packages', error);
                res.status(500).json({ success: false, error: error.message, details: '패키지 목록 조회 중 오류가 발생했습니다.' });
            }
            break;

        case 'POST':
            try {
                const { hotelId, title, description, price, originalPrice, images, features, terms, validFrom, validTo } = req.body;
                console.log('📦 새 패키지 생성 시작:', title);

                if (!hotelId) {
                    return res.status(400).json({ success: false, error: '호텔 ID가 필요합니다.' });
                }

                const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
                if (!hotel) {
                    return res.status(404).json({ success: false, error: '존재하지 않는 호텔입니다.' });
                }

                const newPackage = await prisma.package.create({
                    data: {
                        hotelId, title, description,
                        price: parseFloat(price) || 0,
                        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                        images: images || [],
                        features: features || [],
                        terms,
                        validFrom: validFrom ? new Date(validFrom) : null,
                        validTo: validTo ? new Date(validTo) : null,
                        isActive: true
                    }
                });

                measurePerformance('POST /api/packages', startTime);
                console.log('✅ 패키지 생성 완료:', newPackage.id);
                res.status(201).json({ success: true, package: newPackage, message: '패키지가 성공적으로 생성되었습니다.' });
            } catch (error) {
                logError('POST /api/packages', error);
                res.status(500).json({ success: false, error: error.message, details: '패키지 생성 중 오류가 발생했습니다.' });
            }
            break;

        case 'PUT':
            try {
                const { id, ...updateData } = req.body;
                if (!id) {
                    return res.status(400).json({ success: false, error: '패키지 ID가 필요합니다.' });
                }
                console.log('🔄 패키지 업데이트 시작:', id);

                const updatedPackage = await prisma.package.update({
                    where: { id },
                    data: {
                        title: updateData.title,
                        description: updateData.description,
                        price: updateData.price ? parseFloat(updateData.price) : undefined,
                        originalPrice: updateData.originalPrice ? parseFloat(updateData.originalPrice) : undefined,
                        images: updateData.images,
                        features: updateData.features,
                        terms: updateData.terms,
                        validFrom: updateData.validFrom ? new Date(updateData.validFrom) : undefined,
                        validTo: updateData.validTo ? new Date(updateData.validTo) : undefined,
                        isActive: updateData.isActive !== undefined ? updateData.isActive : undefined
                    }
                });

                measurePerformance('PUT /api/packages', startTime);
                console.log('✅ 패키지 업데이트 완료:', updatedPackage.title);
                res.status(200).json({ success: true, package: updatedPackage, message: '패키지 정보가 성공적으로 업데이트되었습니다.' });
            } catch (error) {
                if (error.code === 'P2025') {
                    return res.status(404).json({ success: false, error: '패키지를 찾을 수 없습니다.' });
                }
                logError('PUT /api/packages', error);
                res.status(500).json({ success: false, error: error.message, details: '패키지 업데이트 중 오류가 발생했습니다.' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ success: false, error: '패키지 ID가 필요합니다.' });
                }
                console.log('🗑️ 패키지 삭제 시작:', id);
                
                await prisma.package.delete({ where: { id } });

                measurePerformance('DELETE /api/packages', startTime);
                console.log('✅ 패키지 삭제 완료:', id);
                res.status(200).json({ success: true, message: '패키지가 성공적으로 삭제되었습니다.' });
            } catch (error) {
                if (error.code === 'P2025') {
                    return res.status(404).json({ success: false, error: '패키지를 찾을 수 없습니다.' });
                }
                logError('DELETE /api/packages', error);
                res.status(500).json({ success: false, error: error.message, details: '패키지 삭제 중 오류가 발생했습니다.' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
} 