import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const wss = new WebSocketServer({ noServer: true });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  wss.on('connection', async (clientWs) => {
    console.log('[Live API] Client connected');
    
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "أنت مساعد ذكي لمنصة ثمار القرآنية. ساعد الطالب في تصحيح تلاوته وتجويده فوراً. تحدث بلهجة مشجعة ومهذبة باللغة العربية.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            // Handle transcriptions
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              clientWs.send(JSON.stringify({ text: message.serverContent.modelTurn.parts[0].text }));
            }
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
          if (msg.text) {
            session.sendRealtimeInput({ text: msg.text });
          }
        } catch (e) {
          console.error('[Live API] Error parsing message:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live API] Client disconnected');
        // session.close(); // Close session if supported or needed
      });
    } catch (error) {
      console.error('[Live API] Connection error:', error);
      clientWs.close();
    }
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url || '');

    if (pathname === '/api/ai/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Regular Next.js handling
  expressApp.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
