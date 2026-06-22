#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const scriptDir = path.join(__dirname, 'script');

// Read all PDF files from the script folder
const files = fs.readdirSync(scriptDir)
  .filter(file => file.toLowerCase().endsWith('.pdf'))
  .sort(); // Sort alphabetically

// Create the pdfs.json content
const content = {
  files: files
};

// Write to pdfs.json
const outputPath = path.join(scriptDir, 'pdfs.json');
fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));

console.log(`✅ Generated pdfs.json with ${files.length} PDF(s):`);
files.forEach(f => console.log(`   - ${f}`));
