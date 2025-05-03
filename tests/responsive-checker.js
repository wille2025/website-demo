/**
 * Simple responsive design checker
 * This script analyzes CSS files to verify responsive design elements
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Track results
const results = {
  mediaQueries: {
    count: 0,
    breakpoints: new Set(),
    details: []
  },
  flexbox: {
    count: 0,
    details: []
  },
  grid: {
    count: 0,
    details: []
  },
  responsive: {
    viewportMeta: false,
    relativeUnits: {
      count: 0,
      types: new Set(),
      details: []
    }
  },
  issues: []
};

// Get all CSS files
function getAllCssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllCssFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check HTML files for viewport meta tag
function checkViewportMeta() {
  const htmlFiles = getAllHtmlFiles(rootDir);
  
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('name="viewport"') && content.includes('width=device-width')) {
      results.responsive.viewportMeta = true;
      break;
    }
  }
  
  if (!results.responsive.viewportMeta) {
    results.issues.push({
      type: 'Missing viewport meta tag',
      description: 'The viewport meta tag with width=device-width is required for responsive design'
    });
  }
}

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

// Process a CSS file to check responsive design features
function checkCssFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  console.log(`Analyzing: ${relativePath}`);
  
  const css = fs.readFileSync(filePath, 'utf-8');
  
  // Check for media queries
  const mediaQueryMatches = css.match(/@media\s+\([^)]+\)/g);
  if (mediaQueryMatches) {
    results.mediaQueries.count += mediaQueryMatches.length;
    
    mediaQueryMatches.forEach(query => {
      // Extract breakpoints
      const breakpointMatch = query.match(/\(\s*max-width\s*:\s*(\d+)px\s*\)|\(\s*min-width\s*:\s*(\d+)px\s*\)/);
      if (breakpointMatch) {
        const breakpoint = breakpointMatch[1] || breakpointMatch[2];
        results.mediaQueries.breakpoints.add(breakpoint);
      }
      
      results.mediaQueries.details.push({
        file: relativePath,
        query: query.trim()
      });
    });
  }
  
  // Check for flexbox
  const flexboxMatches = css.match(/display\s*:\s*flex/g);
  if (flexboxMatches) {
    results.flexbox.count += flexboxMatches.length;
    results.flexbox.details.push({
      file: relativePath,
      count: flexboxMatches.length
    });
  }
  
  // Check for grid
  const gridMatches = css.match(/display\s*:\s*grid/g);
  if (gridMatches) {
    results.grid.count += gridMatches.length;
    results.grid.details.push({
      file: relativePath,
      count: gridMatches.length
    });
  }
  
  // Check for relative units
  const emMatches = css.match(/\d+(\.\d+)?em/g);
  const remMatches = css.match(/\d+(\.\d+)?rem/g);
  const vwMatches = css.match(/\d+(\.\d+)?vw/g);
  const vhMatches = css.match(/\d+(\.\d+)?vh/g);
  const percentMatches = css.match(/\d+(\.\d+)?%/g);
  
  if (emMatches) {
    results.responsive.relativeUnits.count += emMatches.length;
    results.responsive.relativeUnits.types.add('em');
  }
  
  if (remMatches) {
    results.responsive.relativeUnits.count += remMatches.length;
    results.responsive.relativeUnits.types.add('rem');
  }
  
  if (vwMatches) {
    results.responsive.relativeUnits.count += vwMatches.length;
    results.responsive.relativeUnits.types.add('vw');
  }
  
  if (vhMatches) {
    results.responsive.relativeUnits.count += vhMatches.length;
    results.responsive.relativeUnits.types.add('vh');
  }
  
  if (percentMatches) {
    results.responsive.relativeUnits.count += percentMatches.length;
    results.responsive.relativeUnits.types.add('%');
  }
  
  results.responsive.relativeUnits.details.push({
    file: relativePath,
    em: emMatches ? emMatches.length : 0,
    rem: remMatches ? remMatches.length : 0,
    vw: vwMatches ? vwMatches.length : 0,
    vh: vhMatches ? vhMatches.length : 0,
    percent: percentMatches ? percentMatches.length : 0
  });
  
  // Check for fixed width issues
  const fixedWidthMatches = css.match(/width\s*:\s*\d+px/g);
  if (fixedWidthMatches && fixedWidthMatches.length > 10) { // Allow some fixed widths
    results.issues.push({
      type: 'Excessive fixed widths',
      file: relativePath,
      description: `Found ${fixedWidthMatches.length} fixed width declarations which may affect responsiveness`
    });
  }
}

// Main function
function runResponsiveChecker() {
  console.log('Starting responsive design checker...');
  
  // Create the tests directory if it doesn't exist
  if (!fs.existsSync(path.join(rootDir, 'tests'))) {
    fs.mkdirSync(path.join(rootDir, 'tests'));
  }
  
  // Check for viewport meta tag
  checkViewportMeta();
  
  // Get all CSS files
  const cssFiles = getAllCssFiles(rootDir);
  console.log(`Found ${cssFiles.length} CSS files`);
  
  // Check each file
  cssFiles.forEach(checkCssFile);
  
  // Convert Sets to Arrays for JSON output
  results.mediaQueries.breakpoints = Array.from(results.mediaQueries.breakpoints);
  results.responsive.relativeUnits.types = Array.from(results.responsive.relativeUnits.types);
  
  // Analyze results
  if (results.mediaQueries.count === 0) {
    results.issues.push({
      type: 'No media queries',
      description: 'No media queries found in CSS files. Media queries are essential for responsive design.'
    });
  }
  
  if (results.flexbox.count === 0 && results.grid.count === 0) {
    results.issues.push({
      type: 'No modern layout methods',
      description: 'Neither Flexbox nor CSS Grid were detected. These are important for responsive layouts.'
    });
  }
  
  if (results.responsive.relativeUnits.count < 20) { // Arbitrary threshold
    results.issues.push({
      type: 'Few relative units',
      description: 'Few relative units (em, rem, %, vw, vh) were detected. These are important for responsive design.'
    });
  }
  
  // Print results
  console.log('\nResponsive Design Checker Results:');
  console.log(`Media Queries: ${results.mediaQueries.count}`);
  console.log(`Breakpoints detected: ${results.mediaQueries.breakpoints.join(', ')}`);
  console.log(`Flexbox usage: ${results.flexbox.count} instances`);
  console.log(`CSS Grid usage: ${results.grid.count} instances`);
  console.log(`Relative units: ${results.responsive.relativeUnits.count} instances`);
  console.log(`Unit types used: ${Array.from(results.responsive.relativeUnits.types).join(', ')}`);
  console.log(`Viewport meta tag: ${results.responsive.viewportMeta ? 'Present' : 'Missing'}`);
  
  if (results.issues.length > 0) {
    console.log('\nPotential Issues:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
    });
  } else {
    console.log('\nNo responsive design issues detected!');
  }
  
  // Save the results to a JSON file
  fs.writeFileSync(
    path.join(rootDir, 'tests', 'responsive-checker-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nResults saved to tests/responsive-checker-results.json');
  
  return results.issues.length === 0;
}

runResponsiveChecker();