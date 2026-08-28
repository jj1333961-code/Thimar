import { redirect } from 'next/navigation'

// النسخة القديمة: الجذر يبدأ بصفحة الترحيب في public/index.html.
// هذه صفحة احتياطية في حال لم يُطبَّق الـ rewrite في next.config.mjs.
export default function Page() {
  redirect('/index.html')
}
