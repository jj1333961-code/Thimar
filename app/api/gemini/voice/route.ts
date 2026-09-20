import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, mimeType = "audio/webm", prompt = "استمع لتلاوة الطالب أو كلامه وقدم تقييماً فورياً ونصائح للتجويد ومخارج الحروف:" } = body;

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    if (!audioBase64) {
      return NextResponse.json(
        { error: "Audio data is required." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: audioBase64.replace(/^data:[^;]+;base64,/, ""),
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "أنت مصحح ومقيم قرآني متقن في منصة ثمار. تستمع للتلاوة الصوتية وتحدد مواضع الخطأ وأحكام التجويد بدقة متناهية.",
      },
    });

    return NextResponse.json({
      success: true,
      text: response.text || "",
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err || "Unknown error");
    console.error("[GEMINI_VOICE_ERROR]", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
