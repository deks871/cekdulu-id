export type ScamCategory =
  | "impersonation"
  | "urgency"
  | "action"
  | "giveaway"
  | "otp"
  | "financial";
 
export interface ScamPattern {
  pattern: RegExp;
  label: string; // deskripsi singkat untuk ditampilkan ke user
  score: number; // kontribusi skor dari pattern ini (0-100)
}
 
export interface CategoryConfig {
  patterns: ScamPattern[];
  baseScore: number; // skor dasar jika kategori ini terdeteksi
  maxScore: number;  // batas maksimal skor dari kategori ini
}
 
// ---------------------------------------------------------------------------
// COMBO RULES
// Jika kombinasi kategori berikut terdeteksi, berikan bonus skor
// ---------------------------------------------------------------------------
export interface ComboRule {
  id: string;
  categories: ScamCategory[];
  bonusScore: number;
  reason: string;
}
 
export const COMBO_RULES: ComboRule[] = [
  {
    id: "impersonation_urgency_action",
    categories: ["impersonation", "urgency", "action"],
    bonusScore: 30,
    reason:
      "Kombinasi berbahaya: penyamaran identitas + tekanan waktu + permintaan tindakan segera",
  },
  {
    id: "giveaway_action",
    categories: ["giveaway", "action"],
    bonusScore: 20,
    reason: "Modus hadiah palsu: tawaran hadiah disertai instruksi tindakan mencurigakan",
  },
  {
    id: "otp_action",
    categories: ["otp", "action"],
    bonusScore: 25,
    reason: "Percobaan pembajakan akun: permintaan kode OTP disertai instruksi tindakan",
  },
  {
    id: "financial_urgency",
    categories: ["financial", "urgency"],
    bonusScore: 20,
    reason: "Penipuan finansial: tekanan waktu untuk transaksi keuangan",
  },
  {
    id: "impersonation_financial",
    categories: ["impersonation", "financial"],
    bonusScore: 15,
    reason: "Penyamaran untuk mendapatkan akses finansial",
  },
  {
    id: "full_combo",
    categories: ["impersonation", "urgency", "action", "financial"],
    bonusScore: 40,
    reason: "PERINGATAN KERAS: Semua pola utama penipuan terdeteksi sekaligus",
  },
];
 
// ---------------------------------------------------------------------------
// CATEGORY PATTERNS
// ---------------------------------------------------------------------------
 
