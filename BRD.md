# Business Requirements Document (BRD)

## Sistem Pelaporan Prospek Sales

Dokumen Persyaratan Bisnis (BRD) ini bertujuan untuk mendefinisikan kebutuhan fungsional, struktur data, serta arsitektur teknis dalam pengembangan Sistem Pelaporan Prospek Sales berbasis web.

---

### 1. Deskripsi & Tujuan Proyek

Sistem ini dikembangkan untuk menggantikan proses pencatatan manual laporan prospek sales yang sebelumnya dilakukan melalui grup pesan singkat (WhatsApp). Penggunaan media berbasis chat terbukti memiliki keterbatasan dalam hal konsistensi data, pelacakan histori, serta rekapitulasi secara _real-time_.

__Tujuan Utama Proyek:__

* __Sentralisasi Data__: Mengumpulkan seluruh data prospek penjualan ke dalam satu basis data terstruktur yang aman.
* __Efisiensi Entri Data__: Menyediakan antarmuka input yang cepat dan intuitif bagi tim Sales di lapangan melalui perangkat seluler (_mobile-first_).
* __Monitoring & Analisis__: Memberikan fasilitas visualisasi data dan laporan analitis bagi _Head of Administration_ untuk memantau kinerja sales dan status prospek secara efisien.
* __Otomatisasi Ekspor__: Mempermudah penarikan laporan operasional ke format dokumen spreadsheet (.xlsx) tanpa perlu kompilasi manual.

---

### 2. Hak Akses (Roles)

Sistem membagi batasan wewenang pengguna ke dalam dua tingkatan peran (_user roles_):

| Peran Pengguna | Tingkat Akses | Deskripsi Wewenang & Fungsi |
| :--- | :--- | :--- |
| __Sales__ | _Front-End Application_ | Memasukkan data prospek baru melalui perangkat seluler, melihat riwayat prospek pribadi, dan memperbarui status prospek yang dikelola. |
| __Admin (Head of Administration)__ | _Back-End Dashboard_ | Memantau seluruh rekapan data perusahaan, menganalisis performa tim sales, memeriksa indikasi duplikasi prospek, serta mengelola ekspor data. |

---

### 3. Struktur Data & Spesifikasi Field

Struktur data dirancang khusus untuk mengakomodasi analisis tingkat konversi (_deal / lost_) serta mendeteksi potensi duplikasi prospek yang masuk secara berulang.

* __Nama Sales__
  * _Tipe Data_: System Generated / Dropdown Selection
  * _Ketarangan_: Terisi otomatis berdasarkan akun pengguna yang aktif (_login session_), atau dipilih via dropdown jika diinput atas nama staf lain.
* __Nama Customer__
  * _Tipe Data_: Teks / String
  * _Keterangan_: Nama lengkap calon pembeli atau entitas bisnis prospek.
* __No. HP / WA Customer__ _(Wajib - Untuk Fitur Analisis Customer Journey)_
  * _Tipe Data_: Numeric / String Unique Identifier
  * _Keterangan_: Nomor kontak aktif customer. Berfungsi sebagai entitas unik (unique identifier) yang wajib diisi untuk melacak dan mengidentifikasi apakah seorang customer diinput secara berulang kali.
* __Prospek Unit__
  * _Tipe Data_: Dropdown Options
  * _Keterangan_: Pilihan produk atau jenis unit yang diminati oleh calon customer.
* __Tanggal Input__
  * _Tipe Data_: Timestamp (YYYY-MM-DD HH:MM:SS)
  * _Keterangan_: Terisi otomatis oleh sistem sesuai zona waktu lokal (Waktu Indonesia Barat / GMT+7).
* __Status Prospek__ _(Wajib)_
  * _Tipe Data_: Enumerated Dropdown (`New`, `Follow-up`, `Deal`, `Lost`)
  * _Keterangan_: Mengindikasikan tahapan alur penjualan. Field ini bersifat wajib diisi sesuai arahan pimpinan untuk memantau dan menganalisis hasil akhir prospek (Deal atau Lost).
* __Catatan__
  * _Tipe Data_: Text Area / Long Text (Opsional)
  * _Keterangan_: Catatan tambahan terkait kebutuhan spesifik customer, hasil interaksi, atau alasan status _lost_.

---

### 4. Alur Kerja Aplikasi (Workflow)

```text
[Sales] Entri Cepat (Mobile) ➜ [Sistem] Cek Duplikasi No. HP ➜ [Sistem] Notifikasi WhatsApp ➜ [Sales] Update Status Prospek
                                                                               │
[Admin] Ekspor Data (.xlsx)  ◄── [Admin] Analisis Dashboard  ◄─────────────────┘
```

