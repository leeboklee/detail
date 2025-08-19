#!/usr/bin/env python3
import socket
import subprocess
import time
import signal
import sys
import os
from threading import Thread

PORT = 3900
HOST = 'localhost'

class PortManager:
    def __init__(self):
        self.server_process = None
        self.is_running = False
        
    def is_port_in_use(self):
        """포트가 사용 중인지 확인"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex((HOST, PORT))
                return result == 0
        except:
            return False
    
    def kill_process_on_port(self):
        """포트 3900을 사용하는 프로세스 종료"""
        try:
            if os.name == 'nt':  # Windows
                cmd = f'netstat -ano | findstr :{PORT}'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.stdout:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if f':{PORT}' in line:
                            parts = line.split()
                            if len(parts) >= 5:
                                pid = parts[-1]
                                subprocess.run(f'taskkill /F /PID {pid}', shell=True)
                                print(f"포트 {PORT} 사용 프로세스 {pid} 종료됨")
            else:  # Linux/Mac
                cmd = f'lsof -ti:{PORT}'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.stdout.strip():
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            subprocess.run(f'kill -9 {pid}', shell=True)
                            print(f"포트 {PORT} 사용 프로세스 {pid} 종료됨")
        except Exception as e:
            print(f"포트 정리 중 오류: {e}")
    
    def start_server(self):
        """Next.js 서버 시작"""
        try:
            print(f"포트 {PORT}에서 Next.js 서버 시작 중...")
            
            # Windows에서 npm 경로 확인
            if os.name == 'nt':  # Windows
                npm_cmd = ['cmd', '/c', 'npm', 'run', 'dev:basic']
            else:
                npm_cmd = ['npm', 'run', 'dev:basic']
            
            self.server_process = subprocess.Popen(
                npm_cmd,
                cwd=os.getcwd(),
                stdout=subprocess.DEVNULL,  # 출력 무시
                stderr=subprocess.DEVNULL,  # 에러 무시
                universal_newlines=False    # 바이너리 모드
            )
            self.is_running = True
            print(f"✅ 서버 시작됨 (PID: {self.server_process.pid})")
            print(f"📡 접속: http://{HOST}:{PORT}")
                        
        except Exception as e:
            print(f"서버 시작 실패: {e}")
            self.is_running = False
    
    def monitor_and_restart(self):
        """서버 모니터링 및 자동 재시작"""
        while True:
            try:
                if not self.is_running or (self.server_process and self.server_process.poll() is not None):
                    print("서버가 중단됨. 재시작 중...")
                    self.kill_process_on_port()
                    time.sleep(2)
                    self.start_server()
                
                # 포트 상태 확인
                if self.is_running and not self.is_port_in_use():
                    print(f"포트 {PORT}가 닫힘. 서버 재시작...")
                    self.restart_server()
                
                time.sleep(5)  # 5초마다 체크
                
            except KeyboardInterrupt:
                print("\n서버 종료 중...")
                self.stop_server()
                break
            except Exception as e:
                print(f"모니터링 오류: {e}")
                time.sleep(5)
    
    def restart_server(self):
        """서버 재시작"""
        if self.server_process:
            self.server_process.terminate()
            self.server_process.wait()
        self.start_server()
    
    def stop_server(self):
        """서버 종료"""
        self.is_running = False
        if self.server_process:
            self.server_process.terminate()
            self.server_process.wait()
        self.kill_process_on_port()
        print("서버 종료됨")
    
    def run(self):
        """메인 실행"""
        print(f"🚀 포트 {PORT} 관리자 시작")
        print(f"📡 모니터링: http://{HOST}:{PORT}")
        
        # 초기 포트 정리
        self.kill_process_on_port()
        
        # 서버 시작
        self.start_server()
        
        # 모니터링 시작
        self.monitor_and_restart()

def signal_handler(signum, frame):
    """시그널 핸들러"""
    print("\n종료 신호 수신...")
    if port_manager:
        port_manager.stop_server()
    sys.exit(0)

if __name__ == "__main__":
    port_manager = PortManager()
    
    # 시그널 핸들러 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        port_manager.run()
    except KeyboardInterrupt:
        print("\n사용자에 의해 종료됨")
        port_manager.stop_server() 