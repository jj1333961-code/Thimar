/**
 * Mock AI service to generate personalized greetings and context summaries.
 * In a real app, this would call the Gemini API via /api/ai/generate.
 */
export interface WelcomeBriefingData {
  greeting: string;
  summary: string;
  keyPoints?: Array<{ label: string; value: string | number; type: 'info' | 'success' | 'warning' }>;
  actionRequired?: string;
  timestamp: string;
}

export async function generateWelcomeSummary(
  role: 'admin' | 'teacher' | 'student' | 'parent', 
  name: string
): Promise<WelcomeBriefingData> {
  try {
    const res = await fetch('/api/ai/welcome-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userName: name })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.warn('[WelcomeSummary API fetch error, using local generator]', error);
  }

  // Fallback data
  const summaries: Record<string, string[]> = {
    admin: [
      `أثناء غيابك: استقبلت المنصة ٤ طلبات انضمام جديدة لمعلمين وطلاب، وتم إنجاز ٢٦ جلسة تسميع مباشرة، مع تسجيل حالة اشتباه واحدة خلال اختبار التجويد الآلي بانتظار مراجعتك.`,
      `مرحباً بعودتك! اكتمل تقرير الحضور والغياب الأسبوعي بنسبة التزام بلغت ٩٤٪، وتم تسوية جميع تذاكر الدعم الفني الواردة عبر واتساب وجوجل بنجاح.`,
      `يوم مبارك يا ${name}. قام المعلمون برصد ١٥ تقييماً جديداً، وازداد عدد الكلمات المسموعة بنسبة ١٨٪ اليوم، ولا توجد أي انقطاعات بالنظام.`
    ],
    teacher: [
      `أهلاً بك يا أستاذ ${name}. أثناء غيابك سلّم ٦ طلاب تسميع ورد سورة النور وبانتظار اعتماد درجاتهم، ووردتك رسالة استفسار من ولي أمر الطالب ياسين.`,
      `مرحباً بك يا شيخنا الفاضل. سجّل طلابك اليوم معدل حفظ متميزاً، وتم تصحيح ١٢ مقطعاً صوتياً آلياً عبر المصحح الذكي بانتظار توجيهاتك.`,
      `يومك مبارك يا ${name}. لديك ٣ طلبات انضمام جديدة لحلقتك بانتظار المراجعة والبدء في التسميع.`
    ],
    student: [
      `أهلاً بك يا ${name}! أثناء غيابك قام معلمك بالاستماع لتلاوتك لسورة مريم ومنحك تقييم ٩٦٪ مع وسام "عذب الصوت"! وبانتظارك ورد مراجعة الجزء الأول.`,
      `مرحباً ${name}! لقد حافظت على سلسلة التزامك لـ ٧ أيام متتالية، وأضاف لك المعلم ٣ أسئلة تدريبية جديدة في أحكام النون الساكنة والتنوين.`,
      `أهلاً بطل المتفوق ${name}! زادت نقاطك في لوحة الشرف بمقدار ٥٠ نقطة بعد مراجعة الورد الأخير.`
    ],
    parent: [
      `أهلاً بك يا ${name}. أثناء غيابك أتم ابنك "ياسين" ورد الحفظ اليومي بامتياز وحصل على ٩٥٪ في مخرج حرف الضاد، وحضر حلقة التجويد كاملة.`,
      `مرحباً بك! أرسل الشيخ أحمد تقريراً أسبوعياً يثني فيه على التزام ابنك، مع توصية بزيادة دقائق الاستماع للشيخ الحصري.`,
      `أهلاً بك! ارتفعت نسبة حضور أبنائك هذا الشهر إلى ٩٨٪، وتم تحديث لوحة المتابعة بدرجات الاختبار التحريري الأخير.`
    ]
  };

  const roleSummaries = summaries[role] || [`أهلاً بك يا ${name} في منصة ثمار القرآنية التعليمية.`];
  const randomSummary = roleSummaries[Math.floor(Math.random() * roleSummaries.length)];

  return {
    greeting: `السلام عليكم ورحمة الله وبركاته، ${name}`,
    summary: randomSummary,
    keyPoints: [
      { label: 'الذكاء الاصطناعي', value: 'نشط', type: 'info' },
      { label: 'الحالة', value: 'محدث', type: 'success' }
    ],
    actionRequired: 'متابعة المهام المقررة اليوم',
    timestamp: new Date().toISOString()
  };
}