1. __Entri Cepat (Mobile-First)__ \
Staf Sales mengakses halaman input utama melalui peramban HP atau secara langsung via pintasan PWA di layar utama (home screen) perangkat mereka. Form dirancang ringkas (memuat field Customer, No. HP, dan Unit) untuk memastikan proses input berlangsung cepat setara dengan kecepatan mengetik di aplikasi pesan instan.
2. __Deteksi Duplikasi Cerdas__ \
Sistem memproses nomor HP yang dimasukkan secara otomatis. Apabila Nomor HP tersebut sudah pernah diinput oleh staf sales lain dalam periode bulan yang berjalan, sistem akan memberikan penandaan (_flagging_) atau penyesuaian warna khusus pada baris data di _dashboard_ Admin, lengkap dengan badge frekuensi (contoh: Input ke-3) serta lini masa (timeline) yang dapat diklik untuk melihat riwayat perjalanan customer tersebut.
3. __Pembaruan Status (Follow-Up)__ \
Sales memiliki akses ke daftar prospek milik pribadi untuk memperbarui progres penawaran (misal: merubah status dari `New` menjadi `Follow-up` hingga mencapai kesepakatan `Deal`). _(Catatan: Fitur lanjutan ini bersifat usulan dan bergantung pada persetujuan penggunaan field Status Prospek)._
4. __Analisis Dashboard Admin__ \
Admin dapat mengakses ringkasan eksekutif yang menyajikan grafik tingkat konversi penutupan penjualan (_closing rate_) per Sales, performa bulanan, tabel rincian transaksi harian, serta fitur Analisis Prospek Berulang & Konversi untuk memantau status hasil akhir dari customer yang diinput berulang kali.
5. __Ekspor Data Excel__ \
Admin menentukan kriteria penyaringan (_filter_) berdasarkan rentang tanggal atau nama staf sales, kemudian mengunduh laporan berformat `.xlsx` yang telah tersusun secara rapi.
6. __Notifikasi Otomatis ke Grup WhatsApp__ \
Setelah staf Sales berhasil mengirimkan (submit) formulir prospek, sistem akan secara otomatis mengirimkan pesan pemberitahuan/siaran ke grup WhatsApp internal perusahaan (contoh: "Info: Sales A telah input prospek baru hari ini").

---

### 5. Rekomendasi Tech Stack & Arsitektur Sistem

Pengembangan sistem disarankan menggunakan kombinasi teknologi modern yang mendukung keandalan data serta responsivitas tinggi pada antarmuka pengguna:

* __Framework Aplikasi Utama__
  * __Full-stack TypeScript (Next.js)__: Menggunakan __Next.js__ (App Router / Server Actions) terintegrasi dengan __Tailwind CSS__. Stack ini memberikan pengalaman aplikasi yang cepat, responsif, berbasis _mobile-first_, serta menyatukan basis kode (_unified codebase_) untuk kebutuhan frontend maupun backend.
* __ORM & Basis Data (Database)__
  * Sangat direkomendasikan menggunakan __Prisma ORM__ atau __Drizzle ORM__ untuk manajemen kueri basis data yang aman (_type-safe_), dikombinasikan dengan __PostgreSQL__ atau __MySQL__ sebagai basis data relasional utama.
* __Infrastruktur & Server__
  * __Linux VPS (Virtual Private Server)__ sebagai lingkungan _hosting_ utama untuk menjaga kedaulatan, kerahasiaan, dan kontrol penuh atas keamanan data internal perusahaan.
* __Layanan Integrasi (Third-party)__
  * __WhatsApp API Gateway__: Integrasi dengan penyedia layanan WhatsApp API (seperti Fonnte, Wablas, atau WhatsApp Cloud API) untuk menangani pengiriman pesan notifikasi otomatis ke grup WhatsApp secara _real-time_.
* __Progressive Web App (PWA)__
  * Sistem WAJIB dibangun sebagai __Progressive Web App (PWA)__ agar dapat diinstal atau ditambahkan ke layar utama (_Add to Home Screen_) pada perangkat tim Sales. Hal ini memberikan pengalaman layaknya aplikasi native mobile untuk akses yang lebih cepat dan lancar tanpa perlu membuka peramban atau mengetik ulang URL secara berulang.

---

### 6. Rancangan Database (Skema Awal)

Untuk memastikan integritas data dan kemudahan pengembangan, skema awal dirancang menggunakan dua tabel utama:

* __Tabel `users`__
  * `id`: Primary Key (UUID / Auto Increment)
  * `name`: String (Nama lengkap pengguna)
  * `role`: Enum (`ADMIN`, `SALES`)
  * `username` / `email`: String (Unik untuk otentikasi login)
  * `password`: String (Hashed)
  * `created_at`: Timestamp (Waktu Indonesia Barat / GMT+7)
  * `updated_at`: Timestamp

* __Tabel `prospects`__
  * `id`: Primary Key (UUID / Auto Increment)
  * `user_id`: Foreign Key mengacu ke tabel `users`
  * `customer_name`: String (Nama calon customer / entitas bisnis)
  * `customer_phone`: String (Unique identifier untuk analisis customer journey)
  * `unit_name`: String (Jenis/tipe unit prospek)
  * `status`: Enum (`NEW`, `FOLLOW_UP`, `DEAL`, `LOST` - Default: `NEW`)
  * `notes`: Text (Nullable / Catatan tambahan)
  * `created_at`: Timestamp (Waktu Indonesia Barat / GMT+7)
  * `updated_at`: Timestamp

> [!NOTE]
> __Catatan Arsitektur Relasi:__ Penggunaan relasi kunci asing (_foreign key_ `user_id`) jauh lebih baik dibandingkan menyimpan nama sales secara langsung sebagai string. Pendekatan ini mencegah terjadinya kesalahan pengetikan (_typo_), menjaga konsistensi data entitas pengguna, serta mempermudah proses rekapitulasi dan filter laporan berdasarkan ID sales secara teratur.
