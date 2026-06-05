import * as cheerio from "cheerio";

export interface ContentAnalysisResult {
  score: number;
  reasons: string[];
}

// ─── Phishing Indicator Keywords ─────────────────────────────────────────────

const URGENT_KEYWORDS = [
  "segera", "cepat", "waktu terbatas", "hari ini", "sekarang juga", "batas waktu", "jangan lewatkan", "blokir", "ditangguhkan"
];

const GIVEAWAY_KEYWORDS = [
  "selamat", "anda memenangkan", "hadiah", "undian", "klaim bonus", "uang tunai", "giveaway", "pemenang", "tebus murah"
];

const GOV_ASSISTANCE_KEYWORDS = [
  "bantuan sosial", "bansos", "prakerja", "subsidi", "kompensasi", "kemenkeu", "kominfo", "bantuan langsung tunai", "blt", "bpjs"
];

const BANKING_KEYWORDS = [
  "bca", "mandiri", "bni", "bri", "klikbca", "livin", "cimb", "danamon", "permata", "syariah"
];

const PERSONAL_INFO_KEYWORDS = [
  "nik", "nomor ktp", "no ktp", "kartu keluarga", "kata sandi", "pin", "otp", "nomor rekening", "cvv"
];

const FAKE_VERIFICATION_KEYWORDS = [
  "verifikasi data anda", "konfirmasi identitas", "verifikasi akun", "konfirmasi data"
];

export function analyzeContent(html: string): ContentAnalysisResult {
  let score = 0;
  const reasons: string[] = [];
  
  const $ = cheerio.load(html);
  
  const title = $("title").text().toLowerCase();
  const metaDesc = $("meta[name='description']").attr("content")?.toLowerCase() || "";
  // Remove script and style tags before extracting visible text
  $("script, style").remove();
  const bodyText = $("body").text().toLowerCase().replace(/\s+/g, ' ');
  const allText = `${title} ${metaDesc} ${bodyText}`;

  // 1. Extracted Elements
  const forms = $("form");
  const passwordInputs = $("input[type='password']");
  const metaRefresh = $("meta[http-equiv='refresh']");
  
  // 2. Forms & Login Fields
  if (forms.length > 0) {
    if (passwordInputs.length > 0) {
      score += 40;
      reasons.push("Deteksi Login Form: Halaman ini memuat formulir yang meminta kata sandi (password). Waspada penipuan pencurian akun (Phishing).");
      
      // Check for bank impersonation if there's a login field
      const bankCount = BANKING_KEYWORDS.filter(kw => allText.includes(kw)).length;
      if (bankCount > 0) {
        score += 50;
        reasons.push("Indikasi Peniruan Bank: Halaman memiliki formulir login dan menyebutkan nama bank ternama. Ini adalah taktik umum untuk mencuri kredensial perbankan Anda.");
      }
    }
  }

  // Check for external redirects via meta refresh
  if (metaRefresh.length > 0) {
    score += 25;
    reasons.push("Pengalihan Otomatis (Redirect): Halaman ini diatur untuk secara otomatis mengalihkan Anda ke situs lain, sering digunakan untuk menyembunyikan halaman berbahaya.");
  }

  // 3. Payment / Credit Card / Bank Account Info
  const paymentInputs = $("input[name*='card'], input[name*='cc'], input[name*='rekening'], input[name*='cvv'], input[placeholder*='rekening'], input[placeholder*='cvv']");
  if (paymentInputs.length > 0) {
    score += 50;
    reasons.push("Permintaan Data Keuangan: Terdeteksi kolom formulir yang secara eksplisit meminta nomor kartu kredit, CVV, atau rekening bank.");
  }

  // 4. Identity / KTP Requests
  const idInputs = $("input[name*='ktp'], input[name*='nik'], input[placeholder*='ktp'], input[placeholder*='nik']");
  if (idInputs.length > 0 || allText.includes("nomor ktp") || allText.includes("nik") || allText.includes("kartu keluarga")) {
    score += 45;
    reasons.push("Permintaan Identitas Pribadi (KTP/NIK): Situs ini meminta Nomor Induk Kependudukan (NIK) atau data KTP Anda, yang sangat rentan disalahgunakan untuk pinjaman online ilegal.");
  }

  // 5. Phone Number & WhatsApp Collection
  const phoneInputs = $("input[name*='phone'], input[name*='hp'], input[name*='whatsapp'], input[placeholder*='no hp'], input[placeholder*='whatsapp']");
  if (phoneInputs.length > 0) {
    score += 15;
    reasons.push("Pengumpulan Nomor Telepon: Terdapat formulir yang meminta nomor HP/WhatsApp Anda. Sering dipakai untuk target spam atau penipuan lanjutan.");
  }

  // 6. OTP / Verification PIN Requests
  const otpInputs = $("input[name*='otp'], input[placeholder*='otp'], input[name*='pin'], input[placeholder*='pin']");
  if (otpInputs.length > 0 || allText.includes("kode otp") || allText.includes("kode verifikasi")) {
    score += 60; // Huge red flag for phishing
    reasons.push("Permintaan OTP/PIN Terdeteksi: Halaman meminta kode rahasia OTP atau PIN. Jangan PERNAH memberikan kode OTP Anda kepada siapapun, termasuk pihak yang mengaku dari lembaga resmi.");
  }

  // 7. Urgent Action requests
  const urgentCount = URGENT_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (urgentCount > 0) {
    score += 20;
    reasons.push("Bahasa Mendesak/Ancaman: Menggunakan kata-kata seperti 'segera', 'blokir', atau 'batas waktu' untuk menciptakan kepanikan agar Anda cepat bertindak tanpa berpikir panjang.");
  }

  // 8. Fake Verification
  const fakeVerificationCount = FAKE_VERIFICATION_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (fakeVerificationCount > 0) {
    score += 30;
    reasons.push("Verifikasi Palsu: Terdapat teks yang meminta Anda untuk 'konfirmasi identitas' atau 'verifikasi data'. Ini adalah modus operandi standar untuk mencuri data pribadi.");
  }

  // 9. Giveaway / Rewards Scams
  const giveawayCount = GIVEAWAY_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (giveawayCount > 0) {
    score += 40;
    reasons.push("Janji Hadiah/Undian Palsu: Konten situs menjanjikan hadiah, undian, atau uang tunai gratis. Ini adalah jebakan untuk mencuri uang muka (pajak fiktif) atau data diri.");
  }

  // 10. Government Impersonation (Bansos)
  const govCount = GOV_ASSISTANCE_KEYWORDS.filter(kw => allText.includes(kw)).length;
  if (govCount > 0) { 
    // We can assume if it talks about bansos but is not a .go.id, it's highly suspicious. 
    score += 40;
    reasons.push("Indikasi Penipuan Bansos: Membahas program bantuan sosial, subsidi, atau prakerja pemerintah. Sering digunakan untuk menipu kelompok masyarakat rentan.");
    
    if (allText.includes("kemenkominfo") || allText.includes("kemenkes") || allText.includes("pemerintah")) {
      score += 15;
      reasons.push("Pencatutan Nama Instansi: Halaman menyebut nama kementerian atau instansi pemerintah untuk meyakinkan korban.");
    }
  }

  score = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push("Tidak ada pola berbahaya yang terdeteksi secara langsung pada konten teks halaman.");
  }

  return { score, reasons };
}
