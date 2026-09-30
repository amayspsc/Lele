import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../main.jsx';

// Freeze "today" so the seeded September 2026 data is the current period.
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 30, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const login = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Admin' }));
  await user.type(screen.getByLabelText(/Kata sandi/), 'lelepakabi');
  await user.click(screen.getByRole('button', { name: /Masuk ke dashboard/ }));
  await screen.findByRole('heading', { name: /Selamat datang kembali/ });
};

const goTo = (container, name) => {
  const sidebar = within(container.querySelector('.admin-sidebar'));
  fireEvent.click(sidebar.getByRole('button', { name }));
};

describe('masuk ke dashboard admin', () => {
  it('menolak kata sandi salah dan menerima kata sandi demo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    await user.type(screen.getByLabelText(/Kata sandi/), 'salah');
    await user.click(screen.getByRole('button', { name: /Masuk ke dashboard/ }));
    expect(screen.getByText(/Kata sandi belum tepat/)).toBeTruthy();

    await user.clear(screen.getByLabelText(/Kata sandi/));
    await user.type(screen.getByLabelText(/Kata sandi/), 'lelepakabi');
    await user.click(screen.getByRole('button', { name: /Masuk ke dashboard/ }));
    await screen.findByRole('heading', { name: /Selamat datang kembali/ });
  });

  it('menampilkan metrik ringkasan dari data seed', async () => {
    const user = userEvent.setup();
    render(<App />);
    await login(user);
    expect(screen.getByText('Kas masuk bulan ini')).toBeTruthy();
    expect(screen.getByText('Rp 8,5 jt')).toBeTruthy();
    expect(screen.getByText('Piutang berjalan')).toBeTruthy();
  });
});

describe('admin transaksi', () => {
  it('menampilkan daftar transaksi beserta total dan sisa tagihan', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Transaksi/);

    await screen.findByText('INV/2026/0005');
    expect(screen.getByText('INV/2026/0011')).toBeTruthy();
    expect(screen.getByText('Rp 13.685.000')).toBeTruthy();
    expect(screen.getByText('Rp 8.310.000')).toBeTruthy();
  });

  it('membuat transaksi baru dengan nomor invoice berikutnya', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Transaksi/);
    await screen.findByText('INV/2026/0005');

    await user.click(screen.getByRole('button', { name: /Transaksi baru/ }));
    await user.type(screen.getByLabelText('Nama pelanggan'), 'Toko Berkah Lele');
    await user.type(screen.getByLabelText('Kota'), 'Bogor');

    const qty = container.querySelector('.line-row:not(.line-head) input[type="number"]');
    await user.clear(qty);
    await user.type(qty, '3');

    await user.click(screen.getByRole('button', { name: /Buat transaksi/ }));
    await screen.findByText('INV/2026/0012');
    expect(screen.getByText('Toko Berkah Lele')).toBeTruthy();
    expect(screen.getByText(/Transaksi INV\/2026\/0012 dibuat/)).toBeTruthy();
  });

  it('mencatat pembayaran sampai lunas', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Transaksi/);
    await screen.findByText('INV/2026/0009');

    const row = screen.getByText('INV/2026/0009').closest('tr');
    fireEvent.click(within(row).getByTitle('Catat pembayaran'));
    await screen.findByText(/Catat pembayaran · INV\/2026\/0009/);

    await user.click(screen.getByRole('button', { name: /Isi penuh/ }));
    await user.click(screen.getByRole('button', { name: /Simpan pembayaran/ }));

    await waitFor(() => expect(screen.getByText(/Pembayaran Rp 2.135.000 dicatat/)).toBeTruthy());
    expect(screen.getByText('INV/2026/0009').closest('tr').textContent).toContain('Lunas');
    expect(screen.getByText('INV/2026/0009').closest('tr').textContent).not.toContain('Rp 1.435.000');
  });

  it('mengurangi stok saat transaksi dibuat dengan status selesai', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Transaksi/);
    await screen.findByText('INV/2026/0005');

    await user.click(screen.getByRole('button', { name: /Transaksi baru/ }));
    await user.type(screen.getByLabelText('Nama pelanggan'), 'Kolam Sentosa');
    const qty = container.querySelector('.line-row:not(.line-head) input[type="number"]');
    await user.clear(qty);
    await user.type(qty, '4');
    await user.selectOptions(screen.getByLabelText('Status pesanan'), 'Selesai');
    await user.click(screen.getByRole('button', { name: /Buat transaksi/ }));
    await screen.findByText('INV/2026/0012');

    const before = stockOnHandFromStorage(1);
    goTo(container, /^Stok/);
    await screen.findByText('Stok bibit');
    expect(stockOnHandFromStorage(1)).toBe(before);

    const movements = JSON.parse(localStorage.getItem('lelepakabi-movements'));
    const keluar = movements.filter((m) => m.ref === 'INV/2026/0012');
    expect(keluar).toHaveLength(1);
    expect(keluar[0]).toMatchObject({ type: 'Keluar', qty: 4, productId: 1 });
  });
});

