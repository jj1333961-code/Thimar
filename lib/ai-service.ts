/**
 * Mock AI service to generate personalized greetings and context summaries.
 * In a real app, this would call the Gemini API via /api/ai/generate.
 */
export async function generateWelcomeSummary(role: 'student' | 'teacher' | 'parent', name: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const summaries = {
    student: [
      `أهلاً بك يا ${name}! لقد فاتك تقييم جديد لسورة البقرة، ومعلمك بانتظار استماع وردك اليومي.`,
      `مرحباً ${name}! لقد حصلت على وسام "المثابر" أثناء غيابك بفضل التزامك الأسبوع الماضي.`,
      `أهلاً بطل المتفوق ${name}! لديك ٣ مهام جديدة في حصة التجويد بانتظار مراجعتك.`
    ],
    teacher: [
      `أهلاً بك يا أستاذ ${name}. هناك ٥ طلاب أتموا حفظ الورد اليومي وبانتظار تقييمك.`,
      `مرحباً بك! لقد أرسل ولي أمر الطالب ياسين رسالة استفسار بخصوص تقدمه في الحفظ.`,
      `يومك مبارك يا ${name}. لديك ٣ طلبات انضمام جديدة لحلقتك بانتظار المراجعة.`
    ],
    parent: [
      `أهلاً بك يا أبا/أم ${name}. لقد أتم ابنك "ياسين" حفظ الصفحة العاشرة بتقدير ممتاز اليوم!`,
      `مرحباً بك! أرسل معلم الطالب "ياسين" ملاحظة جديدة بخصوص مخارج الحروف، يرجى الاطلاع عليها.`,
      `أهلاً بك! هناك موعد لاجتماع أولياء الأمور القادم تم تحديده يوم الخميس القادم.`
    ]
  };

  const roleSummaries = summaries[role] || [`أهلاً بك يا ${name} في منصة ثمار.`];
  const randomSummary = roleSummaries[Math.floor(Math.random() * roleSummaries.length)];

  return {
    greeting: `السلام عليكم ورحمة الله وبركاته، ${name}`,
    summary: randomSummary,
    timestamp: new Date().toISOString()
  };
}
