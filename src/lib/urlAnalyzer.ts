export interface UrlFeatures {
  protocol: string;
  domain: string;
  tld: string;
  urlLength: number;
  subdomainCount: number;
  isIpAddress: boolean;
  isGovernmentDomain: boolean;
  hasSuspiciousChars: boolean;
  isShortener: boolean;
}

export interface UrlAnalysisResult {
  score: number;
  riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
  reasons: string[];
  extractedFeatures: UrlFeatures;
}

const SHORTLINK_DOMAINS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly", "short.io",
  "tiny.cc", "rb.gy", "cutt.ly", "shorturl.at", "s.id", "link.id", "lynk.id",
]);

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".site", ".online", ".loan", ".work",
  ".gq", ".ml", ".cf", ".tk", ".ga", ".vip", ".pw", ".icu", ".cc"
];

const TRUSTED_BRANDS = [
  "google", "facebook", "paypal", "microsoft", "apple", "tokopedia",
  "shopee", "dana", "ovo", "gopay", "bca", "mandiri", "bni", "bri", "telkomsel", "indosat", "xl"
];

const FINANCIAL_SCAM_KEYWORDS = [
  "bantuan", "bansos", "prakerja", "pinjaman", "dana-kaget", "kompensasi", "subsidi", "uang"
];

const REWARD_SCAM_KEYWORDS = [
  "hadiah", "bonus", "menang", "gratis", "promo", "undian", "giveaway", "klaim", "claim", "reward"
];

const TRUSTED_DOMAINS = new Set([
  "google.com",
  "github.com",
  "microsoft.com",
  "apple.com",
  "tokopedia.com",
  "shopee.co.id",
  "dana.id",
  "ovo.id",
  "bca.co.id",
  "bni.co.id",
  "bankmandiri.co.id",
]);

