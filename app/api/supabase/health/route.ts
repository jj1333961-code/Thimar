import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/supabase/database'
import { getSupabaseDiagnostics } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET /api/supabase/health - فحص حالة الاتصال بقاعدة بيانات Supabase وتشخيص المفاتيح
export async function GET(request: NextRequest) {
  try {
    const diag = getSupabaseDiagnostics()
    const check = await checkDatabaseConnection()

    const rawUrl = diag.url || ''
    let projectRef = ''
    try {
      const parsed = new URL(rawUrl)
      projectRef = parsed.hostname.split('.')[0] || ''
    } catch {
      projectRef = ''
    }

    const isConnected = check.connected && check.mode.startsWith('supabase')

    let statusText = 'local_fallback'
    let messageAr = 'المنصة تعمل بالتخزين المحلي المستمر الآمن (Local Fallback)'

    if (isConnected) {
      if (check.mode === 'supabase_needs_migration') {
        statusText = 'connected_needs_tables'
        messageAr = 'متصل بـ Supabase بنجاح ولكن يلزم تشغيل استعلام SQL لإنشاء الجداول'
      } else {
        statusText = 'connected'
        messageAr = 'متصل بنجاح بقاعدة بيانات Supabase'
      }
    } else if (diag.issues.length > 0) {
      statusText = 'configuration_needed'
      messageAr = 'يلزم تصحيح مفاتيح Supabase في إعدادات البيئة'
    }

    return NextResponse.json({
      success: true,
      status: statusText,
      message: messageAr,
      supabase: {
        url: rawUrl,
        projectRef,
        isConfigured: diag.isReady,
        isConnected,
        mode: check.mode,
        tables: check.tables || null,
        issues: diag.issues,
        dashboardUrl: projectRef
          ? `https://supabase.com/dashboard/project/${projectRef}/settings/api`
          : 'https://supabase.com/dashboard',
        sqlEditorUrl: projectRef
          ? `https://supabase.com/dashboard/project/${projectRef}/sql`
          : 'https://supabase.com/dashboard',
      },
      instructions: [
        '1. افتح رابط إعدادات API في مشروعك: ' + (projectRef ? `https://supabase.com/dashboard/project/${projectRef}/settings/api` : 'https://supabase.com'),
        '2. انسخ مفتاح anon public (يبدأ بـ eyJhbGciOi...) وضعه في NEXT_PUBLIC_SUPABASE_ANON_KEY',
        '3. انسخ مفتاح service_role secret (يبدأ بـ eyJhbGciOi...) وضعه في SUPABASE_SERVICE_ROLE_KEY',
        '4. افتح SQL Editor ونفّذ ملف التهيئة من مسار /api/supabase/setup لتفعيل الجداول.'
      ]
    })
  } catch (error) {
    console.error('[API/supabase/health] Error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'حدث خطأ أثناء فحص اتصال Supabase',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