describe('admin invoice', () => {
  it('membuka dokumen invoice lengkap dengan rincian tagihan', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, 'Invoice');

    await screen.findByText('INV/2026/0007');
    fireEvent.click(screen.getByText('INV/2026/0007'));

    await screen.findByText('Ditagihkan kepada');
    const doc = container.querySelector('#invoice-print');
    expect(doc).toBeTruthy();
    expect(doc.textContent).toContain('Siti Halimah');
    expect(doc.textContent).toContain('INV/2026/0007');
    expect(doc.textContent).toContain('Total tagihan');
    expect(doc.textContent).toContain('Rp 2.015.000');
    expect(doc.textContent).toContain('Sisa tagihan');
  });

  it('mengelompokkan piutang berdasarkan umur tagihan', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, 'Invoice');

    await screen.findByText('Umur 1–7 hari');
    expect(screen.getByText('Umur > 30 hari')).toBeTruthy();
    expect(screen.getAllByText('Rp 2.015.000').length).toBeGreaterThan(0);
  });
});

describe('admin keuangan', () => {
  it('menyajikan laba bersih dan saldo kas', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, 'Keuangan');

    await screen.findByText('Laba bersih', { selector: '.metric-label' });
    expect(screen.getByText('Kas masuk', { selector: '.metric-label' })).toBeTruthy();
    expect(screen.getByText('Rp 13,8 jt')).toBeTruthy();
    expect(screen.getByText('Arus kas 6 bulan')).toBeTruthy();
    expect(screen.getByText('Komposisi pengeluaran')).toBeTruthy();
  });

  it('menurunkan laba bersih setelah pengeluaran baru dicatat', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);

    goTo(container, 'Pengeluaran');
    await screen.findByText('Catatan pengeluaran');
    await user.click(screen.getByRole('button', { name: /Catat pengeluaran/ }));
    await user.type(screen.getByLabelText('Keterangan'), 'Perbaikan pompa kolam 2');
    await user.type(screen.getByLabelText('Jumlah (Rp)'), '1420000');
    await user.click(screen.getByRole('button', { name: /Simpan pengeluaran/ }));
    await screen.findByText(/EXP-0010 dicatat/);

    goTo(container, 'Keuangan');
    await screen.findByText('Laba bersih', { selector: '.metric-label' });
    expect(screen.getAllByText('Rp 0').length).toBeGreaterThan(0);
    expect(screen.getByText('Perbaikan pompa kolam 2')).toBeTruthy();
  });
});

describe('admin pengeluaran', () => {
  it('memfilter catatan berdasarkan kategori', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, 'Pengeluaran');

    await screen.findByText('Catatan pengeluaran');
    // 3 catatan listrik: 14 Agu, 5 Sep, 27 Sep.
    expect(screen.getAllByText('Listrik kolam & pompa')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: /Transportasi/ }));
    expect(screen.queryByText('Listrik kolam & pompa')).toBeNull();
    expect(screen.getByText('Sewa pick-up pengiriman')).toBeTruthy();
  });

  it('menghapus catatan pengeluaran', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, 'Pengeluaran');

    await screen.findByText('Catatan pengeluaran');
    const row = screen.getByText('Sewa pick-up pengiriman').closest('tr');
    fireEvent.click(within(row).getByTitle('Hapus'));

    await waitFor(() => expect(screen.queryByText('Sewa pick-up pengiriman')).toBeNull());
  });
});

describe('admin stok', () => {
  it('menampilkan stok siap jual setelah dikurangi pesanan berjalan', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Stok/);

    await screen.findByText('Stok bibit');
    expect(screen.getByText('79 kantong')).toBeTruthy();
    expect(screen.getByText('34 kantong')).toBeTruthy();
    expect(screen.getByText(/3 ukuran bibit perlu restok/)).toBeTruthy();
  });

  it('menambah stok lewat mutasi masuk', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Stok/);
    await screen.findByText('Stok bibit');

    await user.click(screen.getByRole('button', { name: /Catat mutasi/ }));
    await user.clear(screen.getByLabelText('Jumlah (kantong)'));
    await user.type(screen.getByLabelText('Jumlah (kantong)'), '10');
    await user.click(screen.getByRole('button', { name: /Simpan mutasi/ }));

    await waitFor(() => expect(screen.getByText('89 kantong')).toBeTruthy());
  });
});

describe('admin katalog', () => {
  it('menyimpan harga baru ke localStorage agar tampil di toko', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await login(user);
    goTo(container, /^Katalog bibit/);

    await screen.findByText('Harga & ketersediaan');
    const priceInput = container.querySelector('.data-table .price-input input');
    await user.clear(priceInput);
    await user.type(priceInput, '195000');
    await user.click(screen.getByRole('button', { name: /Simpan katalog/ }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('lelepakabi-products'));
      expect(stored.find((p) => p.id === 1).price).toBe(195000);
    });
  });
});

describe('etalase publik', () => {
  it('menampilkan sisa stok dari data admin', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Ukuran yang pas,');
    expect(screen.getByText('Menunggu stok masuk')).toBeTruthy();
    expect(screen.getByText(/Siap kirim · 25 kantong/)).toBeTruthy();
    expect(screen.getByText(/Sisa 1 kantong/)).toBeTruthy();
  });
});

function stockOnHandFromStorage(productId) {
  const movements = JSON.parse(localStorage.getItem('lelepakabi-movements') || '[]');
  return movements
    .filter((m) => m.productId === productId)
    .reduce((sum, m) => sum + (m.type === 'Keluar' ? -1 : 1) * (Number(m.qty) || 0), 0);
}
