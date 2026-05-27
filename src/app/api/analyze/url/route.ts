import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
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

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  return normalized;
}

export async function POST(req: Request) {
  try {
    // 1. Abuse Protection: Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Abuse Protection: Body Size Limit
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 50) { // 50KB limit
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    // 3. Normalization
    const targetUrl = normalizeUrl(url);
    let domain = "";
    try {
      const parsedUrl = new URL(targetUrl);
      domain = parsedUrl.hostname;
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // 4. Timeout wrapper
    const fetchWithTimeout = async (promise: Promise<any>, ms = 8000) => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
      return Promise.race([promise, timeout]);
    };

    // RDAP domain lookup for age (Heuristic)
    let domainAgeScore = 20; // default moderate risk
    let isMock = true;

    try {
      // Attempt real RDAP
      const rdapResponse = await fetchWithTimeout(fetch(`https://rdap.verisign.com/com/v1/domain/${domain}`)) as Response;
      if (rdapResponse.ok) {
        const rdapData = await rdapResponse.json();
        // Just checking if we got valid RDAP data for demonstration
        if (rdapData && rdapData.events) {
          const regEvent = rdapData.events.find((e: any) => e.eventAction === "registration");
          if (regEvent && regEvent.eventDate) {
            const regDate = new Date(regEvent.eventDate);
            const ageInYears = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (ageInYears < 1) domainAgeScore = 80; // newly registered = high risk
            else if (ageInYears < 3) domainAgeScore = 40;
            else domainAgeScore = 5; // old domain = low risk
            isMock = false;
          }
        }
      }
    } catch (e) {
      console.error("RDAP lookup failed or timed out", e);
      isMock = true;
    }

    // Advanced URL Heuristics
    let heuristicScore = 0;
    const lowerUrl = targetUrl.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // 1. Trusted Domain Whitelist
    const trustedDomains = [
      "google.com",
"accounts.google.com",
"share.google",
"forms.gle",
"goo.gl",
"maps.app.goo.gl",

"microsoft.com",
"login.microsoftonline.com",
"aka.ms",

"apple.com",
"icloud.com",

"github.com",
"githubusercontent.com",

"whatsapp.com",
"web.whatsapp.com",
"wa.me",

"telegram.org",
"t.me",

"discord.com",
"discord.gg",

"facebook.com",
"fb.com",
"instagram.com",
"messenger.com",

"x.com",
"twitter.com",

"linkedin.com",

"youtube.com",
"youtu.be",

"openai.com",
"chatgpt.com",

"tokopedia.com",
"shopee.co.id",
"lazada.co.id",
"blibli.com",

"bca.co.id",
"klikbca.com",
"mybca.co.id",

"bri.co.id",
"ib.bri.co.id",

"bni.co.id",

"bankmandiri.co.id",
"livin.co.id",

"cimbniaga.co.id",

"dana.id",
"ovo.id",
"gopay.co.id",
"linkaja.id",

"paypal.com",
    ];
    // Secure suffix matching for trusted domains
    const isTrusted = trustedDomains.some(td => lowerDomain === td || lowerDomain.endsWith("." + td));

    // 1b. Shortlink Detection
    const shortlinks = ["bit.ly", "tinyurl.com", "t.co", "shorturl.at", "rb.gy"];
    const isShortlink = shortlinks.some(sl => lowerDomain === sl || lowerDomain.endsWith("." + sl));

    // 2. Brand impersonation (25 pts)
    const brands = ["bca", "bri", "bni", "mandiri", "dana", "ovo", "gopay", "linkaja", "tokopedia", "shopee", "lazada", "whatsapp", "telegram", "google", "paypal", "facebook", "apple", "microsoft"];
    // ONLY trigger brand impersonation if it's NOT a trusted official domain
    const hasBrand = !isTrusted && !isShortlink && brands.some(b => lowerDomain.includes(b));
    if (hasBrand) heuristicScore += 25;

    // 3. Suspicious auth keywords (20 pts)
    const authKeywords = ["login", "verify", "verification", "verifikasi", "akun", "account", "secure", "security", "update", "reset", "password", "otp"];
    const hasAuth = authKeywords.some(k => lowerUrl.includes(k));
    if (hasAuth) heuristicScore += 20;

    // 4. Scam bait keywords (20 pts)
    const baitKeywords = ["hadiah", "bonus", "free", "reward", "promo", "giveaway", "menang", "prize"];
    const hasBait = baitKeywords.some(k => lowerUrl.includes(k));
    if (hasBait) heuristicScore += 20;

    // 5. Risky TLDs (15 pts)
    const riskyTlds = [".xyz", ".top", ".click", ".live", ".site", ".monster", ".shop"];
    const hasRiskyTld = riskyTlds.some(t => lowerDomain.endsWith(t));
    if (hasRiskyTld) heuristicScore += 15;

    // 6. Excessive hyphens (10 pts)
    const hyphenCount = (lowerDomain.match(/-/g) || []).length;
    if (hyphenCount >= 3) heuristicScore += 10;

    // 7. HTTP vs HTTPS (15 pts)
    const isHttps = lowerUrl.startsWith("https://");
    if (!isHttps) heuristicScore += 15;

    // 8. Punycode / IDN lookalikes (10 pts)
    if (lowerDomain.startsWith("xn--")) heuristicScore += 10;

    // Final Score Calculation (weighted)
    let finalScore = (isMock ? 10 : domainAgeScore) + heuristicScore;
    let explanation = `Domain ${domain} dianalisis. `;
    
    if (isTrusted && !isShortlink) {
      finalScore = isHttps ? 5 : 20; // Override for known trusted domains
      explanation = `Domain ${domain} dikenali sebagai domain resmi yang terpercaya. Aman untuk digunakan.`;
    } else if (isShortlink) {
      finalScore = 50; // Force CURIGA
      explanation = "Tautan pendek (shortlink) menyembunyikan tujuan akhir. Harap berhati-hati karena sering digunakan untuk menutupi URL berbahaya.";
    } else {
      // Sharp increase if multiple strong indicators exist
      if (hasBrand && (hasAuth || hasBait)) {
        finalScore += 40; // Highly likely a phishing site
        finalScore = Math.max(finalScore, 85); // Guarantee HIGH RISK
      }
      if (hasBrand && hasRiskyTld) {
        finalScore += 35;
        finalScore = Math.max(finalScore, 85); // Guarantee HIGH RISK
      }
      if (hasAuth && hasRiskyTld) {
        finalScore += 20;
      }

      // Cap score at 100
      finalScore = Math.min(100, Math.max(0, finalScore));

      if (finalScore <= 30) explanation += "Terlihat seperti tautan standar tanpa indikator penipuan yang jelas.";
      else if (finalScore <= 60) explanation += "Tautan ini memiliki beberapa elemen mencurigakan. Harap berhati-hati sebelum memasukkan data pribadi.";
      else explanation += "Tautan ini memiliki banyak karakteristik situs phishing/scam (seperti penyamaran merek, kata kunci hadiah/login, atau domain berisiko). JANGAN masukkan informasi apapun.";
    }

    return NextResponse.json({
      score: finalScore,
      domain,
      isMock,
      analysis: explanation
    });

  } catch (error) {
    console.error("URL Analysis Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
