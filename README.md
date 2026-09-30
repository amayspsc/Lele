# lelepakabi

Website katalog bibit lele dengan storefront publik dan dashboard admin untuk mengelola
transaksi, invoice, keuangan, pengeluaran, dan stok bibit.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
```

Perintah lain:

```bash
npm test         # unit test logika + UI test dashboard (vitest)
npm run build    # build produksi ke ./dist
npm run preview  # pratinjau hasil build
```

## Dashboard admin

Klik **Admin** pada header atau **Area admin** di footer. Untuk demo, gunakan:

- Email: `admin@lelepakabi.id`
- Password: `lelepakabi`

### Modul

| Menu | Fungsi |
| --- | --- |
| **Ringkasan** | Metrik kas masuk, laba bersih, piutang, dan kondisi stok bulan berjalan, plus grafik arus kas 6 bulan. |
| **Transaksi** | Buat, ubah, dan hapus pesanan. Catat pembayaran (DP / lunas), ubah status pesanan, dan saring berdasarkan status. |
| **Invoice** | Semua tagihan yang terbit otomatis dari transaksi, lengkap dengan umur piutang (belum jatuh tempo, 1–7, 8–30, > 30 hari), cetak PDF, dan kirim via WhatsApp. |
| **Keuangan** | Arus kas per periode (bulan ini, bulan lalu, 3 bulan, semua): kas masuk, pengeluaran, laba bersih, saldo kas, komposisi biaya, laba kotor setelah HPP, dan daftar piutang. |
| **Pengeluaran** | Catatan biaya budidaya per kategori (pakan, bibit & indukan, listrik & air, obat, transportasi, operasional) dengan filter bulan dan kategori. |
| **Stok** | Ketersediaan per ukuran, stok dipesan vs siap dijual, peringatan batas aman, serta riwayat mutasi masuk/keluar/penyesuaian. |
| **Katalog bibit** | Harga jual, HPP, margin, dan status yang tampil di halaman publik. |

### Aturan bisnis

- **Nomor invoice** otomatis berformat `INV/<tahun>/<nomor urut 4 digit>`.
- **Stok siap dijual** = stok di kolam − qty pada transaksi berstatus *Menunggu konfirmasi*, *Diproses*, atau *Dikirim*.
- Transaksi berstatus **Selesai** otomatis membuat mutasi stok *Keluar*; pembatalan atau penghapusan menulis mutasi *Masuk* sebagai pembaliknya.
- **Laba bersih** = kas yang benar-benar diterima − pengeluaran pada periode yang sama. **Laba kotor** memakai HPP per ukuran bibit.
- **Saldo kas** = modal awal (`OPENING_CASH`, Rp 12.500.000) + total kas masuk − total pengeluaran.
- Invoice menjadi **Terlambat** bila melewati `dueDate` dan masih ada sisa tagihan.

Semua data disimpan di `localStorage` browser (kunci `lelepakabi-products`,
`lelepakabi-transactions`, `lelepakabi-expenses`, `lelepakabi-movements`) dan sudah berisi
data contoh. Tombol **Muat ulang data contoh** di sidebar mengembalikan data awal.

## Struktur kode

```
src/
  lib/format.js         # format rupiah, tanggal, periode
  lib/store.js          # model data + logika bisnis murni (invoice, stok, keuangan)
  lib/useAdminData.js   # state React + aksi (CRUD transaksi, pengeluaran, mutasi)
  components/ui.jsx     # Icon, Logo, Modal, Tag, MetricCard, dsb.
  admin/                # Dashboard, Overview, Transactions, Invoices, Finance,
                        # Expenses, Inventory, Catalog, InvoiceDocument
  main.jsx              # storefront publik + App
```

## Deployment

GitHub Pages di-deploy lewat **GitHub Actions** (`.github/workflows/deploy-pages.yml`):
job `test` → `build` → `deploy` memakai `actions/upload-pages-artifact` dan
`actions/deploy-pages`. Workflow terpicu pada push ke `main`, `arena/01a0f2ed-lele`, dan
`arena/01a0f31c-lele`. Sumber build Pages harus disetel ke **GitHub Actions**
(pengaturan *Pages → Build and deployment → Source*).

Situs terbit di <https://amayspsc.github.io/Lele/> — `base: './'` pada `vite.config.js`
membuat path aset relatif sehingga berjalan di sub-direktori proyek.
