/**
 * POST /api/upload — Upload a file with auth, validation, and DB tracking
 *
 * Flow: validate → upload to storage → save metadata to DB → return result
 */

import { pool } from '@/lib/db'
import { authenticateRequest, authError } from '@/lib/auth'
import { validateFile, uploadToStorage } from '@/lib/file-upload'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BODY_SIZE = 30 * 1024 * 1024 // 30MB

function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}

export async function POST(request: Request) {
  // 1. Authenticate
  const auth = authenticateRequest(request)
  if (!auth.authenticated) return authError(auth)

  try {
    // 2. Parse form data
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return response({ error: 'الطلب يجب أن يكون multipart/form-data' }, 400)
    }

    const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
    if (contentLength > MAX_BODY_SIZE) {
      return response({ error: 'حجم الملف يتجاوز الحد الأقصى (30MB)' }, 413)
    }

    const form = await request.formData()
    const file = form.get('file')
    const category = (form.get('category') as string) || 'other'

    if (!(file instanceof File)) {
      return response({ error: 'لم يتم إرسال ملف صالح' }, 400)
    }

    // 3. Validate file
    const validation = validateFile({ name: file.name, size: file.size, type: file.type }, category)
    if (!validation.valid) {
      return response({ error: validation.error }, 400)
    }

    // 4. Generate ID and read buffer
    const fileId = crypto.randomUUID()
    const buffer = Buffer.from(await file.arrayBuffer())

    // 5. Upload to storage
    const uploadResult = await uploadToStorage(
      buffer,
      file.name,
      auth.user!.userId,
      category,
      file.type,
    )

    // 6. Save metadata to DB
    await pool.query(
      `INSERT INTO uploaded_files (id, user_id, original_name, storage_path, mime_type, file_size, status, category)
       VALUES ($1, $2, $3, $4, $5, $6, 'uploaded', $7)`,
      [fileId, auth.user!.userId, file.name, uploadResult.storagePath, file.type, file.size, category],
    )

    // 7. Return result
    return response({
      success: true,
      file: {
        id: fileId,
        name: file.name,
        storagePath: uploadResult.storagePath,
        mimeType: file.type,
        size: file.size,
        category,
        status: 'uploaded',
        uploadedBy: auth.user!.userId,
      },
      warning: validation.warning || undefined,
    }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    if (message.includes('token') || message.includes('secret')) {
      return response({ error: 'خطأ في إعداد التخزين' }, 500)
    }
    return response({ error: `تعذر رفع الملف: ${message.slice(0, 200)}` }, 500)
  }
}
