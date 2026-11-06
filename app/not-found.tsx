export default function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>الصفحة غير موجودة</h2>
      <p>عذراً، الصفحة المطلوبة غير متوفرة.</p>
      <a href="/login" style={{ color: '#059669', fontWeight: 'bold' }}>العودة لتسجيل الدخول</a>
    </div>
  );
}
