#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const scriptDir = path.join(__dirname, 'script');
const outputPath = path.join(scriptDir, 'pdfs.json');
let lastFiles = [];

function getPdfFiles() {
  return fs.readdirSync(scriptDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .sort();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function writeManifest(files) {
  const content = { files };
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));
}

function generate() {
  if (!fs.existsSync(scriptDir)) {
    console.error(`Script directory not found: ${scriptDir}`);
    return [];
  }

  const files = getPdfFiles();

  if (arraysEqual(files, lastFiles) && fs.existsSync(outputPath)) {
    return files;
  }

  writeManifest(files);
  lastFiles = files;

  console.log(`✅ Generated pdfs.json with ${files.length} PDF(s):`);
  files.forEach(f => console.log(`   - ${f}`));
  return files;
}

// Basic CLI: run once, or use --watch to regenerate on changes
const args = process.argv.slice(2);
const watch = args.includes('--watch');

generate();

if (watch) {
  console.log('👀 Watching script/ for changes...');
  let timeout = null;

  fs.watch(scriptDir, { persistent: true }, (eventType, filename) => {
    if (filename && String(filename).toLowerCase() === 'pdfs.json') return;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      try {
        console.log(`Change detected (${eventType}) -> regenerating pdfs.json`);
        generate();
      } catch (err) {
        console.error('Error regenerating pdfs.json:', err);
      }
    }, 150);
  });

  setInterval(() => {
    try {
      const files = getPdfFiles();
      if (!arraysEqual(files, lastFiles)) {
        console.log('Detected manifest mismatch -> regenerating pdfs.json');
        generate();
      }
    } catch (err) {
      console.error('Error polling PDF directory:', err);
    }
  }, 2500);
}
