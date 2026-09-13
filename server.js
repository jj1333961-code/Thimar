"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_express = __toESM(require("express"));
var import_http = require("http");
var import_url = require("url");
var import_next = __toESM(require("next"));
var import_ws = require("ws");
var import_genai = require("@google/genai");
const dev = process.env.NODE_ENV !== "production";
const app = (0, import_next.default)({ dev });
const handle = app.getRequestHandler();
const port = 3e3;
app.prepare().then(() => {
  const expressApp = (0, import_express.default)();
  const server = (0, import_http.createServer)(expressApp);
  const wss = new import_ws.WebSocketServer({ noServer: true });
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  wss.on("connection", async (clientWs) => {
    console.log("[Live API] Client connected");
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [import_genai.Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: "\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0644\u0645\u0646\u0635\u0629 \u062B\u0645\u0627\u0631 \u0627\u0644\u0642\u0631\u0622\u0646\u064A\u0629. \u0633\u0627\u0639\u062F \u0627\u0644\u0637\u0627\u0644\u0628 \u0641\u064A \u062A\u0635\u062D\u064A\u062D \u062A\u0644\u0627\u0648\u062A\u0647 \u0648\u062A\u062C\u0648\u064A\u062F\u0647 \u0641\u0648\u0631\u0627\u064B. \u062A\u062D\u062F\u062B \u0628\u0644\u0647\u062C\u0629 \u0645\u0634\u062C\u0639\u0629 \u0648\u0645\u0647\u0630\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629."
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              clientWs.send(JSON.stringify({ text: message.serverContent.modelTurn.parts[0].text }));
            }
          }
        }
      });
      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
            });
          }
          if (msg.text) {
            session.sendRealtimeInput({ text: msg.text });
          }
        } catch (e) {
          console.error("[Live API] Error parsing message:", e);
        }
      });
      clientWs.on("close", () => {
        console.log("[Live API] Client disconnected");
      });
    } catch (error) {
      console.error("[Live API] Connection error:", error);
      clientWs.close();
    }
  });
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = (0, import_url.parse)(request.url || "");
    if (pathname === "/api/ai/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  expressApp.all(/.*/, (req, res) => {
    const parsedUrl = (0, import_url.parse)(req.url, true);
    handle(req, res, parsedUrl);
  });
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
