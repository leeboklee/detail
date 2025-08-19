import { NextResponse } from 'next/server';

export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: 3900,
    environment: process.env.NODE_ENV || 'development'
  });
} 