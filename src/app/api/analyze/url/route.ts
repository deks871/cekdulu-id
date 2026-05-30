import { NextRequest, NextResponse } from "next/server";
import { checkDomainAge } from "@/lib/domainAge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  score: number;
  label: string;
  details: string[];
  source?: string;
}

// ─── Known shortlink domains ──────────────────────────────────────────────────

const SHORTLINK_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "short.io",
  "tiny.cc",
  "rb.gy",
  "cutt.ly",
  "shorturl.at",
  "s.id",           // common in Indonesia
  "link.id",
  "lynk.id",
]);

function isShortlink(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const apex = hostname.replace(/^www\./, "");
    return SHORTLINK_DOMAINS.has(apex);
  } catch {
    return false;
  }
}

// ─── Redirect resolver (bonus) ────────────────────────────────────────────────

async function resolveRedirect(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // After following redirects, `res.url` is the final destination
    return res.url && res.url !== url ? res.url : url;
  } catch {
    // Network error or timeout — return original
    return url;
  }
}

// ─── Google Safe Browsing ─────────────────────────────────────────────────────

async function checkGoogleSafeBrowsing(url: string): Promise<boolean | null> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) return null; // no key → signal fallback

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const body = {
    client: { clientId: "cekdulu-id", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 8 s timeout via AbortController
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return null; // API error → fallback

    const data = await res.json();
    // { matches: [...] } if flagged, {} if clean
    return Array.isArray(data.matches) && data.matches.length > 0;
  } catch {
    return null; // network/timeout → fallback
  }
}

// ─── Heuristic engine (unchanged, kept as fallback) ──────────────────────────

