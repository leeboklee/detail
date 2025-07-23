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
  contact: ''
};

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                if (process.env.NODE_ENV === 'development') {
                    console.log('API hotel GET - 응답 데이터 준비 완료');
                }
                res.status(200).json(hotelData);
            } catch (error) {
                console.error('API hotel GET Error:', error);
                res.status(200).json(hotelData);
            }
            break;

        case 'POST':
            try {
                // req.body를 사용하지만 이 예제에서는 특별한 처리를 하지 않음
                const body = req.body;
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('API hotel POST - 요청 처리 완료', body);
                }
                
                res.status(200).json({ success: true, message: '호텔 정보가 성공적으로 저장되었습니다.' });
            } catch (error) {
                console.error('API hotel POST Error:', error);
                res.status(500).json({ error: '호텔 정보 저장 중 오류가 발생했습니다.' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
} 