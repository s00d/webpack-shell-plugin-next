const fs = require('fs')
const path = require('path')
fs.writeFileSync(path.join(__dirname, '../out/test.txt'), 'Hey there!');
process.exit(1);
