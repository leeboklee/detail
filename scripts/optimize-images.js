
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function optimizeImages() {
  const publicDir = path.join(process.cwd(), 'public', 'images')
  
  if (!fs.existsSync(publicDir)) {
    console.log('이미지 디렉토리가 없습니다.')
    return
  }
  
  const files = fs.readdirSync(publicDir)
  const imageFiles = files.filter(file => 
    /\\.(jpg|jpeg|png|gif)$/i.test(file)
  )
  
  for (const file of imageFiles) {
    const filePath = path.join(publicDir, file)
    const outputPath = path.join(publicDir, `optimized-${file}`)
    
    try {
      await sharp(filePath)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath)
      
      console.log(`✅ 최적화 완료: ${file}`)
    } catch (error) {
      console.error(`❌ 최적화 실패: ${file}`, error)
    }
  }
}

optimizeImages()
