/**
 * File validation and upload pipeline utilities
 *
 * Validates file types, sizes, and handles the upload → storage → DB metadata flow.
 */

import { put, del, get } from '@vercel/blob'

// ===== File validation constants =====

const ALLOWED_MIME_TYPES = new Map<string, string[]>([
  ['application/pdf', ['pdf']],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['docx']],
  ['text/plain', ['txt']],
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
  ['image/webp', ['webp']],
  ['audio/mpeg', ['mp3']],
  ['audio/wav', ['wav']],
  ['video/mp4', ['mp4']],
])

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif',
  'js', 'vbs', 'ws', 'wsf', 'wsc',
  'sh', 'bash', 'zsh', 'csh',
  'php', 'py', 'rb', 'pl',
  'jar', 'class',
])

const MAX_FILE_SIZES: Record<string, number> = {
  exam: 10 * 1024 * 1024,       // 10MB for exam files
  recitation: 25 * 1024 * 1024,  // 25MB for audio recordings
  assignment: 15 * 1024 * 1024,  // 15MB for assignments
  other: 10 * 1024 * 1024,       // 10MB default
}

// ===== Validation =====

export interface ValidationResult {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * Validate a file before upload
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  category: string = 'other',
): ValidationResult {
  // 1. Check extension isn't blocked
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (BLOCKED_EXTENSIONS.has(extension)) {
    return { valid: false, error: `نوع الملف ".${extension}" غير مسموح به لأسباب أمنية` }
  }

  // 2. Check MIME type is allowed
  const allowedExtensions = ALLOWED_MIME_TYPES.get(file.type)
  if (allowedExtensions && !allowedExtensions.includes(extension)) {
    return { valid: false, error: `نوع الملف ".${extension}" لا يتوافق مع النوع المعلن "${file.type}"` }
  }

  // 3. Check file size
  const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.other
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024))
    const fileMB = Math.round(file.size / (1024 * 1024))
    return { valid: false, error: `حجم الملف (${fileMB}MB) يتجاوز الحد الأقصى (${maxMB}MB)` }
  }

  // 4. Check filename
  if (file.name.length > 200) {
    return { valid: false, error: 'اسم الملف طويل جداً (الحد الأقصى 200 حرف)' }
  }

  // 5. Warn about large files
  if (file.size > 5 * 1024 * 1024) {
    return { valid: true, warning: 'ملف كبير — قد يستغرق الرفع بعض الوقت' }
  }

  return { valid: true }
}

// ===== Safe filename =====

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

// ===== Upload pipeline =====

export interface UploadResult {
  storagePath: string
  blobUrl: string
  pathname: string
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadToStorage(
  buffer: Buffer,
  originalName: string,
  userId: string,
  category: string,
  mimeType: string,
): Promise<UploadResult> {
  const id = crypto.randomUUID()
  const safeName = sanitizeFilename(originalName)
  const pathname = `uploads/${category}/${userId}/${id}-${safeName}`

  const blob = await put(pathname, buffer, {
    access: 'private',
    contentType: mimeType || 'application/octet-stream',
    addRandomSuffix: false,
  })

  return {
    storagePath: pathname,
    blobUrl: blob.url,
    pathname: blob.pathname,
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFromStorage(pathname: string): Promise<void> {
  if (pathname.startsWith('references/')) {
    throw new Error('لا يمكن حذف ملفات المرجع المثبتة')
  }
  await del(pathname)
}

/**
 * Get a temporary download URL for a private file
 */
export async function getDownloadUrl(pathname: string): Promise<string | null> {
  try {
    const result = await get(pathname, { access: 'private' })
    if (result && result.statusCode === 200) {
      // Vercel Blob get() returns a stream; for private blobs we reconstruct the URL
      return `https://blob.vercel-storage.com/${pathname}`
    }
    return null
  } catch {
    return null
  }
}

// ===== File status management =====

export type FileStatus = 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed'

const STATUS_TRANSITIONS: Record<FileStatus, FileStatus[]> = {
  uploading: ['uploaded', 'failed'],
  uploaded: ['processing', 'failed'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: ['uploading'], // retry
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(current: FileStatus, next: FileStatus): boolean {
  return STATUS_TRANSITIONS[current]?.includes(next) ?? false
}
