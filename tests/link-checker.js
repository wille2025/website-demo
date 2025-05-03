/**
 * Simple link checker script for Rank Team Agency website
 * This script checks all HTML files for broken internal links
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const basePath = '/';

// Track results
const results = {
  checked: 0,
  valid: 0,
  broken: [],
  files: {}
};

// Get all HTML files
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Process an HTML file to check its links
function checkHtmlFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  console.log(`Checking: ${relativePath}`);
  
  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const links = dom.window.document.querySelectorAll('a');
  
  results.files[relativePath] = {
    total: links.length,
    broken: []
  };
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    results.checked++;
    
    // Skip empty links, anchor links, external links, tel: and mailto: links
    if (!href || 
        href === '#' || 
        href.startsWith('http') || 
        href.startsWith('tel:') || 
        href.startsWith('mailto:')) {
      results.valid++;
      return;
    }
    
    // Handle anchor links to the same page
    if (href.startsWith('#')) {
      const element = dom.window.document.querySelector(href);
      if (!element) {
        results.files[relativePath].broken.push({
          href,
          text: link.textContent.trim(),
          reason: `Anchor not found on page: ${href}`
        });
        results.broken.push({
          file: relativePath,
          href,
          text: link.textContent.trim(),
          reason: `Anchor not found on page: ${href}`
        });
      } else {
        results.valid++;
      }
      return;
    }
    
    // Handle relative links
    let targetPath;
    if (href.startsWith('/')) {
      // Absolute path relative to root
      targetPath = path.join(rootDir, href.substring(1));
    } else {
      // Relative path from current file directory
      targetPath = path.join(path.dirname(filePath), href);
    }
    
    // Clean up the path and check if it exists
    targetPath = path.normalize(targetPath);
    
    // If it points to a directory, look for index.html
    if (!targetPath.includes('.')) {
      targetPath = path.join(targetPath, 'index.html');
    }
    
    if (fileExists(targetPath)) {
      results.valid++;
    } else {
      results.files[relativePath].broken.push({
        href,
        text: link.textContent.trim(),
        reason: 'File not found'
      });
      results.broken.push({
        file: relativePath,
        href,
        text: link.textContent.trim(),
        reason: 'File not found'
      });
    }
  });
}

// Main function
function runLinkChecker() {
  console.log('Starting link checker...');
  
  // Create the tests directory if it doesn't exist
  if (!fs.existsSync(path.join(rootDir, 'tests'))) {
    fs.mkdirSync(path.join(rootDir, 'tests'));
  }
  
  // Get all HTML files
  const htmlFiles = getAllHtmlFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  // Check each file
  htmlFiles.forEach(checkHtmlFile);
  
  // Print results
  console.log('\nLink Checker Results:');
  console.log(`Total links checked: ${results.checked}`);
  console.log(`Valid links: ${results.valid}`);
  console.log(`Broken links: ${results.broken.length}`);
  
  if (results.broken.length > 0) {
    console.log('\nBroken Links:');
    results.broken.forEach(link => {
      console.log(`- ${link.file} -> ${link.href} (${link.text}): ${link.reason}`);
    });
  }
  
  // Save the results to a JSON file
  fs.writeFileSync(
    path.join(rootDir, 'tests', 'link-checker-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nResults saved to tests/link-checker-results.json');
  
  return results.broken.length === 0;
}

runLinkChecker();