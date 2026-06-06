export interface BehavioralResult {
  score: number;
  patterns: string[];
}

/**
 * Normalizes text for analysis
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[^\w\s.,!?%-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detects structural intent concepts rather than just plain keywords.
 */
export function detectBehavioralPatterns(rawText: string): BehavioralResult {
  const text = normalizeText(rawText);
  let baseScore = 0;
  let comboScore = 0;
  const patterns: string[] = [];
  const intents = new Set<string>();

  // ---------------------------------------------------------
  // CONCEPT: Reward Pattern (Benefit Claim + Selection Claim)
  // ---------------------------------------------------------
  const hasBenefit = /(hadiah|bonus|keuntungan|uang|saldo|rp|gratis|undian|giveaway|promo|diskon)/.test(text);
  const hasSelection = /(terpilih|khusus|pemenang|eksklusif|spesial|selamat|dipilih|menang)/.test(text);
  
  if (hasBenefit && hasSelection) {
    intents.add("RewardPattern");
    baseScore += 10;
    patterns.push("Klaim Hadiah & Seleksi Eksklusif");
  } else if (hasBenefit || hasSelection) {
    baseScore += 5;
    patterns.push(hasBenefit ? "Klaim Keuntungan" : "Klaim Eksklusivitas");
  }

  // ---------------------------------------------------------
  // CONCEPT: Authority Pattern (Borrowed Credibility)
  // ---------------------------------------------------------
  const hasAuthority = /(raffi ahmad|nagita|baim wong|bank|pajak|bea cukai|polisi|kominfo|customer service|cs|admin resmi|whatsapp resmi|shopee|tokopedia|gojek|dana|ovo|tiktok resmi)/.test(text);
  if (hasAuthority) {
    intents.add("AuthorityPattern");
    baseScore += 10;
    patterns.push("Mencatut Nama Otoritas/Tokoh Publik");
  }

  // ---------------------------------------------------------
  // CONCEPT: Action Pattern (Driving user behavior)
  // ---------------------------------------------------------
  const hasAction = /(klik|hubungi|transfer|balas|kirim|kunjungi|tautan|link|buka|login|verifikasi|masuk ke|bantu|klaim)/.test(text);
  if (hasAction) {
    intents.add("ActionPattern");
    baseScore += 10;
    patterns.push("Mendesak Tindakan (Klik/Hubungi/Transfer)");
  }

  // ---------------------------------------------------------
  // CONCEPT: Information Gathering Pattern (Extraction intent)
  // ---------------------------------------------------------
  const hasInfoReq = /(ktp|pin|password|sandi|otp|kode|data diri|rekening|akun|verifikasi data|nomor kartu|cvv)/.test(text);
  if (hasInfoReq) {
    intents.add("InformationGatheringPattern");
    baseScore += 15;
    patterns.push("Permintaan Informasi Sensitif");
  }

  // ---------------------------------------------------------
  // CONCEPT: Social Engineering Pattern (Urgency/Scarcity)
  // ---------------------------------------------------------
  const hasUrgency = /(segera|sekarang|hari ini|terbatas|hangus|diblokir|kadaluarsa|sebelum|waktu|batas waktu|cepat)/.test(text);
  if (hasUrgency) {
    intents.add("SocialEngineeringPattern");
    baseScore += 10;
    patterns.push("Manipulasi Emosi (Urgensi/Kelangkaan)");
  }

  // ---------------------------------------------------------
  // COMBO SCORING (Mutually Exclusive Tiers for Reward + Action + Authority)
  // ---------------------------------------------------------
  const hasPattern = (p: string) => intents.has(p);

  if (hasPattern("AuthorityPattern") && hasPattern("RewardPattern") && hasPattern("ActionPattern") && hasPattern("InformationGatheringPattern")) {
    comboScore += 35;
    patterns.push("[SANGAT BERBAHAYA] Otoritas Palsu + Iming Hadiah + Desakan Aksi + Curi Data");
  } else if (hasPattern("AuthorityPattern") && hasPattern("RewardPattern") && hasPattern("ActionPattern")) {
    comboScore += 25;
    patterns.push("[BERBAHAYA] Otoritas Palsu + Iming Hadiah + Desakan Aksi");
  } else if (hasPattern("AuthorityPattern") && hasPattern("RewardPattern")) {
    comboScore += 15;
    patterns.push("Pola Umum Penipuan: Otoritas Palsu + Iming Hadiah");
  } else if (hasPattern("RewardPattern") && hasPattern("ActionPattern")) {
    comboScore += 15;
    patterns.push("Pola Umum Penipuan: Iming Hadiah + Desakan Aksi");
  }

  // Additional standalone combo: Urgency + Info Gathering
  if (hasPattern("SocialEngineeringPattern") && hasPattern("InformationGatheringPattern")) {
    comboScore += 20;
    patterns.push("[BERBAHAYA] Urgensi + Permintaan Data Sensitif");
  }

  const finalScore = Math.min(60, baseScore + comboScore);

  return {
    score: finalScore,
    patterns
  };
}
