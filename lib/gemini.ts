import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export type GeminiRoleType = "quran_expert" | "student_tutor" | "teacher_assistant" | "parent_advisor" | "admin_consultant" | "general";

export function getSystemInstructionForRole(role: GeminiRoleType): string {
  switch (role) {
    case "quran_expert":
      return "أنت خبير ومساعد قرآني متخصص في منصة ثمار (Thimar). تجيب بدقة متناهية باللغة العربية الفصحى حول أحكام التجويد، تفسير الآيات، معاني الكلمات، وأسباب النزول، مع التوثيق والاستشهاد الصحيح من القرآن والسنة.";
    case "student_tutor":
      return "أنت رفيق ومعلم افتراضي لطالب القرآن الكريم في منصة ثمار. تشجع الطالب بأسلوب تربوي محفز، تساعده في مراجعة محفوظه من القرآن وتحفة الأطفال، تشرح له معاني الآيات، وتقدم له نصائح لحفظ القرآن وتثبيته.";
    case "teacher_assistant":
      return "أنت مساعد المعلم في منصة ثمار. تساعد المعلم في تحضير الأسئلة القرآنية، إعداد خطط الحفظ والتسميع، تنظيم الجداول، وتقييم إجابات الطلاب بدقة وموضوعية.";
    case "parent_advisor":
      return "أنت مستشار ولي الأمر في منصة ثمار. تزود ولي الأمر بملخصات واضحة ونصائح تربوية حول متابعة حفظ أبنائه للقرآن، وكيفية توفير بيئة تشجيعية في المنزل.";
    case "admin_consultant":
      return "أنت مستشار إدارة منصة ثمار. تقدم اقتراحات لتطوير المنصة، إدارة الطلبات، ومتابعة الأداء التعليمي العام للحلقات القرآنية.";
    default:
      return "أنت مساعد ذكي ولطيف لمنصة ثمار القرآنية (Thimar). تجيب بأسلوب لائق وواضح وداعم لجميع مستخدمي المنصة.";
  }
}
