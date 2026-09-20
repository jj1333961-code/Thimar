import { NextRequest, NextResponse } from 'next/server';
import { POST as geminiPost } from '@/app/api/gemini/chat/route';

export async function POST(req: NextRequest) {
  return geminiPost(req);
}
