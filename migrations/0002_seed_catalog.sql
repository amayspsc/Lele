-- Starting catalog only. No demo customers, sales or expenses are seeded.
INSERT OR IGNORE INTO products (id, size, category, price, status, stock, note, accent, popular, sort_order) VALUES
  (1, '3–4 cm', 'Bibit kecil', 180000, 'Tersedia', 120, 'Cocok untuk pemula', 'mint', 0, 1),
  (2, '4–5 cm', 'Bibit favorit', 215000, 'Tersedia', 86, 'Paling banyak dipesan', 'orange', 1, 2),
  (3, '5–6 cm', 'Bibit pembesaran', 260000, 'Pre-order', 34, 'Lebih cepat dibesarkan', 'blue', 0, 3),
  (4, '7–8 cm', 'Bibit ukuran besar', 340000, 'Tidak tersedia', 0, 'Stok sedang kosong', 'violet', 0, 4);
