import { NextRequest, NextResponse } from 'next/server'
import { aiHistoryDb } from '@/lib/supabase/database'

// GET /api/supabase/ai-history - جلب تاريخ أسئلة الذكاء الاصطناعي
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const history = await aiHistoryDb.getRecent(limit)
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('[API/supabase/ai-history] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب تاريخ الذكاء الاصطناعي' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/ai-history - حفظ أسئلة جديدة من الذكاء الاصطناعي
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generated_by, topic, difficulty, questions, source, source_model, context } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: 'الأسئلة مطلوبة' },
        { status: 400 }
      )
    }

    const entry = await aiHistoryDb.create({
      generated_by,
      topic,
      difficulty,
      questions,
      source: source || 'gemini',
      source_model,
      context,
    })

    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/ai-history] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل حفظ أسئلة الذكاء الاصطناعي' },
      { status: 500 }
    )
  }
}
