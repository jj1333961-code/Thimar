import { redirect } from 'next/navigation'

// حافظ على مسار دخول موحّد حتى لا تبقى الصفحة عالقة في صفحة HTML القديمة.
export default function Page() {
  redirect('/login')
}
