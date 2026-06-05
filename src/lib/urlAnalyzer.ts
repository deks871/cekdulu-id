export interface UrlFeatures {
  protocol: string;
  domain: string;
  tld: string;
  urlLength: number;
  pathLength: number;
  queryParametersCount: number;
  subdomainCount: number;
  isIpAddress: boolean;
  isGovernmentDomain: boolean;
  hasSuspiciousChars: boolean;
  isShortener: boolean;
  isPunycode: boolean;
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

const LOW_COST_TLDS = [
  ".my.id", ".biz.id", ".xyz", ".top", ".click", ".site", ".online", ".loan", ".work",
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
        protocol: "", domain: "", tld: "", urlLength: rawUrl.length, pathLength: 0, queryParametersCount: 0, subdomainCount: 0,
        isIpAddress: false, isGovernmentDomain: false, hasSuspiciousChars: false, isShortener: false, isPunycode: false
      }
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol.replace(":", "").toUpperCase();
  const fullUrl = rawUrl.toLowerCase();
  const urlLength = rawUrl.length;
  const pathLength = parsedUrl.pathname.length;
  const queryParametersCount = Array.from(parsedUrl.searchParams.keys()).length;

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

  const isPunycode = hostname.includes("xn--");

  const features: UrlFeatures = {
    protocol,
    domain: hostname,
    tld,
    urlLength,
    pathLength,
    queryParametersCount,
    subdomainCount,
    isIpAddress,
    isGovernmentDomain,
    hasSuspiciousChars,
    isShortener,
    isPunycode
  };

  // Immediate Trusted Domain Check
  if (TRUSTED_DOMAINS.has(hostname) || TRUSTED_DOMAINS.has(apexDomain)) {
    return {
      score: 0,
      riskLevel: "Rendah",
      reasons: ["Domain resmi terpercaya: Tautan ini milik layanan atau perusahaan besar yang sudah diverifikasi aman."],
      extractedFeatures: features
    };
  }

  // 1. IP Address
  if (isIpAddress) {
    score += 50;
    reasons.push("IP Address terdeteksi: Menggunakan alamat IP (misal: 192.168.x.x) alih-alih nama domain. Situs sah umumnya menggunakan nama domain untuk memudahkan pengguna, sedangkan penipu sering memakai IP untuk menyembunyikan jejak peladen (server) mereka.");
  }

  // 2. Protocol
  if (protocol === "HTTP" && !isIpAddress) {
    score += 15;
    reasons.push("Protokol tidak aman (HTTP): Koneksi ke situs ini tidak dienkripsi. Informasi sensitif seperti kata sandi atau data kartu kredit dapat dengan mudah disadap oleh pihak ketiga.");
  }

  // 3. Subdomains
  if (subdomainCount >= 3) {
    score += 25;
    reasons.push(`Jumlah Subdomain mencurigakan (${subdomainCount}): Menggunakan terlalu banyak subdomain (contoh: a.b.c.domain.com). Penipu sering membonceng layanan hosting gratis dengan membuat subdomain bertingkat untuk menyembunyikan identitas domain utama.`);
  } else if (subdomainCount === 2) {
    score += 10;
    reasons.push(`Subdomain berlapis (${subdomainCount}): Menggunakan lebih dari satu subdomain. Meskipun tidak selalu berbahaya, ini merupakan pola yang sering ditemukan pada tautan tiruan.`);
  }

  // 4. URL Length
  if (urlLength > 100) {
    score += 10;
    reasons.push(`URL terlalu panjang (${urlLength} karakter): Tautan yang sangat panjang sering kali disengaja untuk menyembunyikan nama domain asli yang berbahaya agar tidak terlihat sepenuhnya di layar Anda.`);
  }

  // 5. Shorteners
  if (isShortener) {
    score += 25;
    reasons.push("Penyingkat URL (URL Shortener): Menggunakan layanan penyingkat tautan (seperti bit.ly atau s.id). Layanan semacam ini sangat sering disalahgunakan oleh penjahat siber untuk menutupi tujuan akhir dari tautan phishing.");
  }

  // 6. Low Cost TLDs
  if (LOW_COST_TLDS.some(t => hostname.endsWith(t))) {
    score += 10;
    reasons.push(`Ekstensi Domain Murah (${tld}): Domain ini menggunakan ekstensi yang murah atau gratis. Ekstensi ini sering digunakan penipu, namun bukan indikator pasti tanpa bukti tambahan.`);
    
    // Combine with suspicious subdomains
    if (subdomainCount > 0) {
      // Hyphenated subdomains
      const hasHyphenatedSubdomain = hostname.split('.').slice(0, -2).some(p => p.includes('-'));
      if (hasHyphenatedSubdomain) {
        score += 20;
        reasons.push(`Pola Subdomain Mencurigakan: Terdapat subdomain dengan tanda hubung pada domain murah. Kombinasi ini sangat sering ditemui pada situs phishing (contoh: daftar-sekarang.domain.my.id).`);
      }
      
      const suspiciousSubdomainKeywords = ["daftar", "cek", "bantuan", "subsidi", "kuota", "hadiah", "undian", "promo", "klaim", "gratis"];
      const hasSuspiciousSubdomainKeyword = hostname.split('.').slice(0, -2).some(p => suspiciousSubdomainKeywords.some(kw => p.includes(kw)));
      
      if (hasSuspiciousSubdomainKeyword) {
         score += 25;
         reasons.push(`Subdomain Mengandung Kata Kunci Penipuan: Nama subdomain menggunakan kata pemancing (seperti 'daftar', 'subsidi', 'hadiah') di atas domain murah. Ini adalah taktik phishing yang sangat kuat.`);
      }
    }
  }

  // 7. Suspicious Characters
  if (hasSuspiciousChars) {
    score += 15;
    reasons.push("Karakter tidak wajar pada domain: Terdapat simbol-simbol aneh (seperti tanda hubung ganda atau karakter khusus) pada nama domain. Ini taktik yang umum dipakai untuk menghindari filter keamanan otomatis.");
  }

  // 8. Government Impersonation
  const hasGovKeywords = hostname.includes("pemerintah") || hostname.includes("kominfo") || hostname.includes("kemen");
  if (!isGovernmentDomain && hasGovKeywords) {
     score += 45;
     reasons.push("Indikasi Peniruan Identitas Pemerintah: URL ini mengandung kata yang terkait dengan pemerintah Indonesia, namun TIDAK menggunakan domain resmi '.go.id' atau '.gov'. Ini adalah metode penipuan (phishing) klasik untuk mencuri data warga.");
  } else if (isGovernmentDomain) {
     score = 0; 
     reasons.push("Domain Resmi Pemerintah: Menggunakan ekstensi '.go.id' yang terverifikasi khusus dan diatur secara ketat untuk instansi pemerintahan di Indonesia. Domain ini sangat terpercaya.");
     return { score, riskLevel: "Rendah", reasons, extractedFeatures: features };
  }

  // Punycode
  if (isPunycode) {
    score += 40;
    reasons.push("Taktik Punycode terdeteksi ('xn--'): Tautan ini mencoba mengecoh mata Anda dengan menggunakan karakter bahasa asing yang bentuknya mirip alfabet biasa. Ini adalah indikasi kuat serangan phishing tingkat lanjut yang disengaja.");
  }

  // Query Parameters
  if (queryParametersCount > 4) {
    score += 10;
    reasons.push(`Terlalu banyak parameter kueri (${queryParametersCount}): Tautan ini membawa banyak sekali data tambahan di bagian akhir. Walau kadang digunakan secara sah, jumlah yang berlebihan sering dipakai penipu untuk membawa skrip berbahaya atau data identitas korban.`);
  }

  // 9. Financial Assistance
  if (FINANCIAL_SCAM_KEYWORDS.some(kw => fullUrl.includes(kw))) {
    score += 30;
    reasons.push("Kata Kunci Penipuan Finansial: Tautan URL secara gamblang mengandung janji pencairan 'bantuan', 'dana', atau subsidi. Mengingat tren saat ini, topik tersebut digunakan oleh lebih dari 80% serangan rekayasa sosial di Indonesia untuk mengelabui korban.");
  }

  // 10. Reward/Gift Scams
  if (REWARD_SCAM_KEYWORDS.some(kw => fullUrl.includes(kw))) {
    score += 35;
    reasons.push("Kata Kunci Undian/Hadiah: Tautan mengandung kata menjanjikan 'hadiah' atau undian. Taktik manipulasi psikologis ini dirancang agar Anda terburu-buru memberikan data pribadi atau mentransfer sejumlah uang pajak fiktif.");
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
      reasons.push(`Peniruan Merek Terdeteksi (${brand.toUpperCase()}): Nama domain sengaja dipelesetkan (typosquatting) agar menyerupai merek asli yang populer. Contoh umum adalah mengubah 'o' menjadi angka '0' atau menambah imbuhan kata tertentu untuk menipu mata.`);
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
    reasons.push("Tidak ada indikator mencurigakan yang ditemukan secara langsung pada struktur URL. Meski begitu, tetap berhati-hati jika tautan meminta data pribadi.");
  }

  return {
    score,
    riskLevel,
    reasons,
    extractedFeatures: features
  };
}
