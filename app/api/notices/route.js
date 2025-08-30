import { prisma } from '../../../src/shared/lib/prisma.js';
import { logError, measurePerformance } from '../utils/server-utils.js';

// GET 요청 처리
export async function GET(request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const isActiveStr = searchParams.get('isActive');
    const isActive = isActiveStr !== 'false';

    try {
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
        
        return Response.json({ 
            success: true, 
            notices, 
            count: notices.length 
        });
    } catch (error) {
        logError('GET /api/notices', error);
        return Response.json(
            { 
                success: false, 
                error: error.message, 
                details: '공지사항 목록 조회 중 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}

// POST 요청 처리
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { hotelId, title, content, priority } = body;
        
        console.log('📢 새 공지사항 생성 시작:', title);

        if (!hotelId || !title || !content) {
            return Response.json(
                { 
                    success: false, 
                    error: 'hotelId, title, content는 필수입니다.' 
                },
                { status: 400 }
            );
        }

        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) {
            return Response.json(
                { 
                    success: false, 
                    error: '존재하지 않는 호텔입니다.' 
                },
                { status: 404 }
            );
        }

        const newNotice = await prisma.notice.create({
            data: { 
                hotelId, 
                title, 
                content, 
                priority: parseInt(priority) || 0, 
                isActive: true 
            }
        });

        measurePerformance('POST /api/notices', startTime);
        console.log('✅ 공지사항 생성 완료:', newNotice.id);
        
        return Response.json(
            { 
                success: true, 
                notice: newNotice, 
                message: '공지사항이 성공적으로 생성되었습니다.' 
            },
            { status: 201 }
        );
    } catch (error) {
        logError('POST /api/notices', error);
        return Response.json(
            { 
                success: false, 
                error: error.message, 
                details: '공지사항 생성 중 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}

// PUT 요청 처리
export async function PUT(request) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { id, ...updateData } = body;
        
        if (!id) {
            return Response.json(
                { 
                    success: false, 
                    error: '공지사항 ID가 필요합니다.' 
                },
                { status: 400 }
            );
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
        
        return Response.json(
            { 
                success: true, 
                notice: updatedNotice, 
                message: '공지사항이 성공적으로 업데이트되었습니다.' 
            }
        );
    } catch (error) {
        if (error.code === 'P2025') { // Record to update not found
            return Response.json(
                { 
                    success: false, 
                    error: '공지사항을 찾을 수 없습니다.' 
                },
                { status: 404 }
            );
        }
        
        logError('PUT /api/notices', error);
        return Response.json(
            { 
                success: false, 
                error: error.message, 
                details: '공지사항 업데이트 중 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}

// DELETE 요청 처리
export async function DELETE(request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (!id) {
            return Response.json(
                { 
                    success: false, 
                    error: '공지사항 ID가 필요합니다.' 
                },
                { status: 400 }
            );
        }

        console.log('🗑️ 공지사항 삭제 시작:', id);

        const deletedNotice = await prisma.notice.delete({
            where: { id }
        });

        measurePerformance('DELETE /api/notices', startTime);
        console.log('✅ 공지사항 삭제 완료:', deletedNotice.title);
        
        return Response.json(
            { 
                success: true, 
                message: '공지사항이 성공적으로 삭제되었습니다.' 
            }
        );
    } catch (error) {
        if (error.code === 'P2025') { // Record to delete not found
            return Response.json(
                { 
                    success: false, 
                    error: '공지사항을 찾을 수 없습니다.' 
                },
                { status: 404 }
            );
        }
        
        logError('DELETE /api/notices', error);
        return Response.json(
            { 
                success: false, 
                error: error.message, 
                details: '공지사항 삭제 중 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
} 