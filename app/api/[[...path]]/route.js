import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

let cachedClient = null;
async function getDb() {
  if (cachedClient) return cachedClient.db(process.env.DB_NAME || 'portfolio');
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  cachedClient = client;
  return client.db(process.env.DB_NAME || 'portfolio');
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function GET(request, { params }) {
  const path = ((await params)?.path || []).join('/');
  try {
    if (path === '' || path === 'health') {
      return NextResponse.json({ ok: true, service: 'portfolio-api' }, { headers: cors });
    }
    if (path === 'messages') {
      const db = await getDb();
      const msgs = await db.collection('messages').find({}).sort({ created_at: -1 }).limit(50).toArray();
      return NextResponse.json(msgs.map(({ _id, ...m }) => m), { headers: cors });
    }
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors });
  }
}

export async function POST(request, { params }) {
  const path = ((await params)?.path || []).join('/');
  try {
    const body = await request.json();
    if (path === 'contact') {
      const { name, email, message } = body || {};
      if (!name || !email || !message) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: cors });
      }
      const db = await getDb();
      const doc = {
        id: uuidv4(),
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        message: String(message).slice(0, 5000),
        created_at: new Date().toISOString(),
      };
      await db.collection('messages').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id }, { headers: cors });
    }
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors });
  }
}
