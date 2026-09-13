# Soyuzu — Konten UI

Edit teks di bawah ini, lalu simpan. Perubahan akan otomatis diterapkan ke `index.html`.

## Cara menjalankan (penerapan otomatis)

```
npm run watch
```

- Berjalan di terminal dan menunggu perubahan.
- Setiap kali `content.md` disimpan, `index.html` langsung diperbarui.
- Untuk menerapkan sekali tanpa menonton: `npm run apply`.
- Tidak butuh instalasi — cukup Node.js.

---

> **Cara pakai**
> - Setiap baris tabel berformat: `| Selector | Teks |`
> - `Teks` boleh berisi markup HTML sederhana: `<em>kata</em>` (miring), `<br />` (baris baru), `<span>…</span>`, `→`.
> - Jangan hapus atau ubah kolom Selector — itu penunjuk lokasi.
> - Hindari karakter `|` di dalam teks (gunakan `\|` jika terpaksa).

---

## 1. Navigasi

| Selector | Teks |
| --- | --- |
| `.nav-brand-name` | `soyuzu<em>/</em>tech` |
| `.nav-links a[href="#layanan"]` | `Layanan` |
| `.nav-links a[href="#karya"]` | `Karya` |
| `.nav-links a[href="#proses"]` | `Proses` |
| `.nav-cta` | `Mulai proyek <span aria-hidden="true">→</span>` |
| `.mobile-menu a[href="#layanan"]` | `Layanan` |
| `.mobile-menu a[href="#karya"]` | `Karya` |
| `.mobile-menu a[href="#proses"]` | `Proses` |
| `.mobile-menu-cta` | `Mulai proyek <span aria-hidden="true">→</span>` |

---

## 2. Hero

| Selector | Teks |
| --- | --- |
| `.hero-eyebrow` | `<span class="hero-eyebrow-dot"></span>Digital studio / Indonesia — Global` |
| `#hero-title` | `Desain yang <em>berani.</em><br />Teknologi yang <em>serius.</em>` |
| `.hero-text` | `Kami memadukan selera fashion dengan presisi teknik — membuat website dan produk digital yang sulit dilupakan.` |
| `.hero-cta` | `Mulai sesuatu yang indah <span aria-hidden="true">→</span>` |
| `.hero-visual-kicker` | `Now showing` |
| `.hero-visual-glass strong` | `Fall / Digital` |
| `.hero-visual-meta` | `Soyuzu Edition 001` |
| `.hero-visual-caption` | `Runway of pixels — 2026` |

### Marquee (diulang 2× untuk loop — pisahkan item dengan `;`)
| Selector | Teks |
| --- | --- |
| `.marquee-track` | `Digital fashion; Web experience; Creative code; Visual identity; E-commerce` |

---

## 3. Manifesto

| Selector | Teks |
| --- | --- |
| `.manifesto .section-kicker` | `Manifesto` |
| `#manifesto-title` | `Website adalah panggung, dan brand Anda adalah <em>bintangnya.</em>` |
| `.manifesto-text` | `Kami menata cahaya, panggung, dan cerita — lalu membangun teknologi di baliknya agar semuanya terasa mulus, mewah, dan hidup.` |

---

## 4. Layanan

| Selector | Teks |
| --- | --- |
| `.services .section-kicker` | `Layanan` |
| `#services-title` | `Apa yang bisa kami <em>buat indah.</em>` |

| Selector | Teks |
| --- | --- |
| `.service-card:nth-child(1) h3` | `Brand experience` |
| `.service-card:nth-child(1) p` | `Website dan landing page dengan kehadiran visual yang terasa sejak detik pertama.` |
| `.service-card:nth-child(1) a` | `Eksplorasi <span aria-hidden="true">→</span>` |
| `.service-card:nth-child(2) h3` | `Digital product` |
| `.service-card:nth-child(2) p` | `Interface yang cantik, cepat, dan menyenangkan untuk dipakai setiap hari.` |
| `.service-card:nth-child(2) a` | `Eksplorasi <span aria-hidden="true">→</span>` |
| `.service-card:nth-child(3) h3` | `Visual identity &amp; motion` |
| `.service-card:nth-child(3) p` | `Sistem visual, tipografi, dan mikro-animasi yang memberi jiwa pada brand Anda.` |
| `.service-card:nth-child(3) a` | `Eksplorasi <span aria-hidden="true">→</span>` |

