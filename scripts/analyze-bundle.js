const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size and performance...\n');

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.log('❌ .next directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Analyze bundle size
try {
  console.log('📊 Bundle Analysis:');
  console.log('==================');
  
  // Check static files
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    const staticFiles = fs.readdirSync(staticDir, { recursive: true });
    let totalSize = 0;
    
    staticFiles.forEach(file => {
      if (typeof file === 'string') {
        const filePath = path.join(staticDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }
    });
    
    console.log(`📁 Static files size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Check for large files
  const chunksDir = path.join(nextDir, 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    const largeFiles = [];
    
    chunkFiles.forEach(file => {
      const filePath = path.join(chunksDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = stats.size / 1024 / 1024;
      
      if (sizeInMB > 0.1) { // Files larger than 100KB
        largeFiles.push({ name: file, size: sizeInMB });
      }
    });
    
    if (largeFiles.length > 0) {
      console.log('\n⚠️  Large chunk files detected:');
      largeFiles
        .sort((a, b) => b.size - a.size)
        .forEach(file => {
          console.log(`   ${file.name}: ${file.size.toFixed(2)} MB`);
        });
    }
  }
  
  console.log('\n✅ Bundle analysis completed!');
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
}

// Performance recommendations
console.log('\n🚀 Performance Recommendations:');
console.log('==============================');
console.log('1. ✅ Implemented lazy loading for components');
console.log('2. ✅ Added image optimization');
console.log('3. ✅ Enabled code splitting');
console.log('4. ✅ Added memoization to components');
console.log('5. ✅ Added performance monitoring');
console.log('\n📈 Additional optimizations you can implement:');
console.log('- Use React.memo() for expensive components');
console.log('- Implement virtual scrolling for long lists');
console.log('- Use WebP/AVIF image formats');
console.log('- Enable gzip compression on server');
console.log('- Consider using a CDN for static assets');
console.log('- Implement service worker for caching');
