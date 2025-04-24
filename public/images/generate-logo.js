// This script uses Puppeteer to generate a PNG from the HTML logo
// To use:
// 1. npm install puppeteer
// 2. node generate-logo.js

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateLogo() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Get the absolute path to the HTML file
  const htmlPath = path.join(__dirname, 'draftly-logo.html');
  const fileUrl = `file://${htmlPath}`;
  
  // Navigate to the HTML file
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  // Set viewport to match the logo container
  await page.setViewport({ width: 500, height: 500 });
  
  // Take a screenshot
  await page.screenshot({ 
    path: path.join(__dirname, 'draftly-logo.png'),
    omitBackground: true
  });
  
  // Create a smaller version for favicon
  await page.setViewport({ width: 64, height: 64 });
  await page.screenshot({ 
    path: path.join(__dirname, 'draftly-favicon.png'),
    omitBackground: true
  });
  
  console.log('Logo generated successfully!');
  await browser.close();
}

generateLogo().catch(console.error); 