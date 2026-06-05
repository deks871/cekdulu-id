import * as https from "https";
import * as http from "http";
import { URL } from "url";
import * as tls from "tls";

export interface FetchDiagnostics {
  status: "SUCCESS" | "FAILED" | "TIMEOUT";
  statusCode: number | null;
  redirectCount: number;
  failureReason: string | null;
  hasSslError: boolean;
  sslErrorDetails: string | null;
  html: string | null;
}

export async function fetchDiagnostic(targetUrl: string, maxRedirects = 5): Promise<FetchDiagnostics> {
  let currentUrl = targetUrl;
  let redirects = 0;
  let hasSslError = false;
  let sslErrorDetails: string | null = null;
  
  return new Promise((resolve) => {
    const doRequest = (urlStr: string) => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(urlStr);
      } catch (e: any) {
        return resolve({
          status: "FAILED",
          statusCode: null,
          redirectCount: redirects,
          failureReason: `Format URL tidak valid: ${e.message}`,
          hasSslError,
          sslErrorDetails,
          html: null
        });
      }

      const isHttps = parsedUrl.protocol === "https:";
      const requester = isHttps ? https : http;

      const options: https.RequestOptions = {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        timeout: 5000,
        rejectUnauthorized: false // Bypass strict SSL to fetch content from poorly configured phishing sites
      };

      const req = requester.request(parsedUrl, options, (res) => {
        // Capture SSL verification failure
        if (isHttps) {
          const tlsSocket = res.socket as tls.TLSSocket;
          if (tlsSocket && !tlsSocket.authorized) {
            hasSslError = true;
            sslErrorDetails = tlsSocket.authorizationError?.toString() || "Unknown SSL Error";
          }
        }

        const statusCode = res.statusCode || 500;
        
        // Handle Redirects
        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          if (redirects >= maxRedirects) {
            return resolve({
              status: "FAILED",
              statusCode,
              redirectCount: redirects,
              failureReason: "Terlalu banyak pengalihan (Too many redirects). Taktik ini sering digunakan untuk menyembunyikan URL tujuan akhir.",
              hasSslError,
              sslErrorDetails,
              html: null
            });
          }
          
          redirects++;
          let nextUrl = res.headers.location;
          // Handle relative redirects
          if (!nextUrl.startsWith('http')) {
            nextUrl = new URL(nextUrl, urlStr).toString();
          }
          return doRequest(nextUrl);
        }

        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          let failureReason = null;
          let status: "SUCCESS" | "FAILED" = "SUCCESS";

          if (statusCode >= 400) {
            status = "FAILED";
            // Detect Cloudflare / WAF
            const serverHeader = Array.isArray(res.headers.server) ? res.headers.server.join(',') : (res.headers.server || '');
            if (statusCode === 403 && (serverHeader.toLowerCase().includes('cloudflare') || body.toLowerCase().includes('cloudflare'))) {
              failureReason = "Akses diblokir oleh sistem anti-bot (Cloudflare 403 Forbidden). Situs mencoba menyembunyikan konten dari pemindaian.";
            } else if (statusCode === 403) {
              failureReason = "Akses ditolak (403 Forbidden). Kemungkinan situs memblokir akses bot otomatis.";
            } else if (statusCode === 404) {
              failureReason = "Halaman tidak ditemukan (404 Not Found). Tautan mungkin sudah dihapus atau sengaja disembunyikan.";
            } else {
              failureReason = `Server mengembalikan status error (${statusCode}).`;
            }
          }

          // Even if status >= 400, we still return the HTML! Some phishing pages show fake content on 404/403.
          resolve({
            status,
            statusCode,
            redirectCount: redirects,
            failureReason,
            hasSslError,
            sslErrorDetails,
            html: body
          });
        });
      });

      req.on("error", (err: any) => {
        let failureReason = err.message;
        let isSsl = false;

        // Fallback catch for extreme SSL errors that throw despite rejectUnauthorized: false
        if (err.code === "CERT_HAS_EXPIRED" || err.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || err.code === "DEPTH_ZERO_SELF_SIGNED_CERT" || err.message.includes("SSL") || err.message.includes("certificate")) {
          isSsl = true;
          hasSslError = true;
          sslErrorDetails = err.message;
          failureReason = "Kegagalan negosiasi SSL/TLS. Sertifikat sangat tidak aman atau tidak sesuai standar HTTPS.";
        } else if (err.code === "ECONNRESET") {
          failureReason = "Koneksi diputus secara sepihak oleh server (Connection Reset).";
        } else if (err.code === "ENOTFOUND") {
          failureReason = "Domain tidak dapat ditemukan (DNS lookup failed). Situs mungkin belum aktif atau sudah diblokir ISP.";
        }

        resolve({
          status: "FAILED",
          statusCode: null,
          redirectCount: redirects,
          failureReason,
          hasSslError,
          sslErrorDetails,
          html: null
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          status: "TIMEOUT",
          statusCode: null,
          redirectCount: redirects,
          failureReason: "Koneksi terputus karena batas waktu habis (Timeout). Server lambat merespons atau tidak aktif.",
          hasSslError,
          sslErrorDetails,
          html: null
        });
      });

      req.end();
    };

    doRequest(currentUrl);
  });
}
