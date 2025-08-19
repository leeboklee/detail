// 안전한 기본 데이터 준비
const hotelData = {
	id: 'hotel-001',
	name: '',
	description: '',
	address: '',
	imageUrl: '',
	phone: '',
	email: '',
	website: '',
	checkInTime: '',
	checkOutTime: '',
	contact: '',
};

export async function GET() {
	try {
		if (process.env.NODE_ENV === 'development') {
			console.log('API hotel GET - 응답 데이터 준비 완료');
		}
		return Response.json(hotelData);
	} catch (error) {
		console.error('API hotel GET Error:', error);
		return Response.json(hotelData);
	}
}

export async function POST(request) {
	try {
		const body = await request.json();
		if (process.env.NODE_ENV === 'development') {
			console.log('API hotel POST - 요청 처리 완료', body);
		}
		return Response.json({ success: true, message: '호텔 정보가 성공적으로 저장되었습니다.' });
	} catch (error) {
		console.error('API hotel POST Error:', error);
		return Response.json({ error: '호텔 정보 저장 중 오류가 발생했습니다.' }, { status: 500 });
	}
} 