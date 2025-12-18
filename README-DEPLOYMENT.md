# Deployment Guide - Buku Pembantu Bank MAN 2 Kota Tidore Kepulauan

## 📋 File Structure untuk Deployment

Pastikan semua file berikut ada di server:

### 🏠 Halaman Utama (Entry Point)
- `login.html` - **HALAMAN UTAMA** (rename menjadi `index.html` saat deploy)
- `login.css` - Styling halaman login
- `login.js` - Logic halaman login

### 👤 Aplikasi User
- `index.html` - Aplikasi buku bank (rename menjadi `app.html` saat deploy)
- `style.css` - Styling aplikasi utama
- `script.js` - Logic aplikasi utama

### ⚙️ Admin Panel
- `admin.html` - Panel administrator
- `admin.css` - Styling admin panel
- `admin.js` - Logic admin panel

## 🚀 Langkah Deployment

### 1. Persiapan File
```bash
# Rename file untuk deployment
login.html → index.html (halaman utama)
index.html → app.html (aplikasi user)
```

### 2. Update Link Internal
Setelah rename, update link di file:

**Di `login.js`:**
```javascript
// Ganti
window.location.href = 'index.html';
// Menjadi
window.location.href = 'app.html';
```

**Di `admin.js`:**
```javascript
// Ganti
window.location.href = 'index.html';
// Menjadi
window.location.href = 'app.html';
```

**Di `script.js`:**
```javascript
// Ganti
window.location.href = 'admin.html?from=main';
// Tetap sama (tidak perlu diubah)
```

### 3. Upload ke Server
Upload semua file ke root directory server web Anda.

## 🎯 Alur Akses Setelah Deployment

### 📱 User Flow
1. **Buka Website** → Halaman Login (`index.html`)
2. **Pilih "Akses Pengguna"** → Aplikasi Buku Bank (`app.html`)
3. **Klik "Dashboard"** → Admin Panel (perlu login)

### ⚙️ Admin Flow
1. **Buka Website** → Halaman Login (`index.html`)
2. **Pilih "Akses Administrator"** → Form Login Admin
3. **Login Berhasil** → Admin Panel (`admin.html`)

## 🔐 Default Credentials

**Administrator:**
- Username: `admin`
- Password: `admin123`

**Catatan:** Ganti kredensial default melalui menu Keamanan di Admin Panel.

## 📊 Fitur yang Tersedia

### 👤 Akses Pengguna
- ✅ Lihat transaksi buku bank
- ✅ Cetak dokumen
- ✅ Akses tanpa login

### ⚙️ Akses Administrator
- ✅ Kelola transaksi
- ✅ Pengaturan madrasah
- ✅ Upload logo
- ✅ Generate laporan
- ✅ Backup & restore data
- ✅ Ubah kredensial admin

## 🛠️ Troubleshooting

### Masalah Umum:
1. **Halaman tidak muncul** → Pastikan `login.html` sudah direname ke `index.html`
2. **Link rusak** → Update semua link internal sesuai panduan
3. **Data tidak tersimpan** → Pastikan browser mendukung localStorage
4. **Logo tidak muncul** → Pastikan file gambar tidak melebihi 2MB

### Browser Support:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 📞 Support

Untuk bantuan teknis, hubungi administrator sistem.

---
© 2025 MAN 2 Kota Tidore Kepulauan