function renderNavbar(activePage) {
  const mount = document.getElementById("navbarMount");
  if (!mount) return;

  const user = getCurrentUser();

  const links = [
    { href: "index.html", label: "Beranda", key: "beranda" },
    { href: "kategori.html", label: "Kategori", key: "kategori" }
  ];

  const linksHtml = links
    .map((l) => {
      const activeClass = activePage === l.key ? "nav-link active" : "nav-link";
      return '<a href="' + l.href + '" class="' + activeClass + ' text-sm">' + l.label + "</a>";
    })
    .join("");

  const userSection = user
    ? '<div class="flex items-center gap-3">' +
      '<a href="upload.html" class="hidden sm:inline-flex btn-primary text-sm px-4 py-2 rounded-xl">Tambah Prompt</a>' +
      '<a href="profile.html" class="flex items-center gap-2 group">' +
      '<span class="avatar-ring w-9 h-9"><span class="avatar-ring-inner w-full h-full"><img src="' +
      user.avatar +
      '" alt="' +
      user.name +
      '" class="w-full h-full object-cover" /></span></span>' +
      "</a>" +
      '<button id="navLogoutBtn" class="btn-secondary text-sm px-4 py-2 rounded-xl">Keluar</button>' +
      "</div>"
    : '<div class="flex items-center gap-3">' +
      '<a href="login.html" class="nav-link text-sm">Masuk</a>' +
      '<a href="register.html" class="btn-primary text-sm px-4 py-2 rounded-xl">Daftar</a>' +
      "</div>";

  mount.innerHTML =
    '<nav class="sticky top-0 z-40 glass"><div class="max-w-7xl mx-auto px-5 sm:px-8"><div class="flex items-center justify-between h-16">' +
    '<a href="index.html" class="flex items-center gap-2.5">' +
    '<img src="assets/img/logo.svg" alt="Prompthive" class="w-8 h-8" />' +
    '<span class="font-display font-semibold text-lg tracking-tight">Prompthive</span>' +
    "</a>" +
    '<div class="hidden md:flex items-center gap-8">' +
    linksHtml +
    "</div>" +
    userSection +
    '<button id="mobileMenuBtn" class="md:hidden p-2 -mr-2"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg></button>' +
    "</div>" +
    '<div id="mobileMenu" class="hidden md:hidden pb-4 flex flex-col gap-3 border-t border-subtle pt-4">' +
    links.map((l) => '<a href="' + l.href + '" class="nav-link text-sm">' + l.label + "</a>").join("") +
    (user ? '<a href="upload.html" class="nav-link text-sm">Tambah Prompt</a>' : "") +
    "</div>" +
    "</div></nav>";

  const logoutBtn = document.getElementById("navLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

function renderFooter() {
  const mount = document.getElementById("footerMount");
  if (!mount) return;

  const year = new Date().getFullYear();

  mount.innerHTML =
    '<footer class="border-t border-subtle mt-24"><div class="max-w-7xl mx-auto px-5 sm:px-8 py-12">' +
    '<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">' +
    '<div class="flex items-center gap-2.5">' +
    '<img src="assets/img/logo.svg" alt="Prompthive" class="w-7 h-7" />' +
    '<span class="font-display font-semibold">Prompthive</span>' +
    "</div>" +
    '<p class="text-sub text-sm">Perpustakaan prompt yang dikurasi komunitas. &copy; ' +
    year +
    " Prompthive.</p>" +
    '<div class="flex items-center gap-5 text-sm">' +
    '<a href="kategori.html" class="nav-link">Kategori</a>' +
    '<a href="admin.html" class="nav-link">Admin</a>' +
    "</div>" +
    "</div></div></footer>";
}
