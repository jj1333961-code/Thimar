import { NextRequest, NextResponse } from "next/server";
import { ai, SYSTEM_INSTRUCTIONS } from "@/lib/gemini-server";
import { verifyAuth } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], role = 'student' } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemInstruction = 
      role === 'admin' ? SYSTEM_INSTRUCTIONS.ADMIN :
      role === 'teacher' ? SYSTEM_INSTRUCTIONS.TEACHER : 
      role === 'parent' ? SYSTEM_INSTRUCTIONS.PARENT : 
      role === 'guest' ? SYSTEM_INSTRUCTIONS.GUEST :
      SYSTEM_INSTRUCTIONS.STUDENT;

    // Determine model
    const model = 'gemini-2.5-flash';

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            ...history.map((h: any) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: systemInstruction,
          }
        });

        const responseText = response.text || "";
        if (responseText) {
          return NextResponse.json({ 
            text: responseText,
            role: 'ai'
          });
        }
      } catch (geminiError: any) {
        console.warn("[Gemini API Fallback triggered]:", geminiError.message);
      }
    }

    // Intelligent context-aware offline fallback for smooth responsiveness
    let fallbackReply = "أهلاً بك في منصة ثمار القرآنية التعليمية. نسعد بخدمتك، تفضل بسؤالك حول التسجيل، حلقات التحفيظ، أو التجويد.";
    const lower = message.toLowerCase();

    if (lower.includes("تسجيل") || lower.includes("حساب") || lower.includes("انضمام") || lower.includes("جديد")) {
      fallbackReply = "مرحباً بك! يمكنك إنشاء حساب جديد بالضغط على زر 'إنشاء حساب جديد' واختيار صفتك (طالب، معلم، أو ولي أمر). بعد التسجيل يتم اعتماد الحساب سريعاً من قبل الإدارة لضمان بيئة تعليمية موثوقة ومتميزة.";
    } else if (lower.includes("مسؤول") || lower.includes("ادارة") || lower.includes("إدارة") || lower.includes("تواصل") || lower.includes("واتس")) {
      fallbackReply = "يمكنك التواصل المباشر مع إدارة منصة ثمار عبر الضغط على تبويب 'التواصل مع المسؤولين' في هذه النافذة، أو المراسلة الفورية عبر الواتساب على مدار الساعة.";
    } else if (lower.includes("حفظ") || lower.includes("تسميع") || lower.includes("مصحف") || lower.includes("ورد")) {
      fallbackReply = "توفر منصة ثمار نظام الورد اليومي التفاعلي والمصحف الشريف الرقمي مع جلسات التسميع المباشرة والمصحح الذكي لمخارج الحروف وأحكام التجويد.";
    } else if (lower.includes("معلم") || lower.includes("شيخ") || lower.includes("استاذ")) {
      fallbackReply = "تضم منصة ثمار نخبة من المعلمين والمعلمات المجازين بالقراءات العشر، ويتم توزيع الطلاب في حلقات فردية وجماعية تراعي المستويات والأوقات المناسبة.";
    }

    return NextResponse.json({ 
      text: fallbackReply,
      role: 'ai'
    });
  } catch (error: any) {
    console.error("[Chat Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
