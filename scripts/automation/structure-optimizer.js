import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class StructureOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.optimizations = {
      removeDuplicates: true,
      organizeComponents: true,
      cleanCache: true,
      optimizeImports: true
    };
  }

  async removeDuplicateFiles() {
    console.log('🗑️ 중복 파일 제거 중...');
    
    const duplicates = [
      'app/detail',
      'app/main',
      'src/shared',
      'debug',
      'screenshots',
      'test-results'
    ];
    
    for (const duplicate of duplicates) {
      const fullPath = path.join(this.projectRoot, duplicate);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✅ ${duplicate} 제거 완료`);
        } catch (error) {
          console.log(`⚠️ ${duplicate} 제거 실패:`, error.message);
        }
      }
    }
  }

  async organizeComponents() {
    console.log('📁 컴포넌트 구조 정리 중...');
    
    const componentDirs = [
      'components/common',
      'components/ui',
      'components/forms',
      'components/layout'
    ];
    
    for (const dir of componentDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    
    // 공통 컴포넌트 이동
    const commonComponents = [
      'Spinner.jsx',
      'Icon.jsx',
      'Container.jsx',
      'ErrorDisplay.jsx'
    ];
    
    for (const component of commonComponents) {
      const sourcePath = path.join(this.projectRoot, 'components', component);
      const targetPath = path.join(this.projectRoot, 'components/common', component);
      
      if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
        try {
          fs.renameSync(sourcePath, targetPath);
          console.log(`✅ ${component} → components/common/ 이동 완료`);
        } catch (error) {
          console.log(`⚠️ ${component} 이동 실패:`, error.message);
        }
      }
    }
  }

  async cleanCache() {
    console.log('🧹 캐시 정리 중...');
    
    const cacheDirs = [
      '.next',
      'node_modules/.cache',
      '.turbo'
    ];
    
    for (const dir of cacheDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✅ ${dir} 캐시 정리 완료`);
        } catch (error) {
          console.log(`⚠️ ${dir} 캐시 정리 실패:`, error.message);
        }
      }
    }
  }

  async optimizeImports() {
    console.log('📦 import 최적화 중...');
    
    // jsconfig.json 최적화
    const jsconfigPath = path.join(this.projectRoot, 'jsconfig.json');
    if (fs.existsSync(jsconfigPath)) {
      const jsconfig = {
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/*": ["./*"],
            "@/components/*": ["./components/*"],
            "@/app/*": ["./app/*"],
            "@/lib/*": ["./lib/*"],
            "@/public/*": ["./public/*"]
          }
        },
        "include": [
          "**/*.js",
          "**/*.jsx",
          "**/*.ts",
          "**/*.tsx"
        ],
        "exclude": [
          "node_modules",
          ".next",
          "out"
        ]
      };
      
      fs.writeFileSync(jsconfigPath, JSON.stringify(jsconfig, null, 2));
      console.log('✅ jsconfig.json 최적화 완료');
    }
  }

  async runOptimizations() {
    console.log('🚀 폴더 구조 최적화 시작...');
    
    const startTime = Date.now();
    
    try {
      if (this.optimizations.removeDuplicates) {
        await this.removeDuplicateFiles();
      }
      
      if (this.optimizations.organizeComponents) {
        await this.organizeComponents();
      }
      
      if (this.optimizations.cleanCache) {
        await this.cleanCache();
      }
      
      if (this.optimizations.optimizeImports) {
        await this.optimizeImports();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`🎉 폴더 구조 최적화 완료! (${duration}ms)`);
      console.log('📊 최적화 결과:');
      console.log('- 중복 파일 제거');
      console.log('- 컴포넌트 구조 정리');
      console.log('- 캐시 정리');
      console.log('- import 경로 최적화');
      
    } catch (error) {
      console.error('❌ 최적화 중 오류:', error.message);
    }
  }

  async generateStructureReport() {
    console.log('📋 폴더 구조 리포트 생성 중...');
    
    const structure = {
      app: this.getDirectoryStructure('app'),
      components: this.getDirectoryStructure('components'),
      lib: this.getDirectoryStructure('lib'),
      public: this.getDirectoryStructure('public'),
      scripts: this.getDirectoryStructure('scripts')
    };
    
    const reportPath = path.join(this.projectRoot, 'structure-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(structure, null, 2));
    
    console.log('✅ 구조 리포트 생성 완료:', reportPath);
    return structure;
  }

  getDirectoryStructure(dirPath) {
    const fullPath = path.join(this.projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) return null;
    
    const structure = {
      files: [],
      directories: {}
    };
    
    const items = fs.readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile()) {
        structure.files.push(item);
      } else if (stats.isDirectory()) {
        structure.directories[item] = this.getDirectoryStructure(path.join(dirPath, item));
      }
    }
    
    return structure;
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new StructureOptimizer();
  
  if (process.argv.includes('--report')) {
    optimizer.generateStructureReport();
  } else {
    optimizer.runOptimizations();
  }
}

export default StructureOptimizer; 