export const SCAM_CATEGORIES: Record<ScamCategory, CategoryConfig> = {
  // -------------------------------------------------------------------------
  // IMPERSONATION — Penyamaran sebagai institusi/tokoh terpercaya
  // -------------------------------------------------------------------------
  impersonation: {
    baseScore: 20,
    maxScore: 40,
    patterns: [
      {
        pattern: /\b(b[a-z]*ri|b[a-z]*ca|m[a-z]*ndiri|b[a-z]*ni|c[a-z]*mb|b[a-z]*tara|p[a-z]*nio)\b/gi,
        label: "Menyebut nama bank ternama Indonesia",
        score: 10,
      },
      {
        pattern: /\b(gojek|grab|shopee|tokopedia|lazada|traveloka|bukalapak|dana|ovo|gopay|linkaja)\b/gi,
        label: "Menyebut nama aplikasi/platform ternama",
        score: 10,
      },
      {
        pattern: /\b(ojk|bi|bank\s*indonesia|otoritas\s*jasa\s*keuangan|kominfo|kemenkominfo|kepolisian|polri|polisi|bssn)\b/gi,
        label: "Menyebut lembaga pemerintah atau regulator",
        score: 15,
      },
      {
        pattern: /\b(cs|customer\s*service|layanan\s*pelanggan|admin|helpdesk|help\s*desk|support\s*team|tim\s*kami)\b/gi,
        label: "Mengaku sebagai tim layanan resmi",
        score: 8,
      },
      {
        pattern: /\b(resmi|official|verified|terverifikasi|terpercaya|authorized)\b/gi,
        label: "Klaim keaslian atau keresmiaan",
        score: 10,
      },
      {
        pattern:
          /\b(pihak\s*bank|pihak\s*kami|pihak\s*(gojek|grab|shopee|tokopedia))\b/gi,
        label: "Mengklaim mewakili pihak resmi tertentu",
        score: 12,
      },
      {
        pattern: /\b(direktur|ceo|manager|manajer|kepala\s*cabang|supervisor)\b/gi,
        label: "Mengaku sebagai pejabat/petinggi perusahaan",
        score: 10,
      },
      {
        pattern: /\b(ini\s*(saya|kami)\s*(dari|pihak)|saya\s*tim|kami\s*dari\s*pihak)\b/gi,
        label: "Klaim identitas dari pihak tertentu",
        score: 12,
      },
    ],
  },
 
  // -------------------------------------------------------------------------
  // URGENCY — Tekanan waktu untuk memaksa tindakan cepat
  // -------------------------------------------------------------------------
  urgency: {
    baseScore: 15,
    maxScore: 35,
    patterns: [
      {
        pattern:
          /\b(segera|sekarang\s*juga?|saat\s*ini\s*juga?|langsung|cepat|buruan|buru[- ]buru)\b/gi,
        label: "Kata-kata mendesak untuk bertindak cepat",
        score: 10,
      },
      {
        pattern:
          /\b(hari\s*ini|malam\s*ini|jam\s*ini|sebelum\s*(jam|pk|pukul|hari|malam)|dalam\s*\d+\s*(jam|menit|detik|hari))\b/gi,
        label: "Batasan waktu yang sempit",
        score: 12,
      },
      {
        pattern:
          /\b(akan\s*diblokir|diblokir|pemblokiran|akun\s*anda?\s*akan|rekening\s*anda?\s*akan|terancam\s*ditutup|akan\s*ditangguhkan|suspended|suspend)\b/gi,
        label: "Ancaman pemblokiran atau penangguhan akun",
        score: 18,
      },
      {
        pattern:
          /\b(batas\s*waktu|deadline|expired?|kadaluarsa|berakhir\s*(hari\s*ini|segera)|tidak\s*berlaku\s*lagi)\b/gi,
        label: "Peringatan batas waktu atau kedaluwarsa",
        score: 12,
      },
      {
        pattern:
          /\b(jangan\s*sampai|jangan\s*lewatkan|jangan\s*terlambat|hati[- ]hati\s*jika\s*tidak)\b/gi,
        label: "Peringatan konsekuensi jika tidak segera bertindak",
        score: 10,
      },
      {
        pattern:
          /\b(darurat|emergency|urgent|mendesak|penting\s*sekali|sangat\s*penting|kritis)\b/gi,
        label: "Klaim situasi darurat atau sangat penting",
        score: 14,
      },
      {
        pattern: /\b(terakhir\s*kali|kesempatan\s*terakhir|peringatan\s*(terakhir|akhir))\b/gi,
        label: "Klaim kesempatan atau peringatan terakhir",
        score: 14,
      },
    ],
  },
 
  // -------------------------------------------------------------------------
  // ACTION — Permintaan tindakan yang mencurigakan
  // -------------------------------------------------------------------------
  action: {
    baseScore: 15,
    maxScore: 35,
    patterns: [
      {
        pattern:
          /\b(klik\s*link|klik\s*tautan|buka\s*link|buka\s*tautan|tekan\s*link|akses\s*link|ikuti\s*link)\b/gi,
        label: "Instruksi mengklik tautan tidak dikenal",
        score: 15,
      },
      {
        pattern:
          /\b(unduh|download|install|instal|pasang\s*aplikasi|download\s*apk|install\s*apk)\b/gi,
        label: "Instruksi mengunduh atau memasang aplikasi",
        score: 18,
      },
      {
        pattern:
          /\b(isi\s*(formulir|form|data)|lengkapi\s*data|masukkan\s*data|input\s*data|daftarkan\s*diri|verifikasi\s*data)\b/gi,
        label: "Permintaan mengisi formulir atau data pribadi",
        score: 12,
      },
      {
        pattern:
          /\b(hubungi\s*(kami|cs|admin|wa|whatsapp)|balas\s*pesan\s*ini|reply|chat\s*kami|dm\s*kami)\b/gi,
        label: "Instruksi menghubungi pihak tertentu",
        score: 8,
      },
      {
        pattern:
          /\b(transfer|kirim(kan)?\s*uang|bayar(kan)?|lakukan\s*pembayaran|kirim\s*ke\s*rekening)\b/gi,
        label: "Instruksi transfer atau pembayaran",
        score: 20,
      },
      {
        pattern:
          /\b(konfirmasi(kan)?|verifikasi(kan)?|validasi(kan)?|autentikasi)\b/gi,
        label: "Instruksi konfirmasi atau verifikasi",
        score: 10,
      },
      {
        pattern:
          /\b(scan\s*(qr|barcode)|pindai\s*(qr|barcode)|foto(kan)?\s*ktp|kirim(kan)?\s*(foto|gambar|dokumen))\b/gi,
        label: "Permintaan scan QR atau mengirim dokumen/foto",
        score: 18,
      },
      {
        pattern: /\b(aktifkan|aktivasi|reaktivasi|upgrade\s*akun)\b/gi,
        label: "Instruksi aktivasi atau upgrade akun",
        score: 12,
      },
    ],
  },
 
  // -------------------------------------------------------------------------
  // GIVEAWAY — Tawaran hadiah, undian, atau keuntungan palsu
  // -------------------------------------------------------------------------
  giveaway: {
    baseScore: 15,
    maxScore: 35,
    patterns: [
      {
        pattern:
          /\b(selamat|congratulation|ucapan\s*selamat)\b.{0,60}(menang|terpilih|beruntung|hadiah|memenangkan)/gi,
        label: "Ucapan selamat menang hadiah",
        score: 20,
      },
      {
        pattern:
          /\b(hadiah|prize|reward|bonus|cashback|voucher|kupon)\b.{0,40}(gratis|free|senilai|rp|rupiah|\d+\s*juta|\d+\s*ribu)/gi,
        label: "Tawaran hadiah atau bonus bernilai uang",
        score: 18,
      },
      {
        pattern:
          /\b(undian|lotere|lotre|lucky\s*draw|giveaway|doorprize|door\s*prize)\b/gi,
        label: "Klaim undian atau giveaway berhadiah",
        score: 15,
      },
      {
        pattern:
          /\b(anda?\s*(terpilih|terpilih\s*sebagai|menjadi)\s*(pemenang|penerima|peserta\s*beruntung))\b/gi,
        label: "Klaim terpilih sebagai pemenang",
        score: 20,
      },
      {
        pattern:
          /\b(klaim\s*hadiah|ambil\s*hadiah|cairkan\s*hadiah|dapatkan\s*hadiah|redeem\s*hadiah)\b/gi,
        label: "Instruksi mengklaim atau mencairkan hadiah",
        score: 15,
      },
      {
        pattern:
          /\b(gratis|free|cuma[- ]cuma|tanpa\s*biaya|tidak\s*dipungut\s*biaya)\b.{0,60}(hp|handphone|smartphone|laptop|uang|saldo|token|pulsa)/gi,
        label: "Tawaran barang/uang gratis",
        score: 18,
      },
      {
        pattern: /\b(anda?\s*berhak\s*mendapatkan|anda?\s*mendapatkan\s*hadiah)\b/gi,
        label: "Klaim hak mendapatkan hadiah",
        score: 15,
      },
      {
        pattern:
          /\b(\d+\s*(juta|ribu|miliar)|rp\.?\s*\d[\d.,]+)\b.{0,30}(hadiah|bonus|cashback|reward)/gi,
        label: "Nominal uang dikaitkan dengan hadiah",
        score: 16,
      },
    ],
  },
 
  // -------------------------------------------------------------------------
  // OTP — Permintaan kode OTP atau data sensitif akun
  // -------------------------------------------------------------------------
  otp: {
    baseScore: 20,
    maxScore: 45,
    patterns: [
      {
        pattern:
          /\b(otp|one[- ]time[- ]password|kode\s*(verifikasi|konfirmasi|otentikasi|rahasia|unik))\b/gi,
        label: "Penyebutan OTP atau kode verifikasi",
        score: 25,
      },
      {
        pattern:
          /\b(pin|kata\s*sandi|password|pasword|sandi|kode\s*akses|m[- ]?banking|mobile\s*banking)\b.{0,40}(kirim|berikan|share|kasih|input|masukkan|sebutkan)/gi,
        label: "Permintaan PIN atau password",
        score: 30,
      },
      {
        pattern:
          /\b(jangan\s*beritahu|jangan\s*kasih\s*tahu|jangan\s*share|jangan\s*bagikan)\b.{0,30}(otp|kode|pin|sandi|password)\b/gi,
        label: "Pesan 'jangan beritahu' seputar kode (taktik manipulasi)",
        score: 20,
      },
      {
        pattern:
          /\b(nomor\s*(kartu|rekening)|cvv|cvc|tanggal\s*kadaluarsa|expiry\s*date|no\.\s*kartu)\b/gi,
        label: "Permintaan data kartu kredit/debit",
        score: 30,
      },
      {
        pattern:
          /\b(username|user\s*id|id\s*pengguna|email\s*dan\s*password|login\s*detail)\b.{0,40}(kirim|berikan|share|kasih|input|masukkan)/gi,
        label: "Permintaan username dan password",
        score: 25,
      },
      {
        pattern:
          /\b(kode\s*(yang\s*)?(dikirim|masuk|anda?\s*terima|sms|wa|whatsapp))\b/gi,
        label: "Mengarahkan pada kode yang dikirim via SMS/WA",
        score: 22,
      },
      {
        pattern:
          /\b(remote\s*(desktop|access)|anydesk|teamviewer|screen\s*share|berbagi\s*layar)\b/gi,
        label: "Permintaan akses remote ke perangkat",
        score: 35,
      },
    ],
  },
 
  // -------------------------------------------------------------------------
  // FINANCIAL — Permintaan terkait uang atau biaya admin palsu
  // -------------------------------------------------------------------------
  financial: {
    baseScore: 20,
    maxScore: 40,
    patterns: [
      {
        pattern:
          /\b(biaya\s*(admin|administrasi|proses|pengiriman|handling|aktivasi)|admin\s*fee|processing\s*fee)\b/gi,
        label: "Biaya admin atau biaya proses mencurigakan",
        score: 22,
      },
      {
        pattern:
          /\b(dp|uang\s*muka|down\s*payment|tanda\s*jadi)\b.{0,40}(transfer|kirim|bayar)/gi,
        label: "Permintaan uang muka atau deposit",
        score: 18,
      },
      {
        pattern:
          /\b(transfer\s*ke\s*(rekening|no\.\s*rek|nomor\s*rekening)|rek\s*tujuan|nomor\s*tujuan)\b/gi,
        label: "Instruksi transfer ke rekening tertentu",
        score: 20,
      },
      {
        pattern:
          /\b(pinjaman\s*(cepat|kilat|online|tanpa\s*agunan)|kredit\s*tanpa\s*jaminan|dana\s*tunai\s*cepat)\b/gi,
        label: "Tawaran pinjaman cepat atau tanpa jaminan mencurigakan",
        score: 15,
      },
      {
        pattern:
          /\b(investasi\s*(pasti|dijamin|aman|terpercaya)|return\s*\d+%|keuntungan\s*\d+%|profit\s*\d+%)\b/gi,
        label: "Tawaran investasi dengan jaminan keuntungan pasti",
        score: 20,
      },
      {
        pattern: /\b(pulsa|token\s*listrik|e[- ]money|saldo)\b.{0,30}(kirim|transfer|beli)/gi,
        label: "Permintaan pengiriman pulsa atau token",
        score: 18,
      },
      {
        pattern:
          /\b(dompet\s*digital|e[- ]wallet|gopay|ovo|dana|linkaja)\b.{0,40}(kirim|transfer|bayar)/gi,
        label: "Instruksi transfer via dompet digital",
        score: 15,
      },
      {
        pattern:
          /\b(pajak\s*hadiah|pajak\s*pemenang|bea\s*cukai|bea\s*masuk)\b.{0,30}(bayar|transfer|lunasi)/gi,
        label: "Klaim pajak hadiah atau bea cukai palsu",
        score: 25,
      },
    ],
  },
};
 