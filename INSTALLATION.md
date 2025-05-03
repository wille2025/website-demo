# Rank Team Agency Website - Installation Guide

## Viewing the Website Locally

1. Navigate to the project directory:
   ```
   cd path/to/rank-team-agency
   ```

2. Start a local server (choose one option):

   **Using Python:**
   ```
   # Python 3.x
   python -m http.server 8000
   # or Python 2.x
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js:**
   ```
   # Install http-server if you haven't already
   npm install -g http-server
   
   # Run the server
   http-server -p 8000
   ```

3. Open your browser and visit:
   ```
   http://localhost:8000
   ```

## File Structure

- `index.html` - Main HTML file with the website content
- `css/styles.css` - All styling for the website
- `js/main.js` - JavaScript functionality for interactive elements
- `images/` - Directory for storing image assets (currently empty)

## Notes

- The website is completely static and doesn't require any backend services
- All functionality (form submissions, etc.) is simulated with JavaScript
- For production deployment, you'll want to use a proper web hosting service