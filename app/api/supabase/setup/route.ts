import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createSupabaseAdmin, getSupabaseDiagnostics } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/server-auth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const diag = getSupabaseDiagnostics()
    const supabase = createSupabaseAdmin()

    // Read the migration SQL file
    let migrationSql = ''
    try {
      const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260909000000_users_tasks_evaluations.sql')
      migrationSql = await fs.readFile(migrationPath, 'utf8')
    } catch {
      // Fallback in case of file path issue
      migrationSql = '-- Migration file: supabase/migrations/20260909000000_users_tasks_evaluations.sql'
    }

    let tablesStatus: Record<string, boolean> = {
      profiles: false,
      students: false,
      tasks: false,
      evaluations: false,
      app_snapshots: false,
    }
    let connectionTest = 'لم يتم الفحص'
    let connectionError: string | null = null

    if (supabase) {
      try {
        // Test query on students
        const { error: studentsErr } = await supabase.from('students').select('id').limit(1)
        tablesStatus.students = !studentsErr

        // Test query on tasks
        const { error: tasksErr } = await supabase.from('tasks').select('id').limit(1)
        tablesStatus.tasks = !tasksErr

        // Test query on evaluations
        const { error: evalsErr } = await supabase.from('evaluations').select('id').limit(1)
        tablesStatus.evaluations = !evalsErr

        // Test query on app_snapshots
        const { error: snapErr } = await supabase.from('app_snapshots').select('id').limit(1)
        tablesStatus.app_snapshots = !snapErr

        connectionTest = 'متصل بنجاح مع Supabase'
      } catch (err: any) {
        connectionTest = 'فشل الاستعلام من Supabase'
        connectionError = err?.message || 'خطأ غير معروف'
      }
    } else {
      connectionTest = 'في انتظار مفاتيح Supabase الصالحة (JWT)'
    }

    return NextResponse.json({
      success: true,
      diagnostics: diag,
      connectionTest,
      connectionError,
      tablesStatus,
      migrationSql,
      instructions: [
        'لتهيئة الجداول مباشرة في قاعدة بيانات Supabase:',
        '1. افتح لوحة تحكم مشروعك في Supabase (https://supabase.com/dashboard)',
        '2. انتقل إلى قسم SQL Editor من القائمة الجانبية',
        '3. الصق محتوى استعلام التهيئة (migrationSql) واضغط Run',
        '4. ستنشأ جداول المستخدمين (profiles/students)، المهام (tasks)، التقييمات (evaluations)، ولقطات التطبيق (app_snapshots).'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'تعذر فحص اتصال Supabase'
    }, { status: 500 })
  }
}