export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  let score = 0;
  const reasons: string[] = [];

  let parsedUrl: URL;
  try {
    const urlToCheck = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
    parsedUrl = new URL(urlToCheck);
  } catch {
    return {
      score: 100,
      riskLevel: "Kritis",
      reasons: ["URL tidak valid atau tidak dapat diurai. Tautan ini kemungkinan besar rusak atau berbahaya."],
      extractedFeatures: {
        protocol: "", domain: "", tld: "", urlLength: rawUrl.length, subdomainCount: 0,
        isIpAddress: false, isGovernmentDomain: false, hasSuspiciousChars: false, isShortener: false
      }
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol.replace(":", "").toUpperCase();
  const fullUrl = rawUrl.toLowerCase();
  const urlLength = rawUrl.length;

  const parts = hostname.split(".");
  const tld = parts.length > 1 ? "." + parts[parts.length - 1] : "";
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  // Subtract 2 for domain.tld (e.g., example.com -> 0 subdomains)
  const subdomainCount = isIpAddress ? 0 : Math.max(0, parts.length - 2);
  const isGovernmentDomain = hostname.endsWith(".go.id") || hostname.endsWith(".gov");
  
  // Try to extract apex domain for shortener check
  const apexDomain = parts.length > 1 ? parts.slice(-2).join(".") : hostname;
  const isShortener = SHORTLINK_DOMAINS.has(apexDomain) || SHORTLINK_DOMAINS.has(hostname);
  
  // Detect multiple hyphens, underscores, or weird characters in domain
  const hasSuspiciousChars = /[-_]{2,}|[@\^]/.test(hostname);

  const features: UrlFeatures = {
    protocol,
    domain: hostname,
    tld,
    urlLength,
    subdomainCount,
    isIpAddress,
    isGovernmentDomain,
    hasSuspiciousChars,
    isShortener
  };

  // Immediate Trusted Domain Check
  if (TRUSTED_DOMAINS.has(hostname) || TRUSTED_DOMAINS.has(apexDomain)) {
    return {
      score: 0,
      riskLevel: "Rendah",
      reasons: ["Domain termasuk dalam daftar situs terpercaya dan resmi."],
      extractedFeatures: features
    };
  }

  // 1. IP Address
  if (isIpAddress) {
    score += 50;
    reasons.push("URL menggunakan alamat IP langsung alih-alih nama domain yang valid. Ini adalah indikator kuat situs yang sengaja menyembunyikan identitasnya.");
  }

  // 2. Protocol
  if (protocol === "HTTP" && !isIpAddress) {
    score += 15;
    reasons.push("Koneksi tidak aman (HTTP). Data yang Anda masukkan (seperti kata sandi) dapat dicegat oleh pihak lain.");
  }

  // 3. Subdomains
  if (subdomainCount >= 3) {
    score += 25;
    reasons.push(`Domain menggunakan terlalu banyak subdomain (${subdomainCount}). Penipu sering menggunakan banyak subdomain gratis untuk mengelabui pengguna.`);
  } else if (subdomainCount === 2) {
    score += 10;
    reasons.push("Domain menggunakan banyak subdomain, yang sedikit mencurigakan jika bukan dari situs resmi.");
  }

  // 4. URL Length
  if (urlLength > 100) {
    score += 10;
    reasons.push("Panjang URL sangat mencurigakan (lebih dari 100 karakter). Tautan penipuan sering kali panjang untuk menyembunyikan parameter berbahaya.");
  }

  // 5. Shorteners
  if (isShortener) {
    score += 25;
    reasons.push("Tautan menggunakan layanan penyingkat URL. Penipu sering menggunakannya untuk menyembunyikan tujuan asli tautan yang berbahaya.");
  }

  // 6. Suspicious TLDs
  if (SUSPICIOUS_TLDS.some(t => hostname.endsWith(t))) {
    score += 35;
    reasons.push(`Tautan menggunakan ekstensi domain murah atau gratis (${tld}) yang sangat sering disalahgunakan oleh jaringan penipuan dan phishing.`);
  }

  // 7. Suspicious Characters
  if (hasSuspiciousChars) {
    score += 15;
    reasons.push("Domain mengandung pola karakter aneh atau simbol berlebihan, yang sering digunakan untuk menghindari pendeteksian keamanan.");
  }

  // 8. Government Impersonation
  const hasGovKeywords = hostname.includes("pemerintah") || hostname.includes("kominfo") || hostname.includes("kemen");
  if (!isGovernmentDomain && hasGovKeywords) {
     score += 45;
     reasons.push("Sangat mencurigakan: URL ini mencoba meniru lembaga pemerintah Indonesia tetapi TIDAK menggunakan ekstensi resmi '.go.id'. Ini adalah taktik penipuan umum.");
  } else if (isGovernmentDomain) {
     score = 0; 
     reasons.push("URL menggunakan domain resmi pemerintah Indonesia (.go.id). Ini merupakan situs terpercaya.");
     return { score, riskLevel: "Rendah", reasons, extractedFeatures: features };
  }

  // 9. Financial Assistance
  if (FINANCIAL_SCAM_KEYWORDS.some(kw => fullUrl.includes(kw))) {
    score += 30;
    reasons.push("Menawarkan bantuan keuangan, bansos, atau uang. Topik ini adalah modus penipuan utama di Indonesia.");
  }

  // 10. Reward/Gift Scams
  if (REWARD_SCAM_KEYWORDS.some(kw => fullUrl.includes(kw))) {
    score += 35;
    reasons.push("Menawarkan hadiah, bonus, atau undian. Ini adalah ciri khas penipuan ('Phishing') yang dirancang untuk mencuri data pribadi Anda.");
  }

  // 11. Brand Mimicking (Typosquatting)
  const normalizedHost = hostname
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a");

  let brandMimickingFound = false;
  for (const brand of TRUSTED_BRANDS) {
    const isLegitBrand = hostname === `${brand}.com` || hostname === `${brand}.co.id` || hostname === `${brand}.id` || hostname.endsWith(`.${brand}.com`) || hostname.endsWith(`.${brand}.co.id`) || hostname.endsWith(`.${brand}.id`);
    
    if (normalizedHost.includes(brand) && !isLegitBrand && !brandMimickingFound) {
      score += 40;
      reasons.push(`Terdeteksi peniruan identitas merek populer (${brand.toUpperCase()}). Penipu sengaja membuat nama domain mirip dengan yang asli untuk mengelabui Anda.`);
      brandMimickingFound = true;
    }
  }
  
  // TLD check for brand mimicking
  const indonesianDomain = hostname.endsWith(".id") && !hostname.endsWith(".co.id") && !hostname.endsWith(".go.id") && !hostname.endsWith(".ac.id");
  if (indonesianDomain && subdomainCount > 0 && !TRUSTED_DOMAINS.has(apexDomain)) {
    score += 10;
  }

  // Cap the score at 100 and floor at 0
  score = Math.max(0, Math.min(100, score));

  let riskLevel: UrlAnalysisResult["riskLevel"] = "Rendah";
  if (score >= 75) {
    riskLevel = "Kritis";
  } else if (score >= 50) {
    riskLevel = "Tinggi";
  } else if (score >= 25) {
    riskLevel = "Sedang";
  }

  if (reasons.length === 0) {
    reasons.push("Tidak ada indikator mencurigakan yang ditemukan secara langsung pada struktur URL.");
  }

  return {
    score,
    riskLevel,
    reasons,
    extractedFeatures: features
  };
}
