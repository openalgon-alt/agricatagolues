import http from 'http';
import url from 'url';
import fs from 'fs';
import handler from './api/index.js';
import mockTestsHandler from './api/mock-tests.js';
import mockQuestionsHandler from './api/mock-questions.js';

// Simple .env parser since we don't have dotenv
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    });
    console.log("Loaded environment variables from .env");
  }
} catch (e) {
  console.warn("Could not read .env file, relying on process.env:", e.message);
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = body;
        }
      }
      
      // Parse query params
      const parsedUrl = url.parse(req.url, true);
      req.query = parsedUrl.query || {};
      const urlPath = parsedUrl.pathname;

      // Setup simple helper response methods compatible with Express signature
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };

      if (urlPath === '/api/mock-tests') {
        await mockTestsHandler(req, res);
      } else if (urlPath === '/api/mock-questions') {
        await mockQuestionsHandler(req, res);
      } else if (urlPath.startsWith('/api')) {
        await handler(req, res);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Route ${urlPath} not found` }));
      }
    } catch (err) {
      console.error("Local API server error:", err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
});
