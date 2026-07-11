import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'progress-api-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/progress' && req.method === 'GET') {
            const filePath = path.resolve(__dirname, 'progress.json');
            
            const createDefaultGlobalState = () => ({
              users: {
                user_1: {
                  id: 'user_1',
                  name: 'Little Typist',
                  level: 1,
                  points: 0,
                  accuracy: 100,
                  wpm: 0,
                  completedLessons: [],
                  badges: [],
                  avatar: 'penguin',
                  highScore: 0
                }
              },
              activeUserId: 'user_1',
              settings: {
                keyboardSound: 'default'
              }
            });

            let globalState;
            
            if (fs.existsSync(filePath)) {
              try {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(rawData);
                
                // Auto-migrate from old single-user flat format to multi-user format
                if (!data.users) {
                  globalState = createDefaultGlobalState();
                  globalState.users.user_1 = { ...globalState.users.user_1, ...data, id: 'user_1' };
                  fs.writeFileSync(filePath, JSON.stringify(globalState, null, 2), 'utf-8');
                } else {
                  globalState = data;
                }
              } catch (err) {
                globalState = createDefaultGlobalState();
              }
            } else {
              globalState = createDefaultGlobalState();
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(globalState));
          } else if (req.url === '/api/progress' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const filePath = path.resolve(__dirname, 'progress.json');
                // Ensure it's valid JSON
                JSON.parse(body);
                fs.writeFileSync(filePath, body, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
})
