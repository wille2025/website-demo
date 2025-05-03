# Rank Team Agency Website - Deployment Guide

This document provides instructions for deploying the Rank Team Agency website to various hosting environments.

## Prerequisites

Before deploying, ensure you have:
- Completed all testing using the provided test scripts
- Optimized all images using the optimization script
- Made any necessary final adjustments to content and styling

## Deployment Options

### Option 1: Traditional Web Hosting

For traditional web hosting services like cPanel, Plesk, etc.

1. **Prepare your files**
   ```bash
   # Create a ZIP archive of all files
   zip -r rank-team-agency-website.zip *
   ```

2. **Upload to your hosting provider**
   - Log in to your hosting control panel
   - Navigate to the file manager or FTP section
   - Upload the ZIP file or individual files to your web root directory (usually `public_html`, `www`, or `htdocs`)
   - If you uploaded a ZIP file, extract it on the server

3. **Set permissions**
   - Set folders to `755` permission
   - Set files to `644` permission

4. **Configure your domain**
   - Point your domain to the directory containing the website files
   - Ensure your DNS settings are properly configured

### Option 2: GitHub Pages

For free hosting with GitHub Pages:

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rank-team-agency.git
   git push -u origin master
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select the branch you want to deploy (usually `master` or `main`)
   - Save the changes

3. **Your site will be available at**
   - `https://yourusername.github.io/rank-team-agency/`

### Option 3: Netlify

For modern, fast hosting with Netlify:

1. **Sign up for a Netlify account** at [netlify.com](https://www.netlify.com/)

2. **Deploy via Git integration**
   - Connect your GitHub, GitLab, or Bitbucket account
   - Select your repository
   - Configure build settings (not needed for static HTML sites)
   - Click "Deploy Site"

3. **Alternatively, deploy via drag-and-drop**
   - Go to the Netlify dashboard
   - Drag and drop your entire project folder onto the designated area

4. **Configure your domain**
   - In the Netlify dashboard, go to Site settings > Domain management
   - Add your custom domain and follow the instructions

### Option 4: Amazon S3 + CloudFront

For scalable, high-performance hosting on AWS:

1. **Create an S3 bucket**
   - Sign in to the AWS Management Console
   - Navigate to S3 and create a new bucket
   - Enable "Static website hosting" in bucket properties
   - Set the index document to "index.html"

2. **Upload your files**
   ```bash
   # Install AWS CLI if you haven't already
   pip install awscli
   
   # Configure AWS CLI
   aws configure
   
   # Upload files
   aws s3 sync . s3://your-bucket-name/ --exclude "*.md" --exclude "tests/*" --exclude "node_modules/*" --exclude "package*" --exclude ".git/*"
   ```

3. **Set bucket policy for public access**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

4. **Optional: Set up CloudFront for CDN**
   - Navigate to CloudFront in the AWS console
   - Create a new distribution
   - Select your S3 bucket as the origin
   - Configure caching behaviors as needed
   - Add your custom domain and SSL certificate if desired

## Performance Optimization Tips

1. **Enable GZIP compression**
   - Create a `.htaccess` file for Apache servers:
     ```
     <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript
     </IfModule>
     ```

2. **Set up browser caching**
   - Add to your `.htaccess` file:
     ```
     <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
       ExpiresByType image/gif "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/svg+xml "access plus 1 year"
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
       ExpiresByType text/html "access plus 1 week"
     </IfModule>
     ```

3. **Minify CSS and JavaScript**
   - Before deployment, consider using tools like [Minifier](https://www.minifier.org/) to reduce file sizes

## Post-Deployment Checklist

1. **Verify all pages load correctly**
   - Test the website on multiple browsers
   - Check all pages and navigation links

2. **Check contact form functionality**
   - Ensure the contact form works properly if you've implemented server-side functionality

3. **Verify SEO elements**
   - Check title tags, meta descriptions, and headings
   - Test with Google's Mobile-Friendly Test

4. **Monitor performance**
   - Use tools like Google PageSpeed Insights to identify any performance issues

## Maintenance

Remember to regularly:
- Update content as needed
- Check for broken links
- Monitor website performance
- Keep backup copies of all files

For any questions or support, please contact the development team.