import fs from 'fs';
import path from 'path';

const datasetDir = path.join(process.cwd(), 'test-dataset');
const safeDir = path.join(datasetDir, 'safe');
const scamDir = path.join(datasetDir, 'scam');

const safeTemplates = [
  "Halo mas, paketnya udah sampai ya ditaruh di depan pintu. Makasih.",
  "Jangan lupa besok ada meeting jam 10 pagi di ruang kaca.",
  "Makan siang mau nitip apa? Aku lagi di warteg depan.",
  "Bro, pinjem charger dong sebentar, baterai sisa 5% nih.",
  "Maaf mengganggu, apakah ini benar dengan Budi? Saya teman lamanya dari kampus.",
  "Pak, laporan bulan ini sudah saya email ya, mohon dicek.",
  "Uang kas bulan ini udah ditransfer ya. Cek aja.",
  "Hai, aku udah transfer uang buku Rp 150.000 ya.",
  "Selamat pagi, mengingatkan jadwal kontrol dokter gigi hari ini jam 4 sore.",
  "Paket atas nama Dika sudah diterima oleh resepsionis."
];

const scamTemplates = [
  "Selamat! Nomor Anda terpilih memenangkan undian Rp 100 juta dari Bank BCA. Klik tautan ini untuk klaim hadiah: http://bit.ly/klaim-bca",
  "Peringatan! Akun WhatsApp Anda akan diblokir dalam 24 jam. Segera verifikasi data diri Anda di link berikut.",
  "Halo kak, kami dari Shopee. Anda mendapatkan bonus saldo Rp 2.000.000 khusus hari ini. Balas PESAN ini untuk pencairan.",
  "Raffi Ahmad bagi-bagi uang tunai 50 juta untuk 10 orang pertama. Klik link di bawah dan isi data diri Anda.",
  "Paket Anda tertahan di Bea Cukai. Mohon segera transfer biaya denda sebesar Rp 500.000 ke rekening berikut agar paket tidak hangus.",
  "PENGUMUMAN RESMI KOMINFO: Nomor Anda masuk daftar blokir. Segera hubungi customer service kami dan sebutkan kode OTP Anda.",
  "Kami dari kepolisian mendeteksi transaksi mencurigakan di rekening Anda. Segera amankan saldo Anda dengan mengklik tautan berikut.",
  "Halo, Anda adalah pemenang undian Telkomsel poin! Kirimkan nomor KTP dan PIN Anda untuk memproses hadiah khusus ini.",
  "Kesempatan eksklusif! Gabung grup VIP investasi kripto sekarang sebelum pendaftaran ditutup selamanya.",
  "Mohon segera login ke akun m-banking Anda melalui link ini untuk verifikasi keamanan rutin."
];

function generateDataset() {
  if (!fs.existsSync(safeDir)) fs.mkdirSync(safeDir, { recursive: true });
  if (!fs.existsSync(scamDir)) fs.mkdirSync(scamDir, { recursive: true });

  console.log("Generating 100 Safe Examples...");
  for (let i = 1; i <= 100; i++) {
    const text = safeTemplates[i % safeTemplates.length] + ` [Variasi ${i}]`;
    fs.writeFileSync(path.join(safeDir, `safe_${i}.txt`), text);
  }

  console.log("Generating 100 Scam Examples...");
  for (let i = 1; i <= 100; i++) {
    const text = scamTemplates[i % scamTemplates.length] + ` [Variasi ${i}]`;
    fs.writeFileSync(path.join(scamDir, `scam_${i}.txt`), text);
  }
  
  console.log("Dataset generated successfully!");
}

generateDataset();
