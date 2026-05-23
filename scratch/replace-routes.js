const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDir = path.join(__dirname, '..', 'src', 'app', 'operator');
console.log('Scanning directory:', targetDir);

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('/owner')) {
      const updated = content.replace(/\/owner/g, '/operator');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log('Successfully updated:', filePath);
    }
  }
});

console.log('Search & Replace finished successfully!');
