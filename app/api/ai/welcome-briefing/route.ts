import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini-server";

export async function POST(req: NextRequest) {
  try {
    const { role = 'student', userName = 'المستخدم' } = await req.json();

    const roleNameArabic = 
      role === 'admin' ? 'المسؤول العام' :
      role === 'teacher' ? 'المعلم' :
      role === 'parent' ? 'ولي الأمر' : 'الطالب';

    // If Gemini is available, try generating dynamic smart summary
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `أنت الذكاء الاصطناعي لمنصة 'ثمار' القرآنية التعليمية.
قم بإعداد موجز ذكي ومختصر ودافئ باللغة العربية يرحب بـ (${userName}) بصفته (${roleNameArabic})،
ويخبره بما حدث في غيابه على المنصة بدقة وواقعية تعليمية وإسلامية راقية (بين 2 إلى 3 جمل مشوقة ومفيدة).
اكتب رداً بصيغة JSON فقط بالتنسيق التالي:
{
  "greeting": "السلام عليكم ورحمة الله وبركاته، [الاسم]",
  "summary": "ملخص ما حدث في غيابك...",
  "keyPoints": [
    {"label": "عنوان النقطة 1", "value": "القيمة", "type": "success"},
    {"label": "عنوان النقطة 2", "value": "القيمة", "type": "info"},
    {"label": "عنوان النقطة 3", "value": "القيمة", "type": "warning"}
  ],
  "actionRequired": "الإجراء المقترح التالي"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            ...parsed,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn("[Gemini Welcome Briefing Fallback]:", err.message);
      }
    }

    // Role-specific intelligent briefings fallback
    const roleData: Record<string, {
      greeting: string;
      summaries: string[];
      keyPoints: Array<{ label: string; value: string | number; type: 'info' | 'success' | 'warning' }>;
      actionRequired: string;
    }> = {
      admin: {
        greeting: `السلام عليكم ورحمة الله وبركاته، أهلاً بك يا ${userName}`,
        summaries: [
          `أثناء غيابك: استقبلت المنصة ٤ طلبات انضمام جديدة لمعلمين وطلاب، وتم إنجاز ٢٦ جلسة تسميع مباشرة، مع تسجيل حالة اشتباه واحدة خلال اختبار التجويد الآلي بانتظار مراجعتك.`,
          `مرحباً بعودتك! اكتمل تقرير الحضور والغياب الأسبوعي بنسبة التزام بلغت ٩٤٪، وتم تسوية جميع تذاكر الدعم الفني الواردة عبر واتساب وجوجل بنجاح.`,
          `يوم مبارك يا ${userName}. قام المعلمون برصد ١٥ تقييماً جديداً، وازداد عدد الكلمات المسموعة بنسبة ١٨٪ اليوم، ولا توجد أي انقطاعات بالنظام.`
        ],
        keyPoints: [
          { label: 'طلبات جديدة', value: '٤ معلقة', type: 'warning' },
          { label: 'جلسات أنجزت', value: '٢٦ جلسة', type: 'success' },
          { label: 'نسبة الالتزام', value: '٩٤٪', type: 'info' }
        ],
        actionRequired: 'مراجعة طلبات الانضمام الجديدة وتأكيد حسابات المعلمين'
      },
      teacher: {
        greeting: `السلام عليكم ورحمة الله وبركاته، أهلاً بك يا أستاذ ${userName}`,
        summaries: [
          `أثناء غيابك: أتم ٦ طلاب تسميع ورد سورة النور وبانتظار اعتماد درجاتهم، ووردتك رسالة استفسار من ولي أمر الطالب ياسين بشأن موعد حلقة التجويد القادمة.`,
          `مرحباً بك يا شيخنا الفاضل. سجّل طلابك اليوم معدل حفظ متميزاً، حيث أتم عمر ومحمد حفظ الجزء المقرر، وتم تحديث التنبؤ الذكي بموعد الختم لطلاب حلقتك.`,
          `حياك الله أستاذ ${userName}. تم تصحيح ١٢ مقطعاً صوتياً آلياً عبر المصحح الذكي، وهي الآن جاهزة لاعتماد ملاحظاتك النهائية وتوجيهاتك للطلاب.`
        ],
        keyPoints: [
          { label: 'تسميعات بانتظارك', value: '٦ طلاب', type: 'warning' },
          { label: 'أتموا الورد', value: '٨ طلاب', type: 'success' },
          { label: 'رسائل أولياء الأمور', value: 'رسالتان', type: 'info' }
        ],
        actionRequired: 'تقييم تسجيلات سورة النور واعتماد الأوسمة للطلاب الملتزمين'
      },
      student: {
        greeting: `السلام عليكم ورحمة الله وبركاته، أهلاً بالبطل ${userName}`,
        summaries: [
          `أثناء غيابك: قام معلمك بالاستماع لتلاوتك لسورة مريم ومنحك تقييم ٩٦٪ مع وسام "عذب الصوت"! وبانتظارك ورد مراجعة الجزء الأول قبل الساعة ٨:٠٠ م.`,
          `مرحباً بك يا ${userName}! حافظت على سلسلة التزامك لـ ٧ أيام متتالية، وأضاف لك المعلم ٣ أسئلة تدريبية جديدة في أحكام النون الساكنة والتنوين.`,
          `أهلاً بعودتك يا متفوق ثمار! زادت نقاطك في لوحة الشرف بمقدار ٥٠ نقطة بعد مراجعة الورد الأخير، وزملاؤك في الحلقة يواصلون التقدم.`
        ],
        keyPoints: [
          { label: 'تقييم المعلم الأخير', value: '٩٦٪ ممتاز', type: 'success' },
          { label: 'سلسلة الالتزام', value: '٧ أيام', type: 'info' },
          { label: 'الورد اليومي', value: 'صفحتان', type: 'warning' }
        ],
        actionRequired: 'البدء في تلاوة الورد اليومي وتسجيل المقطع الصوتي'
      },
      parent: {
        greeting: `السلام عليكم ورحمة الله وبركاته، أهلاً بك يا ${userName}`,
        summaries: [
          `أثناء غيابك: أتم ابنك "ياسين" ورد الحفظ اليومي بامتياز وحصل على ٩٥٪ في مخرج حرف الضاد، كما حضر حلقة التجويد التفاعلية في موعدها بالكامل.`,
          `مرحباً بك! أرسل الشيخ أحمد تقريراً أسبوعياً يثني فيه على التزام ابنك، مع توصية بزيادة دقائق الاستماع للشيخ الحصري لتحسين النطق.`,
          `أهلاً بك يا فاضل. ارتفعت نسبة حضور أبنائك هذا الشهر إلى ٩٨٪، وتم تحديث لوحة المتابعة بدرجات الاختبار التحريري الأخير.`
        ],
        keyPoints: [
          { label: 'إنجاز الأبناء اليوم', value: 'تم الورد', type: 'success' },
          { label: 'تقييم المعلم', value: 'ممتاز', type: 'info' },
          { label: 'نسبة الحضور', value: '٩٨٪', type: 'success' }
        ],
        actionRequired: 'الاطلاع على تقرير التجويد الأسبوعي ومشاركة كلمة تشجيع لابنك'
      }
    };

    const currentRoleData = roleData[role] || roleData.student;
    const randomSummary = currentRoleData.summaries[Math.floor(Math.random() * currentRoleData.summaries.length)];

    return NextResponse.json({
      greeting: currentRoleData.greeting,
      summary: randomSummary,
      keyPoints: currentRoleData.keyPoints,
      actionRequired: currentRoleData.actionRequired,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("[Welcome Briefing Error]", error);
    return NextResponse.json({
      greeting: "السلام عليكم ورحمة الله وبركاته",
      summary: "أهلاً بك في منصة ثمار. نتمنى لك رحلة قرآنية مباركة وموفقة اليوم.",
      keyPoints: [
        { label: 'الحالة', value: 'متصل', type: 'success' }
      ],
      actionRequired: 'متابعة المهام اليومية',
      timestamp: new Date().toISOString(),
    });
  }
}
