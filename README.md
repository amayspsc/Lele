# lelepakabi

Katalog bibit lele dan dashboard demo untuk transaksi, invoice, keuangan, pengeluaran, dan stok. Lokasi usaha: Penggilingan, Cakung, Jakarta Timur.

## Menjalankan secara lokal

```bash
npm ci
npm run dev
```

## Dashboard admin demo

Buka `/adminlele` pada domain situs, lalu masuk menggunakan:

- Email: `admin@lelepakabi.id`
- Password demo: `lelepakabi`

Sesi admin disimpan di browser sampai admin memilih **Keluar** atau data situs dibersihkan. Tidak ada tombol admin di storefront; akses dashboard menggunakan alamat langsung `/adminlele`.

Dashboard menyediakan transaksi dan perubahan status, pratinjau/cetak invoice, ringkasan keuangan, catatan pengeluaran, serta pengelolaan harga dan stok. Status transaksi **Selesai** mengurangi stok. Data katalog, transaksi, dan pengeluaran disimpan di `localStorage` browser, jadi data demo hanya tersedia di browser/perangkat tersebut.

> **Keamanan:** aplikasi ini berupa frontend statis. Login demo dan sesi browser bukan autentikasi produksi—kata sandi dapat ditemukan di bundle frontend dan data admin tidak terlindungi dari pengunjung yang cukup teknis. Gunakan backend/autentikasi server sebelum menyimpan data atau transaksi sensitif.

## Lokasi dan kontak

- Alamat: Jl. Kali Buaran, RT.10/RW.7, Penggilingan, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13940
- Buka setiap hari: 07.00–23.00 WIB
- WhatsApp: +62 821-2304-0643

## Deploy ke GitHub Pages

GitHub Pages menggunakan GitHub Actions melalui `.github/workflows/deploy-pages.yml`. Workflow membangun aplikasi dengan `npm ci` dan `npm run build`, lalu mengunggah `dist`. `public/404.html` mempertahankan route `/adminlele` ketika dibuka langsung di GitHub Pages.