function analyzeUrlHeuristic(url: string): AnalysisResult {
  const details: string[] = [];
  let score = 0;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const fullUrl = url.toLowerCase();

    // Typosquatting normalization
    const normalizedHost = hostname
      .replace(/0/g, "o")
      .replace(/1/g, "l")
      .replace(/3/g, "e")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/@/g, "a");

    // Popular brands
    const trustedBrands = [
      "google",
      "facebook",
      "paypal",
      "microsoft",
      "apple",
      "tokopedia",
      "shopee",
      "dana",
      "ovo",
      "gopay",
      "bca",
      "mandiri",
      "bni"
    ];

    // Detect typosquatting
    for (const brand of trustedBrands) {
      if (
        normalizedHost.includes(brand) &&
        !hostname.includes(brand)
      ) {
        score += 35;
        details.push(`Terdeteksi kemungkinan typosquatting brand: ${brand}`);
        break;
      }
    }

    // 1. IP address as host
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      score += 30;
      details.push("Menggunakan alamat IP langsung (bukan domain)");
    }

    // 2. Suspicious TLDs
    const suspiciousTlds = [
      ".xyz", ".top", ".click", ".loan", ".work",
      ".gq", ".ml", ".cf", ".tk", ".ga",
    ];
    if (suspiciousTlds.some((t) => hostname.endsWith(t))) {
      score += 15;
      details.push("Menggunakan TLD yang sering dipakai penipu");
    }

    // 3. Phishing keywords in URL
    const phishingKeywords = [
      "login", "signin", "verify", "account", "secure", "update",
      "banking", "paypal", "password", "confirm", "wallet",
      "transfer", "hadiah", "bonus", "menang", "gratis", "promo",
      "pulsa", "dana", "ovo", "gopay", "bca", "mandiri", "bni",
    ];
    const matchedKeywords = phishingKeywords.filter((kw) =>
      fullUrl.includes(kw)
    );
    if (matchedKeywords.length > 0) {
      score += Math.min(matchedKeywords.length * 5, 15);
      details.push(
        `Mengandung kata kunci mencurigakan: ${matchedKeywords.slice(0, 3).join(", ")}`
      );
    }

    // 4. Excessive subdomains
    const isIpAddress =
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

    const subdomainCount = hostname.split(".").length - 2;

    if (subdomainCount >= 4) {
      score += 10;
      details.push("Memiliki terlalu banyak subdomain");
    }

    // 5. Long URL
    if (url.length > 100) {
      score += 5;
      details.push("URL sangat panjang");
    }

    // 6. No HTTPS
    if (parsed.protocol !== "https:") {
      score += 15;
      details.push("Tidak menggunakan HTTPS");
    }

    // 7. Hyphens in domain (common in typosquatting)
    const domainParts = hostname.split(".");
    const hasHyphens = domainParts.some((p) => p.includes("-"));
    if (hasHyphens) {
      score += 10;
      details.push("Domain menggunakan tanda hubung (typosquatting)");
    }

    // 8. Numeric sequences
    if (/\d{4,}/.test(hostname)) {
      score += 5;
      details.push("Domain mengandung angka panjang");
    }

    if (details.length === 0) {
      details.push("Tidak ditemukan pola mencurigakan dari analisis heuristik");
    }
  } catch {
    score = 50;
    details.push("URL tidak valid atau tidak dapat diurai");
  }

  score = Math.min(score, 94); // cap below GSB range

  let label: string;
  if (score >= 75) label = "KEMUNGKINAN PENIPUAN";
  else if (score >= 50) label = "RISIKO TINGGI";
  else if (score >= 25) label = "PERLU DIWASPADAI";
  else label = "RELATIF AMAN";

  return { score, label, details, source: "heuristic" };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = (body.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "URL tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Normalise: prepend https:// if no protocol supplied
    const urlToCheck =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

    // ── Bonus: resolve shortlinks before checking ──────────────────────────
    let resolvedUrl = urlToCheck;
    let wasShortlink = false;

    if (isShortlink(urlToCheck)) {
      wasShortlink = true;
      resolvedUrl = await resolveRedirect(urlToCheck);
    }

    // ── 1. Try Google Safe Browsing on resolved URL ────────────────────────
    const gsbFlagged = await checkGoogleSafeBrowsing(resolvedUrl);

    if (gsbFlagged === true) {
      // Google confirmed threat → immediate high-risk classification
      const score = Math.floor(Math.random() * 6) + 95; // 95–100
      const details = [
        "⚠️ URL ini terdeteksi berbahaya oleh Google Safe Browsing",
        "Terdaftar sebagai situs phishing, malware, atau penipuan",
      ];
      if (wasShortlink) {
        details.unshift(
          `🔗 Shortlink mengarah ke: ${resolvedUrl}`
        );
      }
      return NextResponse.json({
        score,
        label: "PENIPUAN SANGAT MUNGKIN",
        details,
        source: "google_safe_browsing",
        resolvedUrl: wasShortlink ? resolvedUrl : undefined,
      });
    }

    // ── 2. GSB returned null (no key / API error) → heuristic fallback ─────
    // ── 3. GSB returned false (clean) → still run heuristic for detail ──────
    const heuristic = analyzeUrlHeuristic(resolvedUrl);
    // Domain Age Detection
    try {
      const domainAge = await checkDomainAge(resolvedUrl);

      if (domainAge.riskScore > 0) {
        heuristic.score += domainAge.riskScore;
        heuristic.details.push(domainAge.reason);
      } else {
        heuristic.details.push(`✅ ${domainAge.reason}`);
      }

      heuristic.score = Math.min(100, heuristic.score);
    } catch (error) {
      console.error("Domain age check failed:", error);
    }


    // If GSB confirmed clean but heuristic also clean, trust both
    const result: AnalysisResult = { ...heuristic };

    if (wasShortlink) {
      result.details.unshift(`🔗 Shortlink mengarah ke: ${resolvedUrl}`);
    }

    if (gsbFlagged === false) {
      // GSB ran but found nothing — note it
      result.details.push("✅ Tidak ditemukan ancaman di Google Safe Browsing");
      result.source = "heuristic+google_safe_browsing";
    }

    return NextResponse.json({
      ...result,
      resolvedUrl: wasShortlink ? resolvedUrl : undefined,
    });
  } catch (err) {
    console.error("[analyze/route] unhandled error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}