import * as cheerio from "cheerio";

export interface ContentAnalysisResult {
  score: number;
  reasons: string[];
}

const URGENT_KEYWORDS = [
  "segera", "cepat", "waktu terbatas", "hari ini", "sekarang juga", "batas waktu", "jangan lewatkan", "blokir", "ditangguhkan"
];

const GIVEAWAY_KEYWORDS = [
  "selamat", "anda memenangkan", "hadiah", "undian", "klaim bonus", "uang tunai", "giveaway", "pemenang", "tebus murah"
];

const GOV_ASSISTANCE_KEYWORDS = [
  "bantuan sosial", "bansos", "prakerja", "subsidi", "kompensasi", "kemenkeu", "kominfo", "bantuan langsung tunai", "blt", "bpjs"
];

const PERSONAL_INFO_KEYWORDS = [
  "nik", "nomor ktp", "no ktp", "kartu keluarga", "kata sandi", "pin", "otp", "nomor rekening", "cvv"
];

export function analyzeContent(html: string): ContentAnalysisResult {
  let score = 0;
  const reasons: string[] = [];
  
  const $ = cheerio.load(html);
  
  const title = $("title").text().toLowerCase();
  const metaDesc = $("meta[name='description']").attr("content")?.toLowerCase() || "";
  const bodyText = $("body").text().toLowerCase();
  const allText = `${title} ${metaDesc} ${bodyText}`;

  // 1. Fake login / forms
  const passwordInputs = $("input[type='password']");
  if (passwordInputs.length > 0) {
    score += 40;
    reasons.push("Website memiliki form login atau meminta kata sandi (password). Berhati-hatilah agar tidak memberikan kredensial Anda.");
  }

  // Check for payment inputs (credit card, bank account)
  const paymentInputs = $("input[name*='card'], input[name*='cc'], input[name*='rekening'], input[name*='cvv'], input[placeholder*='rekening'], input[placeholder*='cvv']");
  if (paymentInputs.length > 0) {
    score += 45;
    reasons.push("Terdeteksi formulir yang meminta informasi pembayaran atau kartu kredit/rekening.");
  }

  // Check for other personal info inputs
  const idInputs = $("input[name*='ktp'], input[name*='nik'], input[placeholder*='ktp'], input[placeholder*='nik']");
  if (idInputs.length > 0) {
    score += 45;
    reasons.push("Website secara eksplisit meminta nomor KTP atau NIK melalui form input.");
  }

  // 2. Urgent action requests
  const urgentCount = URGENT_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (urgentCount > 0) {
    score += 20;
    reasons.push("Menggunakan bahasa mendesak atau ancaman (misal: 'segera', 'blokir') untuk menekan Anda agar cepat bertindak.");
  }

  // 3. Giveaway / Rewards
  const giveawayCount = GIVEAWAY_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (giveawayCount > 0) {
    score += 35;
    reasons.push("Konten website mengklaim bahwa Anda memenangkan hadiah, undian, atau bonus (taktik penipuan yang sangat umum).");
  }

  // 4. Government Impersonation
  const govCount = GOV_ASSISTANCE_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (govCount > 1) { 
    score += 30;
    reasons.push("Membahas program bantuan pemerintah (bansos/subsidi) yang sering ditiru oleh penipu untuk mencuri data.");
  }

  // 5. Personal Info requests (in text)
  const personalInfoCount = PERSONAL_INFO_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (personalInfoCount > 0) {
    score += 35;
    reasons.push("Meminta data pribadi sensitif seperti NIK, KTP, PIN, atau OTP secara tertulis.");
  }

  score = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push("Tidak ada pola berbahaya yang terdeteksi secara langsung pada konten teks halaman.");
  }

  return { score, reasons };
}
