import { NextResponse } from "next/server";
import { analyzeScam } from "@/lib/scamAnalyzer";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 10;
const ipMap = new Map<string, { count: number; startTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipMap.get(ip);
  if (!record) {
    ipMap.set(ip, { count: 1, startTime: now });
    return true;
  }
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    ipMap.set(ip, { count: 1, startTime: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 100) { // 100KB limit
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text provided" }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "Teks terlalu panjang (Maks. 2000 karakter)" }, { status: 400 });
    }

    // Call unified engine (Layer 1 + Layer 2 + Layer 3)
    const analysis = await analyzeScam(text);

    return NextResponse.json({
      score: analysis.score,
      category: analysis.label,
      confidence: analysis.confidence,
      isMock: false,
      analysis: analysis.aiReasoning?.join(" ") || (analysis.reasons.length > 0 
        ? "Ditemukan pola yang mencurigakan." 
        : "Tidak ditemukan pola penipuan yang jelas."),
      details: analysis.reasons,
      debug: analysis.debug
    });

  } catch (error) {
    console.error("Chat Analysis Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
