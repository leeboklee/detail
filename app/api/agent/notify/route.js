import fs from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const body = await request.json();
    const logDir = path.join(process.cwd(), 'logs', 'agent');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const file = path.join(logDir, `notify-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify({ ...body, receivedAt: new Date().toISOString() }, null, 2));

    // forward to local socket server
    try {
      await fetch(process.env.SOCKET_SERVER_URL || 'http://localhost:4001/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: body.title, message: body.message, extra: body.extra || {} })
      });
    } catch (e) {
      console.error('Forward to socket failed', e);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}


