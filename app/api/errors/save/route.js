import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // 오류 로그 디렉토리 생성
    const errorsDir = join(process.cwd(), 'logs', 'errors');
    await mkdir(errorsDir, { recursive: true });
    
    // 타임스탬프를 파일명으로 사용
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error-${timestamp}.json`;
    const filepath = join(errorsDir, filename);
    
    // 오류 데이터를 JSON 파일로 저장
    await writeFile(filepath, JSON.stringify(errorData, null, 2), 'utf8');
    
    // 최신 오류 목록 파일 업데이트
    const latestErrorsFile = join(errorsDir, 'latest-errors.json');
    const latestErrors = {
      lastUpdated: new Date().toISOString(),
      totalErrors: 0,
      recentErrors: []
    };
    
    try {
      const existingData = await readFile(latestErrorsFile, 'utf8');
      const existing = JSON.parse(existingData);
      latestErrors.totalErrors = existing.totalErrors + 1;
      latestErrors.recentErrors = [
        {
          timestamp: errorData.timestamp,
          type: errorData.type,
          message: errorData.message,
          severity: errorData.severity,
          filename
        },
        ...existing.recentErrors.slice(0, 9) // 최근 10개만 유지
      ];
    } catch (error) {
      latestErrors.totalErrors = 1;
      latestErrors.recentErrors = [{
        timestamp: errorData.timestamp,
        type: errorData.type,
        message: errorData.message,
        severity: errorData.severity,
        filename
      }];
    }
    
    await writeFile(latestErrorsFile, JSON.stringify(latestErrors, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: '오류가 저장되었습니다.',
      filename,
      totalErrors: latestErrors.totalErrors
    });
    
  } catch (error) {
    console.error('오류 저장 실패:', error);
    return NextResponse.json(
      { success: false, message: '오류 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 최신 오류 목록 조회
export async function GET() {
  try {
    const errorsDir = join(process.cwd(), 'logs', 'errors');
    const latestErrorsFile = join(errorsDir, 'latest-errors.json');
    
    try {
      const data = await readFile(latestErrorsFile, 'utf8');
      const latestErrors = JSON.parse(data);
      return NextResponse.json(latestErrors);
    } catch (error) {
      return NextResponse.json({
        lastUpdated: new Date().toISOString(),
        totalErrors: 0,
        recentErrors: []
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: '오류 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
