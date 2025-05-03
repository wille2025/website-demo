/**
 * Image optimization script for Rank Team Agency website
 * This script optimizes all images in the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname);
const imagesDir = path.join(rootDir, 'images');

// Track results
const results = {
  processed: 0,
  optimized: 0,
  savings: 0,
  details: []
};

// Get all image files
function getAllImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get file size in KB
function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

// Main function
function optimizeImages() {
  console.log('Starting image optimization...');
  
  // Get all image files
  const imageFiles = getAllImageFiles(imagesDir);
  console.log(`Found ${imageFiles.length} image files`);
  
  if (imageFiles.length === 0) {
    console.log('No images to optimize.');
    return;
  }
  
  // Check if imagemin is installed
  try {
    console.log('Please ensure you have the necessary tools installed:');
    console.log('npm install -g imagemin-cli imagemin-pngquant');
    
    // Process each image
    imageFiles.forEach(imagePath => {
      const relativePath = path.relative(rootDir, imagePath);
      console.log(`Processing: ${relativePath}`);
      
      const originalSize = getFileSizeInKB(imagePath);
      results.processed++;
      
      try {
        // Optimize the image based on its type
        if (imagePath.match(/\.(png)$/i)) {
          // Optimize PNG
          execSync(`imagemin ${imagePath} --plugin=pngquant --out-dir=${path.dirname(imagePath)}`, { stdio: 'inherit' });
        } else {
          // Optimize JPEG and other formats
          execSync(`imagemin ${imagePath} --out-dir=${path.dirname(imagePath)}`, { stdio: 'inherit' });
        }
        
        // Get the new size
        const newSize = getFileSizeInKB(imagePath);
        const savedSize = originalSize - newSize;
        
        if (savedSize > 0) {
          results.optimized++;
          results.savings += savedSize;
          results.details.push({
            file: relativePath,
            before: originalSize,
            after: newSize,
            saved: savedSize,
            percent: Math.round((savedSize / originalSize) * 100)
          });
          console.log(`Optimized: ${relativePath} - Saved ${savedSize}KB (${Math.round((savedSize / originalSize) * 100)}%)`);
        } else {
          console.log(`Skipped: ${relativePath} - Already optimized`);
        }
      } catch (err) {
        console.error(`Error optimizing ${relativePath}: ${err.message}`);
      }
    });
    
    // Print results
    console.log('\nImage Optimization Results:');
    console.log(`Processed: ${results.processed} images`);
    console.log(`Optimized: ${results.optimized} images`);
    console.log(`Total savings: ${results.savings}KB`);
    
    // Save the results to a JSON file
    fs.writeFileSync(
      path.join(rootDir, 'image-optimization-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nResults saved to image-optimization-results.json');
  } catch (err) {
    console.error('Error: imagemin tools not found. Please install them using:');
    console.error('npm install -g imagemin-cli imagemin-pngquant');
  }
}

optimizeImages();