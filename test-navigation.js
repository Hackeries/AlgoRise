// Test script to verify navigation works correctly
console.log('Testing Battle Arena Navigation');

// Verify that the navigation link exists in the site-nav component
const fs = require('fs');
const path = require('path');

// Check if the site-nav.tsx file contains the Battle Arena link
const siteNavPath = path.join(__dirname, 'components', 'site-nav.tsx');
const siteNavContent = fs.readFileSync(siteNavPath, 'utf8');

if (siteNavContent.includes('/battle-arena') && siteNavContent.includes('Battle Arena 🎮')) {
  console.log('✅ Battle Arena navigation link found in site-nav.tsx');
} else {
  console.log('❌ Battle Arena navigation link not found in site-nav.tsx');
}

// Check if the battle arena page exists
const battleArenaPagePath = path.join(__dirname, 'app', 'battle-arena', 'page.tsx');
if (fs.existsSync(battleArenaPagePath)) {
  console.log('✅ Battle Arena page exists');
} else {
  console.log('❌ Battle Arena page not found');
}

// Check if the API routes exist
const battlesApiPath = path.join(__dirname, 'app', 'api', 'battles');
if (fs.existsSync(battlesApiPath)) {
  console.log('✅ Battle Arena API routes exist');
} else {
  console.log('❌ Battle Arena API routes not found');
}

console.log('\nNavigation verification complete!');
console.log('To test the actual navigation:');
console.log('1. Start the development server with "npm run dev"');
console.log('2. Visit http://localhost:3000');
console.log('3. Look for the "Battle Arena 🎮" link in the header navigation');
console.log('4. Click the link to navigate to the Battle Arena page');