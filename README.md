# Aplikasi Absensi Berbasis QR Code (HTML Murni + Supabase)

Aplikasi web presensi instan tanpa instalasi runtime Node.js. Menggunakan HTML5, Tailwind CSS CDN, Supabase JS Client, dan QRCode Generator.

---

## 📁 File yang Tersedia
1. **`index.html`** - Portal Admin (Login Admin, Buat Sesi, Generate QR Code, Live Realtime Monitor Kehadiran).
2. **`absen.html`** - Halaman Input Presensi Peserta (Validasi Token QR, Proteksi Anti-Titip Absen / 1 Device 1 Absen).
3. **`database.sql`** - Skrip database lengkap (Tabel, Relasi, Constraint Unik, RLS, dan Realtime Publication).

---

## 🚀 Cara Menjalankan

### Langkah 1: Siapkan Database di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat project baru (gratis).
2. Masuk ke menu **SQL Editor** di panel kiri.
3. Buka file `database.sql`, salin seluruh kodenya dan klik **Run**.
   *(Skrip ini sudah otomatis membuat tabel, keamanan RLS, dan akun admin default).*

### Kredensial Default Admin:
- **Email:** `admin@absensi.com`
- **Password:** `admin123456`

*(Kredensial ini sudah otomatis terisi di halaman login `index.html`).*

### Langkah 2: Ambil API Keys Supabase
1. Masuk ke menu **Project Settings > API**.
2. Salin **Project URL** dan **anon public key**.

### Langkah 3: Jalankan Web
1. Cukup klik ganda (double-click) file **`index.html`** untuk membukanya di browser (Chrome/Edge/Firefox).
2. Di bagian atas layar terdapat banner **"Ubah Konfigurasi API"**: klik tombol tersebut lalu tempelkan URL & Anon Key Supabase Anda, kemudian klik **Simpan**.
3. Jika Anda belum menjalankan skrip SQL admin, Anda cukup mengklik tombol **"Daftarkan Akun Admin Ini ke Supabase"** langsung dari tampilan login, atau langsung klik **"Masuk ke Dashboard"**.
4. Buat sesi absensi baru dan klik **Tampilkan QR Code**.
5. Scan QR code dengan kamera HP Anda untuk membuka **`absen.html?token=...`**.

---

## 🔒 Cara Kerja Proteksi Anti-Kecurangan (Anti-Fraud)
- **Persistent Device UUID**: Token acak disimpan di `localStorage` perangkat.
- **Hardware/Browser Entropy Fingerprint**: Menghitung hash SHA-256 dari resolusi layar, GPU canvas render, user agent, dan timezone.
- **Postgres Database Constraint**: Database memiliki aturan `UNIQUE(session_id, device_uuid)` dan `UNIQUE(session_id, device_fingerprint)`. Jika satu smartphone mencoba mengisi absensi kedua kalinya (walaupun nama berbeda atau cache dibersihkan), sistem akan langsung menolak secara otomatis.
