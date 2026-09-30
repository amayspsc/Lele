# lelepakabi

Website katalog bibit lele dengan storefront publik dan dashboard admin untuk mengelola transaksi, invoice, keuangan, pengeluaran, harga, dan stok.

## Menjalankan secara lokal

```bash
npm ci
npm run dev
```

## Dashboard admin demo

Klik **Admin** pada header atau **Area admin** di footer. Untuk demo, gunakan:

- Email: `admin@lelepakabi.id`
- Password: `lelepakabi`

Dashboard menyediakan:

- **Transaksi:** catat pesanan, cari/filter transaksi, ubah status, dan buat invoice.
- **Invoice:** pratinjau invoice dan cetak/simpan sebagai PDF.
- **Keuangan:** ringkasan pemasukan dari transaksi yang sudah dibayar, pengeluaran, dan estimasi laba.
- **Pengeluaran:** catat dan hapus biaya usaha.
- **Stok & katalog:** ubah stok kantong, harga, serta status bibit. Stok berkurang saat transaksi ditandai selesai.

Data katalog, transaksi, dan pengeluaran disimpan di `localStorage` browser, sehingga demo ini hanya tersimpan pada perangkat/browser yang digunakan dan tidak dibagikan ke admin lain. Login demo hanya untuk prototipe; jangan gunakan sebagai autentikasi untuk data atau transaksi produksi.

## Deploy ke GitHub Pages

GitHub Pages dikonfigurasi menggunakan **GitHub Actions**. Workflow `.github/workflows/deploy-pages.yml` membangun aplikasi dengan `npm ci` dan `npm run build`, lalu mengirim folder `dist` ke Pages pada push ke branch `main` atau branch kerja Arena aktif.
