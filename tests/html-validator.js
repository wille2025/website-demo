/**
 * Simple HTML validation script for Rank Team Agency website
 * This script checks HTML files for common issues
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Track results
const results = {
  filesChecked: 0,
  issues: []
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

// Process an HTML file to check for common issues
function validateHtmlFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  console.log(`Validating: ${relativePath}`);
  results.filesChecked++;
  
  const html = fs.readFileSync(filePath, 'utf-8');
  
  // Check DOCTYPE
  if (!html.includes('<!DOCTYPE html>')) {
    results.issues.push({
      file: relativePath,
      type: 'Missing DOCTYPE',
      description: 'The HTML5 DOCTYPE declaration is missing'
    });
  }
  
  // Check for HTML lang attribute
  if (!html.match(/<html[^>]+lang=/)) {
    results.issues.push({
      file: relativePath,
      type: 'Missing lang attribute',
      description: 'The html element should have a lang attribute for accessibility'
    });
  }
  
  // Check for viewport meta tag
  if (!html.includes('name="viewport"') || !html.includes('width=device-width')) {
    results.issues.push({
      file: relativePath,
      type: 'Missing viewport meta',
      description: 'The viewport meta tag with width=device-width is required for responsive design'
    });
  }
  
  // Parse the HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Check for images without alt text
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      results.issues.push({
        file: relativePath,
        type: 'Missing alt attribute',
        description: `Image #${index + 1} does not have an alt attribute for accessibility`,
        element: img.outerHTML.substring(0, 100) + (img.outerHTML.length > 100 ? '...' : '')
      });
    }
  });
  
  // Check for empty links
  const links = document.querySelectorAll('a');
  links.forEach((link, index) => {
    if (!link.textContent.trim() && !link.querySelector('img') && !link.title) {
      results.issues.push({
        file: relativePath,
        type: 'Empty link',
        description: `Link #${index + 1} has no text content or title attribute`,
        element: link.outerHTML.substring(0, 100) + (link.outerHTML.length > 100 ? '...' : '')
      });
    }
  });
  
  // Check for semantic elements
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    results.issues.push({
      file: relativePath,
      type: 'No headings',
      description: 'The page has no heading elements, which are important for accessibility and SEO'
    });
  }
  
  // Check heading order
  let previousLevel = 0;
  let headingIssue = false;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    if (index === 0 && level !== 1) {
      results.issues.push({
        file: relativePath,
        type: 'Invalid heading order',
        description: `First heading is not h1, it's h${level}`,
        element: heading.outerHTML
      });
      headingIssue = true;
    } else if (index > 0 && level > previousLevel + 1) {
      results.issues.push({
        file: relativePath,
        type: 'Invalid heading order',
        description: `Heading jumps from h${previousLevel} to h${level}`,
        element: heading.outerHTML
      });
      headingIssue = true;
    }
    previousLevel = level;
  });
  
  // Check for multiple h1 elements
  const h1Elements = document.querySelectorAll('h1');
  if (h1Elements.length > 1) {
    results.issues.push({
      file: relativePath,
      type: 'Multiple h1 elements',
      description: `The page has ${h1Elements.length} h1 elements. Each page should typically have only one h1 element.`
    });
  }
  
  // Check for forms without labels
  const forms = document.querySelectorAll('form');
  forms.forEach((form, formIndex) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input, inputIndex) => {
      if (input.type !== 'submit' && input.type !== 'button' && input.type !== 'hidden') {
        const inputId = input.id;
        if (!inputId) {
          results.issues.push({
            file: relativePath,
            type: 'Input without ID',
            description: `Input #${inputIndex + 1} in form #${formIndex + 1} has no ID attribute, which makes it difficult to associate with a label`,
            element: input.outerHTML
          });
        } else {
          const label = document.querySelector(`label[for="${inputId}"]`);
          if (!label) {
            results.issues.push({
              file: relativePath,
              type: 'Input without label',
              description: `Input #${inputIndex + 1} (id="${inputId}") in form #${formIndex + 1} has no associated label element`,
              element: input.outerHTML
            });
          }
        }
      }
    });
  });
  
  // Check for deprecated elements and attributes
  const deprecatedElements = document.querySelectorAll('center, font, strike, u, tt, frame, frameset, noframes');
  deprecatedElements.forEach((element) => {
    results.issues.push({
      file: relativePath,
      type: 'Deprecated element',
      description: `The <${element.tagName.toLowerCase()}> element is deprecated in HTML5`,
      element: element.outerHTML.substring(0, 100) + (element.outerHTML.length > 100 ? '...' : '')
    });
  });
}

// Main function
function runHtmlValidator() {
  console.log('Starting HTML validator...');
  
  // Create the tests directory if it doesn't exist
  if (!fs.existsSync(path.join(rootDir, 'tests'))) {
    fs.mkdirSync(path.join(rootDir, 'tests'));
  }
  
  // Get all HTML files
  const htmlFiles = getAllHtmlFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  // Check each file
  htmlFiles.forEach(validateHtmlFile);
  
  // Print results
  console.log('\nHTML Validation Results:');
  console.log(`Files checked: ${results.filesChecked}`);
  console.log(`Issues found: ${results.issues.length}`);
  
  if (results.issues.length > 0) {
    console.log('\nIssues:');
    results.issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.type} in ${issue.file}:`);
      console.log(`   ${issue.description}`);
      if (issue.element) {
        console.log(`   Element: ${issue.element}`);
      }
    });
  } else {
    console.log('\nNo HTML issues found!');
  }
  
  // Save the results to a JSON file
  fs.writeFileSync(
    path.join(rootDir, 'tests', 'html-validation-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nResults saved to tests/html-validation-results.json');
  
  return results.issues.length === 0;
}

runHtmlValidator();