const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building civilworksadmin for QA...');
execSync('npm run build:qa', { stdio: 'inherit' });

console.log('Zipping dist/civilworksadmin to admin-qa.zip...');
const zipPath = path.join(__dirname, 'admin-qa.zip');
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

// Compress-Archive
execSync(`powershell -Command "Compress-Archive -Path 'dist/civilworksadmin/*' -DestinationPath 'admin-qa.zip' -Force"`, { stdio: 'inherit' });

console.log('Created admin-qa.zip successfully! Size:', (fs.statSync(zipPath).size / 1024).toFixed(2), 'KB');
