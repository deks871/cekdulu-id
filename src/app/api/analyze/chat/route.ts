import { NextResponse } from "next/server";

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

    // Weighted Heuristic Setup (Mock Fallback)
    // We default to true since we don't have OpenAI key configured yet.
    const isMock = true;
    let score = 0;
    const lowerText = text.toLowerCase();
    // Heuristic 1: Urgency (20 pts)
    const urgencyWords = ["sekarang", "segera", "terbatas", "terakhir", "sebelum diblokir", "expire", "diblokir", "suspend", "dibekukan"];
    let urgencyCount = 0;
    urgencyWords.forEach(w => { if (lowerText.includes(w)) urgencyCount++; });
    if (urgencyCount > 0) score += Math.min(20, urgencyCount * 10);

    // Heuristic 2: Financial Bait (25 pts)
    const moneyWords = ["hadiah uang", "transfer", "cashback", "bonus", "promo", "menang", "selamat", "hadiah"];
    let moneyCount = 0;
    moneyWords.forEach(w => { if (lowerText.includes(w)) moneyCount++; });
    if (moneyCount > 0) score += Math.min(25, moneyCount * 12);

    // Heuristic 3: Credential Theft (30 pts)
    const credWords = ["login", "verifikasi akun", "otp", "password", "pin", "kode"];
    let credCount = 0;
    credWords.forEach(w => { if (lowerText.includes(w)) credCount++; });
    if (credCount > 0) score += Math.min(30, credCount * 15);

    // Heuristic 4: Authority Impersonation (20 pts)
    const authWords = ["bank", "customer service", "cs resmi", "admin", "kurir", "bea cukai", "pajak"];
    let authCount = 0;
    authWords.forEach(w => { if (lowerText.includes(w)) authCount++; });
    if (authCount > 0) score += Math.min(20, authCount * 10);

    // Heuristic 5: Danger Actions (30 pts)
    const dangerWords = ["klik link", "download apk", "install aplikasi", "scan qr", "buka tautan"];
    let dangerCount = 0;
    dangerWords.forEach(w => { if (lowerText.includes(w)) dangerCount++; });
    if (dangerCount > 0) score += Math.min(30, dangerCount * 15);

    // Sharp increase for dangerous combinations
    if (authCount > 0 && (credCount > 0 || dangerCount > 0)) {
      score += 40; // Extremely suspicious: Authority asking for credentials or action
    }
    if (moneyCount > 0 && dangerCount > 0) {
      score += 30; // Bait + Action = Phishing
    }
    if (urgencyCount > 0 && credCount > 0) {
      score += 30; // Urgency to steal creds
    }

    // Guarantee HIGH RISK for combination of all 4 types
    if (moneyCount > 0 && dangerCount > 0 && credCount > 0 && urgencyCount > 0) {
      score = Math.max(score, 85);
    }

    score = Math.min(100, Math.max(0, score));

    let category = "AMAN";
    let explanation = "Teks ini tidak menunjukkan pola penipuan yang umum.";
    
    if (score > 30 && score <= 60) {
      category = "CURIGA";
      explanation = "Terdapat indikasi bahasa promosi berlebihan atau mencurigakan, harap waspada.";
    } else if (score > 60 && score <= 80) {
      category = "RISIKO TINGGI";
      explanation = "Teks memiliki banyak ciri penipuan. Jangan mengklik link atau memberikan data sensitif.";
    } else if (score > 80) {
      category = "PENIPUAN SANGAT MUNGKIN";
      explanation = "Ini sangat mungkin sebuah penipuan (scam/phishing). JANGAN lakukan instruksi apapun dari pesan ini.";
    }

    // Delay for realism of mock
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      score: Math.min(100, score),
      category,
      isMock,
      analysis: explanation
    });

  } catch (error) {
    console.error("Chat Analysis Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
