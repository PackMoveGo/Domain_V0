import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the built template
const template = fs.readFileSync(resolve(__dirname, '../dist/index.html'), 'utf-8');

// Find and load the SSR entry point
const serverAssetsDir = resolve(__dirname, '../dist/server/assets/js');
let render;

if (fs.existsSync(serverAssetsDir)) {
  const serverFiles = fs.readdirSync(serverAssetsDir);
  const entryServerFile = serverFiles.find(file => file.startsWith('entry-server') && file.endsWith('.js'));
  
  if (entryServerFile) {
    try {
      const serverEntryPath = resolve(serverAssetsDir, entryServerFile);
      console.log('Loading SSR module from:', serverEntryPath);
      const serverModule = await import(`file://${serverEntryPath}`);
      render = serverModule.render;
      
      if (render && typeof render === 'function') {
        console.log('✅ SSR render function loaded successfully');
      } else {
        console.error('❌ render function not found in server entry module');
        console.error('Available exports:', Object.keys(serverModule));
      }
    } catch (error) {
      console.error('❌ Failed to load SSR render function:', error.message);
    }
  } else {
    console.error('❌ Entry server file not found in server build');
  }
}

// HTML cleaning function for better readability
function cleanHtml(html) {
  return html
    .replace(/>\s+</g, '><')  // Remove spaces between tags
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .replace(/>\s+/g, '>')    // Remove spaces after >
    .replace(/\s+</g, '<')    // Remove spaces before <
    .replace(/></g, '>\n<')   // Add line breaks between tags
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

// Simple injection function
function injectAppHtml(template, appHtml) {
  const pattern = /(\s*)<div id="root"><\/div>(\s*)/;
  if (pattern.test(template)) {
    // Clean the app HTML for better readability
    const cleanedAppHtml = cleanHtml(appHtml);
    return template.replace(pattern, `$1<div id="root">\n${cleanedAppHtml}\n$1</div>$2`);
  }
  return template;
}

export default async function handler(req, res) {
  const url = req.url;
  
  console.log(`\n🔄 Vercel SSR Request: ${url}`);
  
  try {
    let html;
    
    if (render && typeof render === 'function') {
      try {
        console.log('📄 Attempting SSR render...');
        const renderResult = await render(url);
        
        let appHtml;
        if (typeof renderResult === 'string') {
          appHtml = renderResult;
        } else if (renderResult && typeof renderResult === 'object') {
          appHtml = renderResult.html || '';
        } else {
          appHtml = '';
        }
        
        console.log(`📄 SSR rendered HTML length: ${appHtml.length}`);
        console.log(`📄 First 100 chars: ${appHtml.substring(0, 100)}`);
        
        // Inject the app-rendered HTML into the template
        html = injectAppHtml(template, appHtml);
        
        // Check if injection worked
        if (html.includes(appHtml.substring(0, 50))) {
          console.log('✅ HTML injection successful');
        } else {
          console.log('❌ HTML injection failed');
        }
        
        console.log(`✅ SSR rendered: ${url}`);
      } catch (ssrError) {
        console.warn(`⚠️ SSR failed for ${url}:`, ssrError.message);
        html = template;
      }
    } else {
      html = template;
      console.log(`📄 CSR fallback: ${url}`);
    }
    
    // Optional: Clean the entire HTML output for better readability
    // Set FORMAT_HTML=true environment variable to enable
    if (process.env.FORMAT_HTML === 'true') {
      html = cleanHtml(html);
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('❌ Error serving page:', error);
    res.status(500).send('Internal Server Error');
  }
}
