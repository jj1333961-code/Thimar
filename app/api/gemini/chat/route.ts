import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, getSystemInstructionForRole, GeminiRoleType } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 120;

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      message = "",
      role = "general",
      model = "gemini-3.5-flash",
      useGoogleSearch = false,
      systemInstruction = "",
    } = body;

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    const ai = getGeminiClient();

    // Map model
    let selectedModel = model || "gemini-3.5-flash";
    if (selectedModel.includes("1.5") || selectedModel.includes("2.0")) {
      selectedModel = "gemini-3.5-flash";
    }

    // Prepare contents history
    const contents = [];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (msg && msg.text) {
          contents.push({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: String(msg.text) }],
          });
        }
      }
    }

    if (message && message.trim()) {
      contents.push({
        role: "user",
        parts: [{ text: String(message.trim()) }],
      });
    }

    if (contents.length === 0) {
      return NextResponse.json(
        { error: "No messages provided for generation." },
        { status: 400 }
      );
    }

    const finalSystemInstruction =
      systemInstruction || getSystemInstructionForRole(role as GeminiRoleType);

    // Build configuration
    const config: Record<string, unknown> = {
      systemInstruction: finalSystemInstruction,
    };

    // Add Google Search grounding tool if requested
    if (useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
      // Google search works best on gemini-3.5-flash
      if (!selectedModel.includes("pro")) {
        selectedModel = "gemini-3.5-flash";
      }
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const responseText = response.text || "";

    // Extract search grounding metadata if present
    const groundingMetadata =
      response.candidates?.[0]?.groundingMetadata || null;

    return NextResponse.json({
      success: true,
      text: responseText,
      model: selectedModel,
      groundingMetadata,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err || "Unknown error");
    console.error("[GEMINI_CHAT_ERROR]", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
