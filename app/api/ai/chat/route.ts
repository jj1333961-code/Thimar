import { NextRequest, NextResponse } from "next/server";
import { ai, SYSTEM_INSTRUCTIONS } from "@/lib/gemini-server";
import { verifyAuth } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const { user } = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, history = [], role = 'student' } = await req.json();

    const systemInstruction = role === 'teacher' ? SYSTEM_INSTRUCTIONS.TEACHER : 
                           role === 'parent' ? SYSTEM_INSTRUCTIONS.PARENT : 
                           SYSTEM_INSTRUCTIONS.STUDENT;

    // Determine model based on task complexity (simplified for now)
    const model = history.length > 5 ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';

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

    return NextResponse.json({ 
      text: responseText,
      role: 'ai'
    });
  } catch (error: any) {
    console.error("[Gemini Chat Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
