import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback response when API key is not yet configured
      return NextResponse.json({
        reply: `مرحباً بك في منصة ثمار! ✨
أنا رفيقك الذكي لتعليم القرآن الكريم وأحكام التجويد ومتن تحفة الأطفال.
بخصوص استفسارك: "${message}"، نسعد بخدمتك ومساعدتك في حفظ ومراجعة كتاب الله عز وجل. للإجابة الحية بالذكاء الاصطناعي الكامل، يرجى تفعيل مفتاح GEMINI_API_KEY في إعدادات البيئة.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `أنت المساعد الذكي القرآني لمنصة "ثمار | منصة القرآن والتعليم".
أنت خبير في:
1. أحكام التجويد ومتن تحفة الأطفال للشيخ سليمان الجمزوري.
2. تفسير آيات القرآن الكريم وتدبرها وفق أصح التفاسير (تفسير ابن كثير، الميسر، السعدي).
3. خطط تحفيظ ومراجعة وتثبيت القرآن الكريم للطلاب بمختلف أعمارهم.
4. إجابة أسئلة الطلاب والمعلمين بأسلوب تربوي لطيف ومحفز وباللغة العربية الفصحى الجميلة الميسرة.
كن دائماً دقيقاً في الاستدلال بالآيات والأحاديث والقواعد التجويدية، وقصيراً وواضحاً ومفيداً.`;

    const contents = [
      { role: 'user', parts: [{ text: `${systemInstruction}\n\nالسؤال/الرسالة من المستخدم: ${message}` }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
    });

    const reply = response.text || 'عذراً، لم أتمكن من الحصول على إجابة حالياً، أعد المحاولة بعد قليل.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { 
        reply: 'مرحباً بك! يسعدني دائماً مساعدتك في أحكام التجويد ومراجعة الحفظ ومتن تحفة الأطفال وتفسير الآيات الكريمة.',
        error: error?.message || 'Server error'
      },
      { status: 200 }
    );
  }
}
