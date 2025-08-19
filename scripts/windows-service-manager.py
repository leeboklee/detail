#!/usr/bin/env python3
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import os
import subprocess
import time
import threading

class PortManagerService(win32serviceutil.ServiceFramework):
    _svc_name_ = "PortManagerService"
    _svc_display_name_ = "Port Manager Service"
    _svc_description_ = "Next.js 포트 관리 서비스"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.nextjs_process = None
        self.is_running = False

    def SvcStop(self):
        """서비스 중지"""
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        self.is_running = False

    def SvcDoRun(self):
        """서비스 실행"""
        self.is_running = True
        self.main()

    def start_nextjs(self):
        """Next.js 시작"""
        try:
            # 프로젝트 디렉토리로 이동
            project_dir = r"C:\codist\detail"
            os.chdir(project_dir)
            
            # Next.js 백그라운드 실행
            self.nextjs_process = subprocess.Popen(
                ['cmd', '/c', 'npm', 'run', 'dev:basic'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                cwd=project_dir
            )
            print(f"✅ Next.js 서비스 시작 (PID: {self.nextjs_process.pid})")
        except Exception as e:
            print(f"Next.js 시작 실패: {e}")

    def monitor_nextjs(self):
        """Next.js 모니터링"""
        while self.is_running:
            try:
                # Next.js 프로세스 상태 확인
                if self.nextjs_process and self.nextjs_process.poll() is not None:
                    print("⚠️ Next.js 프로세스 종료됨. 재시작...")
                    self.start_nextjs()
                
                time.sleep(5)
            except Exception as e:
                print(f"모니터링 오류: {e}")

    def main(self):
        """메인 실행"""
        print("🚀 포트 관리 서비스 시작")
        
        # Next.js 시작
        self.start_nextjs()
        
        # 모니터링 시작
        monitor_thread = threading.Thread(target=self.monitor_nextjs, daemon=True)
        monitor_thread.start()
        
        # 서비스 실행 유지
        while self.is_running:
            time.sleep(1)

if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(PortManagerService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(PortManagerService) 