import { NextRequest, NextResponse } from 'next/server'
import { joinRequestsDb, JoinRequest, studentsDb, adminsDb } from '@/lib/supabase/database'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, uid } = body

    const cleanEmail = email ? String(email).trim().toLowerCase() : ''
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : ''

    // 0. Check in studentsDb
    try {
      const allStudents = await studentsDb.getAll()
      const studentMatch = allStudents.find((s: any) => {
        const sEmail = (s.email || s.googleEmail || s.facebookEmail || '').trim().toLowerCase()
        const sPhone = (s.phone || '').replace(/\D/g, '')
        const pEmail = (s.parentEmail || s.parentGoogleEmail || '').trim().toLowerCase()
        return (cleanEmail && (sEmail === cleanEmail || pEmail === cleanEmail)) ||
               (cleanPhone && sPhone === cleanPhone)
      })

      if (studentMatch) {
        return NextResponse.json({
          found: true,
          user: {
            id: studentMatch.id,
            name: studentMatch.name,
            email: studentMatch.email,
            phone: studentMatch.phone,
            role: 'student',
            status: 'approved',
            identityCode: (studentMatch as any).nid || (studentMatch as any).identity_code || studentMatch.id,
            provider: (studentMatch as any).provider || 'device',
          }
        })
      }
    } catch (e) {
      console.warn('Error querying studentsDb:', e)
    }

    // 0.1 Check in adminsDb
    try {
      const allAdmins = await adminsDb.getAll()
      const adminMatch = allAdmins.find((a: any) => {
        const aEmail = (a.email || a.googleEmail || '').trim().toLowerCase()
        return (cleanEmail && aEmail === cleanEmail)
      })

      if (adminMatch) {
        return NextResponse.json({
          found: true,
          user: {
            id: adminMatch.id,
            name: adminMatch.name || 'مسؤول النظام',
            email: adminMatch.email,
            role: 'admin',
            status: 'approved',
            provider: 'device'
          }
        })
      }
    } catch (e) {
      console.warn('Error querying adminsDb:', e)
    }

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
