const { IncrementalCache } = require('next/dist/server/lib/incremental-cache')

class OptimizedCache extends IncrementalCache {
  constructor(options) {
    super(options)
    this.memoryCache = new Map()
    this.maxMemorySize = 50 * 1024 * 1024 // 50MB
    this.currentMemorySize = 0
  }

  async get(key) {
    // 메모리 캐시에서 먼저 확인
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }
    
    // 파일 시스템 캐시 확인
    const result = await super.get(key)
    
    // 메모리 캐시에 저장 (크기 제한 고려)
    if (result && this.currentMemorySize < this.maxMemorySize) {
      const size = JSON.stringify(result).length
      if (this.currentMemorySize + size <= this.maxMemorySize) {
        this.memoryCache.set(key, result)
        this.currentMemorySize += size
      }
    }
    
    return result
  }

  async set(key, data) {
    // 메모리 캐시 업데이트
    if (this.memoryCache.has(key)) {
      const oldSize = JSON.stringify(this.memoryCache.get(key)).length
      this.currentMemorySize -= oldSize
    }
    
    const newSize = JSON.stringify(data).length
    if (this.currentMemorySize + newSize <= this.maxMemorySize) {
      this.memoryCache.set(key, data)
      this.currentMemorySize += newSize
    }
    
    // 파일 시스템 캐시 저장
    return super.set(key, data)
  }

  // 메모리 정리
  cleanup() {
    if (this.currentMemorySize > this.maxMemorySize * 0.8) {
      const entries = Array.from(this.memoryCache.entries())
      entries.sort((a, b) => a[1].lastModified - b[1].lastModified)
      
      while (this.currentMemorySize > this.maxMemorySize * 0.5 && entries.length > 0) {
        const [key] = entries.shift()
        const size = JSON.stringify(this.memoryCache.get(key)).length
        this.memoryCache.delete(key)
        this.currentMemorySize -= size
      }
    }
  }
}

module.exports = OptimizedCache 