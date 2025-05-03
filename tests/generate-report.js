/**
 * Test results summarizer for Rank Team Agency website
 * This script combines all test results and generates a final report
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const testsDir = path.join(rootDir, 'tests');
const outputFile = path.join(testsDir, 'final-report.html');

// Main function
function generateReport() {
  console.log('Generating final report...');
  
  const results = {
    htmlValidation: readJsonFile(path.join(testsDir, 'html-validation-results.json')),
    linkChecker: readJsonFile(path.join(testsDir, 'link-checker-results.json')),
    responsiveChecker: readJsonFile(path.join(testsDir, 'responsive-checker-results.json')),
    imageOptimization: readJsonFile(path.join(rootDir, 'image-optimization-results.json'))
  };
  
  // Generate the report HTML
  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - Rank Team Agency Website</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --accent-color: #f59e0b;
            --dark-color: #1f2937;
            --light-color: #f9fafb;
            --gray-color: #9ca3af;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--dark-color);
            background-color: var(--light-color);
            padding: 2rem;
        }
        
        h1, h2, h3, h4 {
            margin-bottom: 1rem;
            color: var(--dark-color);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--primary-color);
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 1rem;
        }
        
        h2 {
            margin-top: 2rem;
            color: var(--primary-color);
            border-bottom: 1px solid var(--gray-color);
            padding-bottom: 0.5rem;
        }
        
        p {
            margin-bottom: 1rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .summary {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: var(--light-color);
            border-radius: 8px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .summary-item {
            padding: 1rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .summary-item h3 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .summary-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .success {
            color: var(--success-color);
        }
        
        .warning {
            color: var(--warning-color);
        }
        
        .error {
            color: var(--error-color);
        }
        
        .section {
            margin-bottom: 2rem;
        }
        
        .issues-list {
            margin-top: 1rem;
        }
        
        .issue-item {
            background-color: var(--light-color);
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            border-left: 4px solid var(--warning-color);
        }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .issue-title {
            font-weight: bold;
        }
        
        .issue-location {
            color: var(--gray-color);
            font-size: 0.9rem;
        }
        
        .issue-description {
            margin-bottom: 0.5rem;
        }
        
        .issue-element {
            padding: 0.5rem;
            background-color: #f8f8f8;
            border-radius: 4px;
            font-family: monospace;
            overflow-x: auto;
            font-size: 0.9rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--gray-color);
        }
        
        th {
            background-color: var(--light-color);
        }
        
        tr:hover {
            background-color: #f8f8f8;
        }
        
        .timestamp {
            text-align: center;
            margin-top: 2rem;
            color: var(--gray-color);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rank Team Agency Website - Test Report</h1>
        
        <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <h3>HTML Validation</h3>
                    <div class="summary-number ${results.htmlValidation && results.htmlValidation.issues.length === 0 ? 'success' : 'warning'}">
                        ${results.htmlValidation ? results.htmlValidation.issues.length : 'N/A'}
                    </div>
                    <p>Issues found</p>
                </div>
                <div class="summary-item">
                    <h3>Link Checker</h3>
                    <div class="summary-number ${results.linkChecker && results.linkChecker.broken.length === 0 ? 'success' : 'error'}">
                        ${results.linkChecker ? results.linkChecker.broken.length : 'N/A'}
                    </div>
                    <p>Broken links</p>
                </div>
                <div class="summary-item">
                    <h3>Responsive Design</h3>
                    <div class="summary-number ${results.responsiveChecker && results.responsiveChecker.issues.length === 0 ? 'success' : 'warning'}">
                        ${results.responsiveChecker ? results.responsiveChecker.issues.length : 'N/A'}
                    </div>
                    <p>Responsive issues</p>
                </div>
                <div class="summary-item">
                    <h3>Image Optimization</h3>
                    <div class="summary-number success">
                        ${results.imageOptimization ? results.imageOptimization.optimized : 'N/A'}
                    </div>
                    <p>Images optimized</p>
                </div>
            </div>
        </div>
        
        <!-- HTML Validation Section -->
        <div class="section">
            <h2>HTML Validation</h2>
            ${
              !results.htmlValidation 
              ? '<p>No HTML validation results found</p>' 
              : `
                <p>Checked ${results.htmlValidation.filesChecked} HTML files and found ${results.htmlValidation.issues.length} issues.</p>
                ${
                  results.htmlValidation.issues.length === 0 
                  ? '<p class="success">No HTML validation issues found! 🎉</p>' 
                  : `
                    <div class="issues-list">
                      ${results.htmlValidation.issues.map(issue => `
                        <div class="issue-item">
                          <div class="issue-header">
                            <span class="issue-title">${issue.type}</span>
                            <span class="issue-location">${issue.file}</span>
                          </div>
                          <div class="issue-description">${issue.description}</div>
                          ${issue.element ? `<div class="issue-element">${issue.element}</div>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  `
                }
              `
            }
        </div>
        
        <!-- Link Checker Section -->
        <div class="section">
            <h2>Link Checker</h2>
            ${
              !results.linkChecker 
              ? '<p>No link checker results found</p>' 
              : `
                <p>Checked ${results.linkChecker.checked} links across all pages.</p>
                ${
                  results.linkChecker.broken.length === 0 
                  ? '<p class="success">No broken links found! 🎉</p>' 
                  : `
                    <p class="error">Found ${results.linkChecker.broken.length} broken links:</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Page</th>
                          <th>Link</th>
                          <th>Text</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${results.linkChecker.broken.map(link => `
                          <tr>
                            <td>${link.file}</td>
                            <td>${link.href}</td>
                            <td>${link.text}</td>
                            <td>${link.reason}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `
                }
              `
            }
        </div>
        
        <!-- Responsive Design Section -->
        <div class="section">
            <h2>Responsive Design Check</h2>
            ${
              !results.responsiveChecker 
              ? '<p>No responsive design check results found</p>' 
              : `
                <p>Scanned CSS files for responsive design features.</p>
                <div class="summary-grid">
                  <div class="summary-item">
                    <h3>Media Queries</h3>
                    <div class="summary-number">${results.responsiveChecker.mediaQueries.count}</div>
                  </div>
                  <div class="summary-item">
                    <h3>Flexbox Usage</h3>
                    <div class="summary-number">${results.responsiveChecker.flexbox.count}</div>
                  </div>
                  <div class="summary-item">
                    <h3>Grid Usage</h3>
                    <div class="summary-number">${results.responsiveChecker.grid.count}</div>
                  </div>
                  <div class="summary-item">
                    <h3>Relative Units</h3>
                    <div class="summary-number">${results.responsiveChecker.responsive.relativeUnits.count}</div>
                  </div>
                </div>
                
                <h3 style="margin-top: 1.5rem;">Detected Breakpoints</h3>
                <p>${results.responsiveChecker.mediaQueries.breakpoints.length > 0 
                   ? results.responsiveChecker.mediaQueries.breakpoints.join('px, ') + 'px' 
                   : 'No breakpoints detected'}</p>
                
                ${
                  results.responsiveChecker.issues.length === 0 
                  ? '<p class="success" style="margin-top: 1rem;">No responsive design issues found! 🎉</p>' 
                  : `
                    <h3 style="margin-top: 1.5rem;">Responsive Issues</h3>
                    <div class="issues-list">
                      ${results.responsiveChecker.issues.map(issue => `
                        <div class="issue-item">
                          <div class="issue-header">
                            <span class="issue-title">${issue.type}</span>
                            ${issue.file ? `<span class="issue-location">${issue.file}</span>` : ''}
                          </div>
                          <div class="issue-description">${issue.description}</div>
                        </div>
                      `).join('')}
                    </div>
                  `
                }
              `
            }
        </div>
        
        <!-- Image Optimization Section -->
        <div class="section">
            <h2>Image Optimization</h2>
            ${
              !results.imageOptimization 
              ? '<p>No image optimization results found</p>' 
              : `
                <p>Processed ${results.imageOptimization.processed} images.</p>
                ${
                  results.imageOptimization.optimized === 0 
                  ? '<p>No images were optimized. They may already be optimized.</p>' 
                  : `
                    <p class="success">Successfully optimized ${results.imageOptimization.optimized} images, saving a total of ${results.imageOptimization.savings}KB.</p>
                    ${
                      results.imageOptimization.details.length > 0 
                      ? `
                        <table>
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Before</th>
                              <th>After</th>
                              <th>Saved</th>
                              <th>Reduction</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${results.imageOptimization.details.map(img => `
                              <tr>
                                <td>${img.file}</td>
                                <td>${img.before} KB</td>
                                <td>${img.after} KB</td>
                                <td>${img.saved} KB</td>
                                <td>${img.percent}%</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      `
                      : ''
                    }
                  `
                }
              `
            }
        </div>
        
        <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
  `;
  
  // Write the report to a file
  fs.writeFileSync(outputFile, reportHtml);
  
  console.log(`Report generated: ${outputFile}`);
}

// Helper function to read JSON files
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
  }
  return null;
}

generateReport();