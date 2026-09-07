import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/supabase/database'
import { isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabase/client'

// GET /api/supabase/health - فحص حالة الاتصال بقاعدة البيانات
export async function GET(request: NextRequest) {
  try {
    const clientConfigured = isSupabaseConfigured()
    const config = getSupabaseConfig()

    if (!clientConfigured) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Supabase غير مُعدّ - المتغيرات البيئية مفقودة',
      }, { status: 503 })
    }

    const { connected, error } = await checkDatabaseConnection()

    return NextResponse.json({
      success: connected,
      configured: true,
      connected,
      error: error || null,
      url: config.url ? '***configured***' : null,
    })
  } catch (error) {
    console.error('[API/supabase/health] Error:', error)
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'خطأ غير متوقع',
    }, { status: 500 })
  }
}
