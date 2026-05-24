const fs = require('fs');

const content = fs.readFileSync('e:/YoungHouseWeb/src/lib/supabaseServices.ts', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'notifications'") || lines[i].includes('"notifications"')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    console.log('Surrounding code:');
    for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 8); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    console.log('------------------');
  }
}
