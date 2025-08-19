// import { Configuration, OpenAIApi } from 'openai'
// import sharp from 'sharp'
import fs from 'fs';
import path from 'path';

export async function POST(request) {
	try {
		const data = await request.json();
		console.log('HTML 생성 요청 데이터:', JSON.stringify(data, null, 2));

		// 판매기간&투숙일 정보 추출
		const period = data.period || {};
		const hotel = data.hotel || data;
		const rooms = data.rooms || [];
		const packages = data.packages || [];
		const facilities = data.facilities || {};
		const checkin = data.checkin || {};
		const cancel = data.cancel || {};
		const booking = data.booking || {};
		const notices = data.notices || [];
		const pricing = data.pricing || {};

		// 사용자 입력 데이터 기반 HTML 콘텐츠 생성
		const htmlContent = `<!DOCTYPE html><html><head><title>${hotel.name || '호텔 상세 페이지'}</title><meta charset="utf-8"></head><body><div>Generated</div></body></html>`;

		// 파일 저장 로직 (선택적)
		const { searchParams } = new URL(request.url);
		const save = searchParams.get('save');
		if (save === 'true') {
			const dirPath = path.join(process.cwd(), 'public', 'generated');
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			const fileName = `hotel-${Date.now()}.html`;
			const filePath = path.join(dirPath, fileName);
			fs.writeFileSync(filePath, htmlContent);
			console.log(`HTML 파일 저장 완료: ${filePath}`);
		}

		return new Response(htmlContent, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
	} catch (error) {
		console.error('HTML 생성 실패:', error);
		return Response.json({ success: false, message: 'HTML 생성 중 오류가 발생했습니다.', error: error.message }, { status: 500 });
	}
} 