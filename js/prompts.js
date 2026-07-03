function formatDate(isoString) {
  const date = new Date(isoString);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
}

function getUserById(userId) {
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getPromptCategories(prompt) {
  if (Array.isArray(prompt.categories) && prompt.categories.length > 0) {
    return prompt.categories;
  }
  return [prompt.category];
}

function buildPromptCard(prompt, index) {
  const author = getUserById(prompt.userId);
  const authorName = author ? author.name : prompt.username;
  const authorAvatar = author ? author.avatar : "assets/img/default-avatar.svg";
  const authorUsername = author ? author.username : prompt.username;
  const delay = (index % 9) * 0.05;
  const categoriesHtml = getPromptCategories(prompt)
    .map((c) => '<span class="chip">' + escapeHtml(c) + "</span>")
    .join("");

  const passwordBlock = prompt.password
    ? '<div class="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg surface-muted text-xs font-mono">' +
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0 text-sub" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>' +
      '<span class="text-sub">Password:</span><span class="font-semibold">' +
      escapeHtml(prompt.password) +
      "</span></div>"
    : "";

  return (
    '<article class="card-prompt surface rounded-2xl p-5 sm:p-6 flex flex-col animate-fade-up" style="animation-delay:' +
    delay +
    's" data-id="' +
    prompt.id +
    '">' +
    '<div class="flex items-center justify-between mb-4">' +
    '<a href="profile.html?user=' +
    authorUsername +
    '" class="flex items-center gap-2.5 group">' +
    '<span class="avatar-ring w-9 h-9"><span class="avatar-ring-inner w-full h-full"><img src="' +
    authorAvatar +
    '" alt="' +
    escapeHtml(authorName) +
    '" class="w-full h-full object-cover" /></span></span>' +
    '<div class="leading-tight"><p class="text-sm font-semibold group-hover:text-indigo-500 transition-colors">' +
    escapeHtml(authorName) +
    '</p><p class="text-xs text-sub font-mono">@' +
    escapeHtml(authorUsername) +
    "</p></div>" +
    "</a>" +
    "</div>" +
    '<h3 class="font-display font-semibold text-lg mb-3 leading-snug">' +
    escapeHtml(prompt.title) +
    "</h3>" +
    '<div class="flex flex-wrap gap-1.5 mb-3">' +
    categoriesHtml +
    "</div>" +
    passwordBlock +
    '<div class="surface-muted rounded-xl p-4 mb-4 flex-1">' +
    '<p class="text-sm text-sub whitespace-pre-wrap leading-relaxed">' +
    escapeHtml(prompt.content) +
    "</p>" +
    "</div>" +
    '<div class="flex items-center justify-between mb-4">' +
    '<span class="text-xs text-sub font-mono">' +
    formatDate(prompt.createdAt) +
    "</span>" +
    '<span class="text-xs text-sub font-mono">#' +
    prompt.id.slice(-6) +
    "</span>" +
    "</div>" +
    '<div class="flex items-center gap-2">' +
    '<button class="copy-btn flex-1 btn-primary text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2" data-id="' +
    prompt.id +
    '">' +
    '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>' +
    "Salin</button>" +
    '<button class="download-btn btn-secondary text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2" data-id="' +
    prompt.id +
    '">' +
    '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
    "</button>" +
    "</div>" +
    "</article>"
  );
}

function copyPromptToClipboard(promptId) {
  const prompts = getPrompts();
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) return;

  const textArea = document.createElement("textarea");
  textArea.value = prompt.content;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt.content);
    } else {
      document.execCommand("copy");
    }
    showToast("Prompt berhasil disalin ke clipboard", "success");
  } catch (err) {
    showToast("Gagal menyalin prompt", "error");
  }

  document.body.removeChild(textArea);
}

function downloadPromptAsFile(promptId) {
  const prompts = getPrompts();
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) return;

  const author = getUserById(prompt.userId);
  const authorName = author ? author.name + " (@" + author.username + ")" : prompt.username;

  let fileContent = "Judul: " + prompt.title + "\n";
  fileContent += "Pembuat: " + authorName + "\n";
  if (prompt.password) {
    fileContent += "Password: " + prompt.password + "\n";
  }
  fileContent += "Kategori: " + prompt.category + "\n";
  fileContent += "Tanggal: " + formatDate(prompt.createdAt) + "\n";
  fileContent += "\n----- ISI PROMPT -----\n\n";
  fileContent += prompt.content + "\n";

  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeTitle = prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  link.download = (safeTitle || "prompt") + ".txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Prompt berhasil diunduh sebagai file .txt", "success");
}

function attachPromptCardEvents(container) {
  container.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyPromptToClipboard(btn.dataset.id);
    });
  });

  container.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      downloadPromptAsFile(btn.dataset.id);
    });
  });
}

function renderEmptyState(container, message) {
  container.innerHTML =
    '<div class="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fade-up">' +
    '<div class="w-20 h-20 rounded-2xl surface-muted flex items-center justify-center mb-5">' +
    '<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9 text-sub" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path></svg>' +
    "</div>" +
    '<h3 class="font-display font-semibold text-lg mb-2">Belum ada prompt</h3>' +
    '<p class="text-sub text-sm max-w-sm">' +
    message +
    "</p>" +
    "</div>";
}

function renderLoadingSkeleton(container, count) {
  let html = "";
  for (let i = 0; i < count; i++) {
    html +=
      '<div class="surface rounded-2xl p-6"><div class="flex items-center gap-3 mb-4"><div class="skeleton w-9 h-9 rounded-full"></div><div class="skeleton h-3 w-24 rounded"></div></div><div class="skeleton h-5 w-3/4 rounded mb-3"></div><div class="skeleton h-24 w-full rounded-xl mb-4"></div><div class="skeleton h-10 w-full rounded-xl"></div></div>';
  }
  container.innerHTML = html;
}
