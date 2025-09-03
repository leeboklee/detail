import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 로컬 파일 시스템을 사용한 템플릿 저장
const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');
const TEMPLATES_FILE = path.join(TEMPLATES_DIR, 'templates.json');

// 디렉토리 생성 및 파일 초기화
const ensureTemplatesFile = () => {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify([]));
  }
};

// 템플릿 데이터 읽기
const readTemplates = () => {
  ensureTemplatesFile();
  try {
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('템플릿 파일 읽기 오류:', error);
    return [];
  }
};

// 템플릿 데이터 쓰기
const writeTemplates = (templates) => {
  ensureTemplatesFile();
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
    return true;
  } catch (error) {
    console.error('템플릿 파일 쓰기 오류:', error);
    return false;
  }
};

// 템플릿 목록 조회
export async function GET() {
  try {
    console.log('📋 템플릿 목록 조회');
    const templates = readTemplates();
    
    return NextResponse.json({ 
      success: true, 
      data: templates,
      message: '템플릿 목록을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('🔴 템플릿 목록 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '템플릿 목록 조회에 실패했습니다.',
      data: []
    }, { status: 500 });
  }
}

// 템플릿 저장
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, data } = body;
    
    if (!name || !data) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿 이름과 데이터가 필요합니다.' 
      }, { status: 400 });
    }
    
    const templates = readTemplates();
    const newTemplate = {
      id: Date.now().toString(),
      hotelName: name,
      description: description || '',
      templateData: data,
      isTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    
    if (writeTemplates(templates)) {
      console.log('✅ 템플릿 저장:', newTemplate.hotelName);
      return NextResponse.json({ 
        success: true, 
        message: '템플릿이 성공적으로 저장되었습니다.', 
        data: newTemplate 
      });
    } else {
      throw new Error('파일 쓰기 실패');
    }
  } catch (error) {
    console.error('🔴 템플릿 저장 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '템플릿 저장에 실패했습니다.' 
    }, { status: 500 });
  }
}

// 템플릿 수정
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, description, data } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿 ID가 필요합니다.' 
      }, { status: 400 });
    }
    
    const templates = readTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    templates[templateIndex] = {
      ...templates[templateIndex],
      hotelName: name,
      description: description || '',
      templateData: data,
      updatedAt: new Date().toISOString()
    };
    
    if (writeTemplates(templates)) {
      console.log('✅ 템플릿 수정:', templates[templateIndex].hotelName);
      return NextResponse.json({ 
        success: true, 
        message: '템플릿이 성공적으로 수정되었습니다.', 
        data: templates[templateIndex] 
      });
    } else {
      throw new Error('파일 쓰기 실패');
    }
  } catch (error) {
    console.error('🔴 템플릿 수정 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '템플릿 수정에 실패했습니다.' 
    }, { status: 500 });
  }
}

// 템플릿 삭제
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿 ID가 필요합니다.' 
      }, { status: 400 });
    }

    const templates = readTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (templates.length === filteredTemplates.length) {
      return NextResponse.json({ 
        success: false, 
        message: '템플릿을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    if (writeTemplates(filteredTemplates)) {
      console.log('✅ 템플릿 삭제:', id);
      return NextResponse.json({ 
        success: true, 
        message: '템플릿이 성공적으로 삭제되었습니다.'
      });
    } else {
      throw new Error('파일 쓰기 실패');
    }
  } catch (error) {
    console.error('🔴 템플릿 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '템플릿 삭제에 실패했습니다.' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
