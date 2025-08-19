#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import subprocess
import time
import signal
import threading

PORT = 3900
HOST = 'localhost'

class SimpleServer:
    def __init__(self):
        self.httpd = None
        self.is_running = False
        
    def start_http_server(self):
        """파이썬 내장 HTTP 서버 시작"""
        try:
            Handler = http.server.SimpleHTTPRequestHandler
            self.httpd = socketserver.TCPServer((HOST, PORT), Handler)
            self.is_running = True
            
            print(f"🚀 파이썬 HTTP 서버 시작")
            print(f"📡 서버 주소: http://{HOST}:{PORT}")
            print(f"📁 현재 디렉토리: {os.getcwd()}")
            
            # 서버 실행
            self.httpd.serve_forever()
            
        except Exception as e:
            print(f"서버 시작 실패: {e}")
            self.is_running = False
    
    def start_nextjs_server(self):
        """Next.js 서버 시작 (별도 스레드)"""
        def run_nextjs():
            try:
                print("🔄 Next.js 서버 시작 중...")
                if os.name == 'nt':  # Windows
                    subprocess.run(['cmd', '/c', 'npm', 'run', 'dev:basic'], check=True)
                else:
                    subprocess.run(['npm', 'run', 'dev:basic'], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Next.js 서버 오류: {e}")
            except KeyboardInterrupt:
                print("Next.js 서버 종료됨")
        
        # 별도 스레드에서 Next.js 실행
        nextjs_thread = threading.Thread(target=run_nextjs, daemon=True)
        nextjs_thread.start()
        return nextjs_thread
    
    def run(self):
        """메인 실행"""
        print("=" * 50)
        print("🐍 파이썬 서버 매니저")
        print("=" * 50)
        
        # Next.js 서버 시작
        nextjs_thread = self.start_nextjs_server()
        
        # 잠시 대기 후 HTTP 서버 시작
        time.sleep(3)
        
        try:
            # 파이썬 HTTP 서버 시작
            self.start_http_server()
        except KeyboardInterrupt:
            print("\n서버 종료 중...")
            self.stop()
    
    def stop(self):
        """서버 종료"""
        self.is_running = False
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
        print("서버 종료됨")

def signal_handler(signum, frame):
    """시그널 핸들러"""
    print("\n종료 신호 수신...")
    if server:
        server.stop()
    sys.exit(0)

if __name__ == "__main__":
    server = SimpleServer()
    
    # 시그널 핸들러 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        server.run()
    except KeyboardInterrupt:
        print("\n사용자에 의해 종료됨")
        server.stop() 