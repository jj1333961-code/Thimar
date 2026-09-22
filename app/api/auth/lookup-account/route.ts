import { NextRequest, NextResponse } from 'next/server'
import { joinRequestsDb, JoinRequest } from '@/lib/supabase/database'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, uid } = body

    const cleanEmail = email ? String(email).trim().toLowerCase() : ''
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : ''

    // 1. Check in join_requests via database abstraction
    try {
      const allRequests: JoinRequest[] = await joinRequestsDb.getAll()
      const match = allRequests.find((r: JoinRequest) => {
        const reqEmail = r.email ? r.email.trim().toLowerCase() : ''
        const reqPhone = r.phone ? r.phone.replace(/\D/g, '') : ''
        return (cleanEmail && reqEmail === cleanEmail) || 
               (cleanPhone && reqPhone === cleanPhone) ||
               (uid && r.email?.includes(uid))
      })

      if (match) {
        return NextResponse.json({
          found: true,
          user: {
            id: match.id,
            name: match.name,
            email: match.email,
            phone: match.phone,
            role: match.role || 'student',
            status: match.status,
            identityCode: match.identity_code,
            provider: match.provider,
            target_juz: match.target_juz,
            target_surah: match.target_surah,
            student_name: match.student_name,
          }
        })
      }
    } catch (e) {
      console.warn('Error querying joinRequestsDb:', e)
    }

    // 2. Check in Firestore users if available
    if (adminDb) {
      try {
        if (cleanEmail) {
          const snapshot = await adminDb.collection('users').where('email', '==', cleanEmail).limit(1).get()
          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            const data = doc.data()
            return NextResponse.json({
              found: true,
              user: {
                id: doc.id,
                name: data.name || data.displayName,
                email: data.email,
                phone: data.phone,
                role: data.role || 'student',
                status: data.isApproved ? 'approved' : 'pending',
                identityCode: data.identityCode,
                provider: data.provider,
              }
            })
          }
        }

        if (uid) {
          const doc = await adminDb.collection('users').doc(uid).get()
          if (doc.exists) {
            const data = doc.data() || {}
            return NextResponse.json({
              found: true,
              user: {
                id: doc.id,
                name: data.name || data.displayName,
                email: data.email,
                phone: data.phone,
                role: data.role || 'student',
                status: data.isApproved ? 'approved' : 'pending',
                identityCode: data.identityCode,
                provider: data.provider,
              }
            })
          }
        }
      } catch (e) {
        console.warn('Error querying adminDb users:', e)
      }
    }

    return NextResponse.json({
      found: false,
      message: 'لم يتم العثور على حساب مسجل مرتبط بهذا الحساب'
    })
  } catch (error) {
    console.error('Lookup account error:', error)
    return NextResponse.json({ found: false, error: 'حدث خطأ أثناء فحص الحساب' }, { status: 500 })
  }
}
