Prompthive — Perpustakaan Prompt AI Komunitas

Menjalankan secara lokal
1. Buka terminal di folder proyek ini.
2. Jalankan server statis, contoh: python3 -m http.server 8000
3. Buka http://localhost:8000/index.html di browser.

Login admin
Username: clara
Password: claraimutcantiklucukawai
Halaman admin: admin.html
Kredensial ini didefinisikan di js/env.js dan .env.example, tidak ditulis langsung di halaman HTML.

Akun contoh untuk uji coba
Username: clara / Password: clara123
Username: raka_dev / Password: raka12345
Username: sinta_art / Password: sinta2026

Penyimpanan data
Data disimpan di localStorage browser, diisi awal dari data/users.json dan data/prompts.json saat pertama kali dibuka. File users.json dan prompts.json di folder root disediakan sesuai struktur proyek.

Deploy ke Vercel
1. Push folder ini ke repository Git.
2. Import project di Vercel, tidak perlu build command karena murni HTML, CSS, JS statis.
3. File vercel.json sudah disediakan untuk konfigurasi routing.
