import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    res.socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('🔌 Detail 클라이언트 연결됨:', socket.id);
      
      // 실시간 로그 전송
      socket.on('send-log', (data) => {
        io.emit('new-log', data);
      });
      
      // 테스트 상태 업데이트
      socket.on('test-status', (data) => {
        io.emit('test-update', data);
      });
      
      // 시스템 모니터링 데이터
      socket.on('system-monitor', (data) => {
        io.emit('monitor-update', data);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Detail 클라이언트 연결 해제:', socket.id);
      });
    });
  }
  
  res.end();
};

export default ioHandler; 