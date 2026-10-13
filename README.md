# lelepakabi

Katalog bibit lele per kantong dan dashboard admin untuk mencatat penjualan manual dari WhatsApp, invoice, keuangan, pengeluaran, dan stok.

Lokasi usaha: Jl. Kali Buaran, RT.10/RW.7, Penggilingan, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13940 (lihat [Google Maps](https://www.google.com/maps/search/?api=1&query=Bibit+Lele+pak+abi%2C+Jl.+Kali+Buaran%2C+Penggilingan%2C+Cakung%2C+Jakarta+Timur)). Buka setiap hari 07.00–23.00 WIB. WhatsApp: +62 821-2304-0643.

## Arsitektur

- **Frontend**: React + Vite (`src/`), dibangun ke `dist/`.
- **Backend**: Cloudflare Worker (`worker/index.js`) dengan endpoint JSON di `/api/*`. Static assets disajikan oleh Workers Static Assets; route SPA `/adminlele` dilayani `index.html`.
- **Database**: Cloudflare D1 (SQLite). Skema di `migrations/`:
  - `0001_init.sql`: tabel `products`, `transactions`, `expenses`.
  - `0002_seed_catalog.sql`: katalog awal saja. Tidak ada data transaksi atau pengeluaran contoh.
- **Autentikasi admin**: kata sandi dicek di server (secret `ADMIN_PASSWORD`). Sesi berupa cookie `HttpOnly` yang ditandatangani HMAC dan bertahan 30 hari di browser.

## Aturan bisnis

- Penjualan dicatat manual oleh admin. Harga per kantong diambil dari katalog **di server**, lalu dihitung `jumlah × harga − diskon + ongkir`. Diskon nominal atau persen tidak bisa melebihi subtotal.
- **Stok tidak berubah otomatis.** Membuat transaksi maupun mengubah statusnya (termasuk **Selesai**) tidak menyentuh tabel `products`. Stok hanya diubah lewat **Stok & katalog**.
- Semua tautan WhatsApp pelanggan memakai `6282123040643`.

## Menjalankan secara lokal (Cloudflare)

```bash
npm ci
cp .dev.vars.example .dev.vars          # isi ADMIN_PASSWORD untuk lokal
npm run db:migrate:local                 # buat tabel D1 lokal
npm run cloudflare:dev                   # build + Worker di http://localhost:8787
```

Untuk pengembangan frontend dengan hot reload, jalankan `npm run cloudflare:dev` di satu terminal, lalu `npm run dev` di terminal lain. Vite meneruskan `/api` ke port 8787.

## Deploy ke Cloudflare

1. Buat database D1 sekali saja:
   ```bash
   npx wrangler d1 create lelepakabi
   ```
   Salin `database_id` yang dikembalikan ke `wrangler.jsonc` (menggantikan nilai placeholder).
2. Simpan kata sandi admin sebagai secret (jangan ditulis di repo):
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   # opsional: npx wrangler secret put SESSION_SECRET
   ```
3. Terapkan migrasi ke database remote dan deploy:
   ```bash
   npm run db:migrate:remote
   npm run deploy
   ```

Autentikasi Wrangler perlu tersedia di mesin deploy (`npx wrangler login`, atau `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID`).

## Mode demo (GitHub Pages)

GitHub Pages hanya menyajikan file statis dan tidak punya API. Workflow `.github/workflows/deploy-pages.yml` membangun dengan `VITE_DEMO_MODE=true`. Dalam mode ini data disimpan di `localStorage` browser dan kata sandi demo `lelepakabi` berlaku. Mode ini **bukan autentikasi produksi**, karena kata sandi ikut ada di bundle frontend. Gunakan build Cloudflare untuk data sungguhan.

Dashboard admin dibuka di `/adminlele`. Tidak ada tombol admin di halaman toko.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Vite dev server (meneruskan `/api` ke 8787) |
| `npm run build` | Build frontend ke `dist/` |
| `npm run cloudflare:dev` | Build lalu jalankan Worker + D1 lokal |
| `npm run db:migrate:local` / `:remote` | Terapkan migrasi D1 |
| `npm run deploy` | Build lalu deploy ke Cloudflare |