---

## 5. Karya

| Selector | Teks |
| --- | --- |
| `.work .section-kicker` | `Karya terpilih` |
| `#work-title` | `Koleksi <em>hasil kerja</em> kami.` |

| Selector | Teks |
| --- | --- |
| `.work-card:nth-child(1) .work-tag` | `E-commerce fashion` |
| `.work-card:nth-child(1) h3` | `Atelier` |
| `.work-card:nth-child(1) .work-meta p` | `Belanja online / 2025` |
| `.work-card:nth-child(2) .work-tag` | `Brand platform` |
| `.work-card:nth-child(2) h3` | `Runway ID` |
| `.work-card:nth-child(2) .work-meta p` | `Fashion week / 2025` |
| `.work-card:nth-child(3) .work-tag` | `Digital editorial` |
| `.work-card:nth-child(3) h3` | `Lumen` |
| `.work-card:nth-child(3) .work-meta p` | `Majalah digital / 2024` |

---

## 6. Proses

| Selector | Teks |
| --- | --- |
| `.process .section-kicker` | `Proses` |
| `#process-title` | `Dari ide, menjadi <em>busana digital.</em>` |

| Selector | Teks |
| --- | --- |
| `.process-step:nth-child(1) h3` | `Konsep` |
| `.process-step:nth-child(1) p` | `Riset, strategi, dan arah visual disepakati sebelum satu baris kode pun ditulis.` |
| `.process-step:nth-child(2) h3` | `Desain` |
| `.process-step:nth-child(2) p` | `Struktur, sistem visual, dan prototipe dibentuk agar terasa persis seperti brand Anda.` |
| `.process-step:nth-child(3) h3` | `Rilis` |
| `.process-step:nth-child(3) p` | `Dibangun, diuji, dioptimalkan, lalu diluncurkan dengan percaya diri.` |

---

## 7. Kontak

| Selector | Teks |
| --- | --- |
| `.contact-top span:nth-child(1)` | `Ready when you are` |
| `.contact-top span:nth-child(2)` | `hello@soyuzu.tech` |
| `.contact-copy .section-kicker` | `Kontak` |
| `#contact-title` | `Punya proyek yang layak <em>terlihat hebat?</em>` |
| `.contact-card-label` | `Email kami` |
| `.contact-email` | `hello@soyuzu.tech <span aria-hidden="true">→</span>` |
| `.contact-card p` | `Kami akan membalas pesan anda secepatnya.` |
| `.fastwork-brand` | `Fastwork` |
| `.fastwork-title` | `Pesan lewat Fastwork` |
| `.fastwork-sub` | `Web development — Soyuzu` |

---

## 8. Footer

| Selector | Teks |
| --- | --- |
| `.footer-brand span:nth-child(2)` | `soyuzu<em>/</em>tech` |
| `.footer > p` | `Fashion-forward digital studio.` |
| `.footer-meta a` | `Kembali ke atas ↑` |

> Catatan: `© {tahun}` di footer otomatis dari JavaScript — jangan diedit di sini.

---

## 9. Teks alternatif gambar (alt)

| Selector | Teks |
| --- | --- |
| `.hero-visual-frame img` | `Model berpose dengan cahaya hangat dalam balutan busana berani` |
| `.work-card:nth-child(1) img` | `Busana bermotif yang ditampilkan dalam editorial mode` |
| `.work-card:nth-child(2) img` | `Suasana editorial fashion dengan pencahayaan dramatis` |
| `.work-card:nth-child(3) img` | `Potret close-up dengan nuansa editorial yang bersih` |

---

## 10. Meta (tidak tampil di halaman)

| Selector | Teks |
| --- | --- |
| `title` | `Soyuzu Tech \| Fashion-forward digital studio` |
| `meta[name="description"]` | `Soyuzu Tech — studio digital yang menggabungkan mata fashion dengan otak teknologi untuk membuat website dan produk digital yang tak terlihat biasa.` |
