// src/lib/domainAge.ts
// Utility untuk mengecek umur domain via RDAP (free, no API key needed)

export interface DomainAgeResult {
  domain: string;
  createdAt: string | null;
  ageInDays: number | null;
  ageLabel: string;
  riskLevel: "none" | "medium" | "high";
  riskScore: number;
  reason: string;
  source: "rdap" | "fallback" | "error";
}

/**
 * Ekstrak hostname bersih dari URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // Hapus www. prefix
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

/**
 * Hitung selisih hari antara dua tanggal
 */
function daysBetween(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format umur domain menjadi label yang mudah dibaca
 */
function formatAgeLabel(days: number): string {
  if (days < 1) return "Kurang dari 1 hari";
  if (days < 30) return `${days} hari`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `±${months} bulan`;
  }
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
}

/**
 * Cek umur domain menggunakan RDAP (Registration Data Access Protocol)
 * RDAP adalah standar ICANN yang gratis, menggantikan WHOIS lama.
 * Tidak perlu API key.
 *
 * Fallback chain:
 * 1. rdap.org (aggregator utama)
 * 2. IANA bootstrap RDAP
 */
export async function checkDomainAge(url: string): Promise<DomainAgeResult> {
  const domain = extractDomain(url);

  // Tidak perlu cek untuk IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
    return {
      domain,
      createdAt: null,
      ageInDays: null,
      ageLabel: "IP Address",
      riskLevel: "none",
      riskScore: 0,
      reason: "Target adalah IP address, bukan domain.",
      source: "fallback",
    };
  }

  try {
    // Gunakan rdap.org sebagai proxy RDAP (support semua TLD)
    const rdapUrl = `https://rdap.org/domain/${domain}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(rdapUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`RDAP responded ${res.status}`);
    }

    const data = await res.json();

    // Parse tanggal registrasi dari events RDAP
    const events: Array<{ eventAction: string; eventDate: string }> =
      data.events ?? [];

    const registrationEvent = events.find(
      (e) =>
        e.eventAction === "registration" ||
        e.eventAction === "last changed" // beberapa registrar pakai ini untuk creation
    );

    // Prioritaskan "registration" event
    const creationEvent = events.find(
      (e) => e.eventAction === "registration"
    );

    const eventToUse = creationEvent ?? registrationEvent;

    if (!eventToUse?.eventDate) {
      return {
        domain,
        createdAt: null,
        ageInDays: null,
        ageLabel: "Tidak diketahui",
        riskLevel: "none",
        riskScore: 0,
        reason: "Informasi tanggal registrasi domain tidak tersedia.",
        source: "rdap",
      };
    }

    const ageInDays = daysBetween(eventToUse.eventDate);
    const ageLabel = formatAgeLabel(ageInDays);

    // Tentukan skor risiko berdasarkan umur
    let riskLevel: "none" | "medium" | "high" = "none";
    let riskScore = 0;
    let reason = "";

    if (ageInDays < 7) {
      riskLevel = "high";
      riskScore = 40;
      reason = `⚠️ Domain sangat baru (${ageLabel}). Domain yang baru dibuat < 7 hari sangat berisiko tinggi — ini pola umum website scam/phishing.`;
    } else if (ageInDays < 30) {
      riskLevel = "medium";
      riskScore = 20;
      reason = `⚠️ Domain baru dibuat (${ageLabel}). Domain berumur < 30 hari patut diwaspadai karena scammer sering membuat domain baru untuk menghindari blacklist.`;
    } else if (ageInDays < 90) {
      riskLevel = "none";
      riskScore = 5;
      reason = `Domain berumur ${ageLabel}. Tergolong masih muda tapi sudah melewati threshold kritis.`;
    } else {
      riskLevel = "none";
      riskScore = 0;
      reason = `Domain sudah berumur ${ageLabel}. Umur domain yang cukup lama merupakan indikator positif.`;
    }

    return {
      domain,
      createdAt: eventToUse.eventDate,
      ageInDays,
      ageLabel,
      riskLevel,
      riskScore,
      reason,
      source: "rdap",
    };
  } catch (err) {
    // Jika RDAP gagal (domain private WHOIS, timeout, dll)
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    // Jangan anggap error sebagai risiko — return neutral
    return {
      domain,
      createdAt: null,
      ageInDays: null,
      ageLabel: "Tidak dapat dicek",
      riskLevel: "none",
      riskScore: 0,
      reason: `Umur domain tidak dapat diverifikasi (${errorMessage}). Ini bisa karena registrar menggunakan WHOIS privacy atau tidak mendukung RDAP.`,
      source: "error",
    };
  }
}